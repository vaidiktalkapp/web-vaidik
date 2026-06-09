const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src');
const EN_JSON_PATH = path.join(__dirname, '../src/dictionaries/en.json');

// Safely find all code files without external libraries
function getAllFiles(dirPath, arrayOfFiles = []) {
    if (!fs.existsSync(dirPath)) return arrayOfFiles;
    const files = fs.readdirSync(dirPath);
    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            arrayOfFiles.push(fullPath);
        }
    });
    return arrayOfFiles;
}

const files = getAllFiles(SRC_DIR);

let enJson = {};
if (fs.existsSync(EN_JSON_PATH)) {
    enJson = JSON.parse(fs.readFileSync(EN_JSON_PATH, 'utf8'));
}

// Regex to safely find `t('nav.home')` or `t("nav.home")` usage in React code
const regex = /t\(['"`](.*?)['"`]\)/g;
let newKeysAdded = 0;

function setNestedValue(obj, pathString) {
    const keys = pathString.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
    }
    const lastKey = keys[keys.length - 1];
    
    // If the exact key is completely missing in en.json, we add it!
    if (current[lastKey] === undefined) {
        // We set the placeholder value beautifully (e.g. nav.home_page -> Home Page)
        const placeholder = lastKey.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        current[lastKey] = placeholder;
        newKeysAdded++;
        console.log(`  + Found missing key in code: "${pathString}". Added to en.json!`);
    }
}

console.log('🔍 Scanning completely safe React code for t("...") translation keys...\n');

files.forEach(file => {
    const code = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = regex.exec(code)) !== null) {
        const key = match[1];
        // Ignore dynamic template strings like t(`error_${code}`)
        if (key && !key.includes('${')) { 
            setNestedValue(enJson, key);
        }
    }
});

if (newKeysAdded > 0) {
    fs.writeFileSync(EN_JSON_PATH, JSON.stringify(enJson, null, 2), 'utf8');
    console.log(`\n✅ Finished! ${newKeysAdded} new keys were automatically safely appended to en.json`);
} else {
    console.log(`✅ en.json is absolutely perfectly up to date. No new keys found in code.`);
}
