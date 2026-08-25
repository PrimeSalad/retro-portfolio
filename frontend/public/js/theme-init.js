try {
  const savedTheme = localStorage.getItem("gene-portfolio-theme");
  if (savedTheme === "dark" || savedTheme === "light") {
    document.documentElement.dataset.theme = savedTheme;
  }
} catch {
  /* Keep the light default when storage is unavailable. */
}
