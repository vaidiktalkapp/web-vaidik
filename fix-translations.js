const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'src/dictionaries/en.json');
const hiPath = path.join(__dirname, 'src/dictionaries/hi.json');

let en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
let hi = JSON.parse(fs.readFileSync(hiPath, 'utf8'));

function getKeys(dir, keys = new Set()) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getKeys(fullPath, keys);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const regex = /t\(['"]([^'"]+)['"]\)/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        keys.add(match[1]);
      }
    }
  }
  return keys;
}

const allKeys = getKeys(path.join(__dirname, 'src'));
let modified = false;

allKeys.forEach(key => {
  const parts = key.split('.');
  let currentEn = en;
  let currentHi = hi;
  let missing = false;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (i === parts.length - 1) {
      if (currentEn[part] === undefined) {
        currentEn[part] = part.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        missing = true;
      }
      if (currentHi && currentHi[part] === undefined) {
        currentHi[part] = currentEn[part];
        missing = true;
      }
    } else {
      if (currentEn[part] === undefined) {
        currentEn[part] = {};
        missing = true;
      }
      if (currentHi && currentHi[part] === undefined) {
        currentHi[part] = {};
        missing = true;
      }
      currentEn = currentEn[part];
      currentHi = currentHi ? currentHi[part] : null;
    }
  }
  if (missing) console.log('Added missing key:', key);
});

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(hiPath, JSON.stringify(hi, null, 2));

console.log('Dictionaries updated successfully. Total unique keys checked:', allKeys.size);
