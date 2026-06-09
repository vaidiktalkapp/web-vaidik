const fs = require('fs');
const path = require('path');
const https = require('https');

// Define 10 target languages (ISO 639-1)
// hi: Hindi, mr: Marathi, gu: Gujarati, bn: Bengali, ta: Tamil, te: Telugu, kn: Kannada, pa: Punjabi, ml: Malayalam
const TARGET_LANGS = ['hi', 'mr', 'gu', 'bn', 'ta', 'te', 'kn', 'pa', 'ml'];

const DICT_DIR = path.join(__dirname, '../src/dictionaries');
const SOURCE_FILE = path.join(DICT_DIR, 'en.json');

function fetchTranslation(text, targetLang) {
    return new Promise((resolve, reject) => {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    let translatedText = '';
                    if (parsed && parsed[0]) {
                        parsed[0].forEach(p => {
                            if (p[0]) translatedText += p[0];
                        });
                    }
                    resolve(translatedText || text);
                } catch(e) {
                    resolve(text);
                }
            });
        }).on('error', (e) => reject(e));
    });
}

async function translateObject(sourceObj, targetLang, existingTargetObj) {
    const result = {};
    const keys = Object.keys(sourceObj);
    for (const key of keys) {
        if (typeof sourceObj[key] === 'string') {
            // If we already translated this key before, keep the old translation!
            // This prevents overwriting manual edits and saves API calls.
            if (existingTargetObj && existingTargetObj[key]) {
                result[key] = existingTargetObj[key];
            } else {
                try {
                    process.stdout.write(`  Translating [${targetLang}] -> '${key}'... `);
                    const translated = await fetchTranslation(sourceObj[key], targetLang);
                    console.log(`✓ (${translated})`);
                    result[key] = translated;
                    
                    // Small delay to prevent Google from blocking us for spam
                    await new Promise(r => setTimeout(r, 200));
                } catch (e) {
                    console.log(`❌ Failed. Keeping English.`);
                    result[key] = sourceObj[key];
                }
            }
        } else if (typeof sourceObj[key] === 'object' && sourceObj[key] !== null) {
            result[key] = await translateObject(sourceObj[key], targetLang, existingTargetObj ? existingTargetObj[key] : null);
        }
    }
    return result;
}

async function main() {
    console.log('🚀 Starting Automated Multi-Language Dictionary Sync...\n');
    
    if (!fs.existsSync(SOURCE_FILE)) {
        console.error('❌ Cannot find en.json in src/dictionaries/');
        return;
    }

    const sourceData = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf8'));

    for (const lang of TARGET_LANGS) {
        console.log(`🌐 Syncing Language: ${lang.toUpperCase()}`);
        
        const outFile = path.join(DICT_DIR, `${lang}.json`);
        let existingData = {};
        if (fs.existsSync(outFile)) {
            existingData = JSON.parse(fs.readFileSync(outFile, 'utf8'));
        }

        const finalData = await translateObject(sourceData, lang, existingData);
        
        fs.writeFileSync(outFile, JSON.stringify(finalData, null, 2), 'utf8');
        console.log(`✅ Saved ${outFile}\n`);
    }

    console.log('🎉 All dictionaries fully translated and synchronized!');
}

main();
