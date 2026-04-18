const fs = require('fs');
const path = require('path');

function processFile(p) {
    if ((p.endsWith('.tsx') || p.endsWith('.ts') || p.endsWith('.css')) && fs.existsSync(p)) {
        let content = fs.readFileSync(p, 'utf8');
        let newContent = content
            .replace(/#7C3AED/ig, '#A78BFA')
            .replace(/#5B21B6/ig, '#7C3AED')
            .replace(/124,\s*58,\s*237/g, '167, 139, 250')
            .replace(/rgba\(124,58,237/g, 'rgba(167,139,250'); 
        
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
