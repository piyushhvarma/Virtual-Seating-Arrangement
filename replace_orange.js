const fs = require('fs');
const path = require('path');

function processFile(p) {
    if (p.endsWith('.tsx') || p.endsWith('.ts') || p.endsWith('.css')) {
        let content = fs.readFileSync(p, 'utf8');
        let newContent = content
            .replace(/--orange-dim/g, '--brand-dim')
            .replace(/--orange/g, '--brand')
            .replace(/badge-orange/g, 'badge-brand')
            .replace(/glow-orange/g, 'glow-brand')
            .replace(/#E07B39/ig, '#06B6D4')
            .replace(/#B85C20/ig, '#0891B2')
            .replace(/224,\s*123,\s*57/g, '6, 182, 212')
            .replace(/rgba\(224,123,57/g, 'rgba(6,182,212')
            .replace(/orange/g, 'brand'); // blanket word replacement for any stray 'orange' strings, var(--orange) becomes var(--brand) gracefully.
        
        if (content !== newContent) {
            fs.writeFileSync(p, newContent);
            console.log(`Updated ${p}`);
        }
    }
}

function walk(dir) {
    fs.readdirSync(dir).forEach(f => {
        let p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) {
            walk(p);
        } else {
            processFile(p);
        }
    });
}

walk(path.join(__dirname, 'src'));
console.log('Done!');
