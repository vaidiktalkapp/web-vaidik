const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const excludedPatterns = ['PdfGenerator', '.next', 'node_modules'];

walkDir(srcDir, (filePath) => {
    if (excludedPatterns.some(p => filePath.includes(p))) return;
    if (!filePath.match(/\.(tsx|ts|js|jsx|css|scss)$/)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // 1. Replace Tailwind 'italic' class
    // Matches ' italic', 'italic ', or '"italic"'
    // We need to be careful with words that contain italic but aren't the class
    // Tailwind classes are usually in className="..." or class="..."
    content = content.replace(/className=(["'])(.*?)\bitalic\b(.*?)\1/g, (match, quote, before, after) => {
        let newClasses = (before + after).replace(/\s+/g, ' ').trim();
        return `className=${quote}${newClasses}${quote}`;
    });

    // 2. Replace font-style: italic in CSS
    content = content.replace(/font-style:\s*italic;?/g, 'font-style: normal;');
    content = content.replace(/fontStyle:\s*['"]italic['"]/g, "fontStyle: 'normal'");

    // 3. Handle <em> tags - adding not-italic if it has className, or wrapping in span if simple
    // Actually, simpler to just replace <em> with <span> if we want to be thorough, 
    // but the user just said "italic texts", so let's target the styling.
    
    if (content !== originalContent) {
        console.log(`Updating ${filePath}`);
        fs.writeFileSync(filePath, content, 'utf8');
    }
});

console.log('Italic removal complete.');
