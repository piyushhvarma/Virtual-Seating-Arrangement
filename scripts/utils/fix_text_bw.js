const fs = require('fs');
const path = require('path');

function processFile(p) {
    if ((p.endsWith('.tsx') || p.endsWith('.ts')) && fs.existsSync(p)) {
        let content = fs.readFileSync(p, 'utf8');
        
        let newContent = content.replace(/className="(.*?)text-white(.*?)"/g, (match, prefix, suffix) => {
            return `className="${prefix}text-[color:var(--primary-inv)]${suffix}"`;
        });
        // Also fix the style for text-white in badge if any. Actually, "text-white" in tailwind overrides any text color. We changed it to an arbitrary var color to maintain contrast.

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
console.log('Done fixing text-white!');
