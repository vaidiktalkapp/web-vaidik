const fs = require('fs');
const path = require('path');

const DICT_DIR = path.join(__dirname, '../src/dictionaries');
const EN_JSON_PATH = path.join(DICT_DIR, 'en.json');

if (!fs.existsSync(EN_JSON_PATH)) {
    console.error('❌ Cannot find en.json in src/dictionaries/');
    process.exit(1);
}

const sourceData = JSON.parse(fs.readFileSync(EN_JSON_PATH, 'utf8'));

// Safely flattens nested objects so we can compare deeply (e.g. { common: { home: "a" } } -> { 'common.home': "a" })
function flattenObj(obj, parent = '', res = {}) {
    for (let key in obj) {
        const propName = parent ? parent + '.' + key : key;
        if (typeof obj[key] == 'object' && obj[key] !== null) {
            flattenObj(obj[key], propName, res);
        } else {
            res[propName] = obj[key];
        }
    }
    return res;
}

const enKeys = Object.keys(flattenObj(sourceData));
const targetFiles = fs.readdirSync(DICT_DIR).filter(f => f.endsWith('.json') && f !== 'en.json');

console.log('🔍 Validating language dictionaries across all files...\n');

let allGood = true;

targetFiles.forEach(file => {
    const filePath = path.join(DICT_DIR, file);
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const targetKeysAll = flattenObj(data);
        
        const missingKeys = [];
        enKeys.forEach(k => {
            if (targetKeysAll[k] === undefined) {
                missingKeys.push(k);
            }
        });

        if (missingKeys.length === 0) {
            console.log(`✅ ${file} — ${enKeys.length} / ${enKeys.length} keys COMPLETE`);
        } else {
            allGood = false;
            console.log(`⚠️ ${file} — MISSING ${missingKeys.length} keys:`);
            missingKeys.forEach(mk => console.log(`   → ${mk}`));
        }
    } catch (e) {
        allGood = false;
        console.log(`❌ ${file} — Failed to read or parse (Invalid JSON format)`);
    }
});

if (allGood) {
    console.log('\n🎉 Validation Passed! All dictionaries are perfectly synced.');
} else {
    console.log('\n❌ Validation Failed! Please run auto-translate script to fix missing keys.');
    process.exit(1);
}
