const fs = require('fs');
const path = require('path');

function processFile(p) {
    if ((p.endsWith('.tsx') || p.endsWith('.ts') || p.endsWith('.css')) && fs.existsSync(p)) {
        let content = fs.readFileSync(p, 'utf8');
        let newContent = content
            .replace(/#A78BFA/ig, '#10B981')
            .replace(/#7C3AED/ig, '#059669')
            .replace(/167,\s*139,\s*250/g, '16, 185, 129')
            .replace(/rgba\(167,139,250/g, 'rgba(16,185,129'); 
        
        if (content !== newContent) {
            fs.writeFileSync(p, newContent);
            console.log(`Updated ${p}`);
        }
    }
}

function walk(dir) {
    if (!fs.existsSync(dir)) return;
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
processFile(path.join(__dirname, 'tailwind.config.ts'));
console.log('Done!');
