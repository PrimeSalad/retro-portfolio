const fs = require('fs');
const path = require('path');

const filePath = 'backend/data/portfolio.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

function fixPath(p) {
    if (!p || typeof p !== 'string') return p;
    // Remove leading slash if any to normalize
    let clean = p.startsWith('/') ? p.substring(1) : p;
    // Replace spaces with underscores for the filename part
    clean = clean.replace(/ /g, '_');
    // Ensure it starts with images/
    if (!clean.startsWith('images/')) {
        clean = 'images/' + clean;
    }
    // Return with leading slash
    return '/' + clean;
}

if (data.images) {
    data.images.forEach(item => {
        item.src = fixPath(item.src);
    });
}

if (data.projects) {
    data.projects.forEach(p => {
        p.image = fixPath(p.image);
        if (p.thumbnail) p.thumbnail = fixPath(p.thumbnail);
    });
}

if (data.certs) {
    data.certs.forEach(c => {
        c.image = fixPath(c.image);
        c.link = fixPath(c.link);
    });
}

if (data.gallery) {
    data.gallery.forEach(item => {
        item.image = fixPath(item.image);
    });
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('Portfolio JSON updated successfully');
