const fs = require('fs');
const path = require('path');

function processFile(p) {
    if ((p.endsWith('.tsx') || p.endsWith('.ts') || p.endsWith('.css')) && fs.existsSync(p)) {
        let content = fs.readFileSync(p, 'utf8');
        let newContent = content
            .replace(/#06B6D4/ig, '#7C3AED')
            .replace(/#0891B2/ig, '#5B21B6')
            .replace(/6,\s*182,\s*212/g, '124, 58, 237')
            .replace(/rgba\(6,182,212/g, 'rgba(124,58,237'); 
        
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
