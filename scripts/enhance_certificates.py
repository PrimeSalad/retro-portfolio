"""Create faithful, scan-style previews from photographed certificates.

The originals are never modified. This script only performs deterministic
perspective correction, conservative white balance, contrast, and sharpening.
"""

from pathlib import Path

import cv2
import numpy as np


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "frontend" / "public" / "images" / "certificate"
OUTPUT_DIR = SOURCE_DIR / "enhanced"

# Corners are measured on the existing photographs in this order:
# top-left, top-right, bottom-right, bottom-left. They trace the document edge,
# not its printed content, so no names, seals, signatures, or text are removed.
DOCUMENT_CORNERS = {
    "codemaster_award_-_dost.jpg": ((20, 18), (3518, 24), (3518, 2548), (4, 2505)),
    "DICT_Hack4Gov_4.jpg": ((45, 4), (3365, 26), (3393, 2300), (0, 2240)),
    "emerging_leader_award_-dost.jpg": ((127, 84), (3476, 127), (3570, 2540), (54, 2293)),
    "ICITE2025_International_Conference_on_Information_Technology_Education.jpg": ((6, 4), (1145, 1), (1168, 796), (1, 790)),
    "technical_execellence_-dost.jpg": ((65, 20), (3475, 20), (3485, 2460), (0, 2315)),
    "top_achiever_and_best_project_execution_award_-_dost.jpg": ((82, 8), (3466, 83), (3467, 2382), (0, 2265)),
}


def perspective_scan(image: np.ndarray, corners: tuple[tuple[int, int], ...]) -> np.ndarray:
    source = np.asarray(corners, dtype=np.float32)
    top_left, top_right, bottom_right, bottom_left = source

    width = int(max(np.linalg.norm(top_right - top_left), np.linalg.norm(bottom_right - bottom_left)))
    height = int(max(np.linalg.norm(bottom_left - top_left), np.linalg.norm(bottom_right - top_right)))
    destination = np.asarray(
        ((0, 0), (width - 1, 0), (width - 1, height - 1), (0, height - 1)),
        dtype=np.float32,
    )
    matrix = cv2.getPerspectiveTransform(source, destination)
    return cv2.warpPerspective(image, matrix, (width, height), flags=cv2.INTER_LANCZOS4)


def neutralize_paper(image: np.ndarray) -> np.ndarray:
    """Remove camera color cast without forcing designed cream areas to white."""
    working = image.astype(np.float32)
    highlights = np.percentile(working.reshape(-1, 3), 88, axis=0)
    target = float(np.mean(highlights))
    gains = np.clip(target / np.maximum(highlights, 1.0), 0.94, 1.06)
    return np.clip(working * gains, 0, 255).astype(np.uint8)


def restore_document(image: np.ndarray) -> np.ndarray:
    balanced = neutralize_paper(image)

    lab = cv2.cvtColor(balanced, cv2.COLOR_BGR2LAB)
    lightness, channel_a, channel_b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=1.25, tileGridSize=(12, 12))
    local_contrast = clahe.apply(lightness)
    lightness = cv2.addWeighted(lightness, 0.58, local_contrast, 0.42, 0)
    restored = cv2.cvtColor(cv2.merge((lightness, channel_a, channel_b)), cv2.COLOR_LAB2BGR)

    # A restrained unsharp mask improves photographed type without inventing detail.
    blur = cv2.GaussianBlur(restored, (0, 0), 1.0)
    restored = cv2.addWeighted(restored, 1.18, blur, -0.18, 0)

    max_width = 2200
    if restored.shape[1] > max_width:
        scale = max_width / restored.shape[1]
        restored = cv2.resize(restored, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA)
    return restored


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for filename, corners in DOCUMENT_CORNERS.items():
        source = SOURCE_DIR / filename
        image = cv2.imread(str(source), cv2.IMREAD_COLOR)
        if image is None:
            raise FileNotFoundError(source)

        scanned = perspective_scan(image, corners)
        restored = restore_document(scanned)
        destination = OUTPUT_DIR / filename.replace(".jpg", "-enhanced.jpg")
        if not cv2.imwrite(str(destination), restored, (cv2.IMWRITE_JPEG_QUALITY, 92)):
            raise RuntimeError(f"Could not write {destination}")
        print(f"{source.name} -> {destination.name} ({restored.shape[1]}x{restored.shape[0]})")


if __name__ == "__main__":
    main()
