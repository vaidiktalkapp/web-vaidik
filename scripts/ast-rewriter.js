const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

const SRC_DIR = path.join(__dirname, '../src/app/(main)');

function processFile(filePath) {
    const code = fs.readFileSync(filePath, 'utf8');
    
    // SAFETY CHECK: ONLY PROCESS CLIENT COMPONENTS
    if (!code.includes("'use client'") && !code.includes('"use client"')) {
        console.log(`⏩ Skipping (Not a Client Component): ${path.basename(filePath)}`);
        return;
    }

    let ast;
    try {
        ast = parser.parse(code, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript']
        });
    } catch (e) {
        console.error(`❌ Failed to parse ${filePath}`);
        return;
    }

    let modified = false;
    let hasUseTranslationImport = false;
    let hasTHook = false;
    
    const extractionKeysMap = {};

    traverse(ast, {
        ImportDeclaration(p) {
            if (p.node.source.value === '@/context/LanguageContext') {
                hasUseTranslationImport = true;
            }
        },
        VariableDeclarator(p) {
            if (p.node.id.type === 'ObjectPattern') {
                p.node.id.properties.forEach(prop => {
                    if (prop.key && prop.key.name === 't') {
                        hasTHook = true;
                    }
                });
            }
        },
        JSXText(p) {
            let text = p.node.value;
            // Trim whitespace/newlines
            const trimmed = text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
            // Skip empty, pure numbers, tiny symbols, or already translated text
            if (trimmed.length > 2 && /[a-zA-Z]/.test(trimmed)) {
                // Generate a safe key name: "Generate Your Kundli" -> "generate_your_kundli"
                let keyName = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 30);
                if (keyName.endsWith('_')) keyName = keyName.slice(0, -1);
                
                // Prepend filename to avoid global clashes: "kundli.generate_your"
                const pageName = path.basename(path.dirname(filePath)).replace(/[^a-zA-Z0-9]/g, '_') || 'global';
                const fullKey = `${pageName}.${keyName}`;
                
                extractionKeysMap[fullKey] = trimmed;

                // Replace <p>Hello</p> with <p>{t('kundli.hello')}</p>
                p.replaceWith(
                    t.jsxExpressionContainer(
                        t.callExpression(t.identifier('t'), [t.stringLiteral(fullKey)])
                    )
                );
                
                // Add surrounding newlines back if they were originally there to preserve some formatting
                if (text.startsWith('\n')) {
                    p.insertBefore(t.jsxText('\n'));
                }
                if (text.endsWith('\n')) {
                    p.insertAfter(t.jsxText('\n'));
                }

                modified = true;
            }
        }
    });

    if (modified) {
        // Generate new code, trying to keep original formatting somewhat intact
        let finalCode = generate(ast, {
            retainLines: true,
            compact: false,
        }).code;
        
        if (!hasUseTranslationImport) {
            // Need to insert after 'use client'
            finalCode = finalCode.replace(/('use client';|"(?:use client)";)/, `$1\nimport { useTranslation } from '@/context/LanguageContext';`);
        }

        if (!hasTHook) {
            // Smart inject hook after component signature
            // Matches: const Page = () => {  OR  export default function Page() {
            finalCode = finalCode.replace(/(export default function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*\{|const\s+[A-Za-z0-9_]+\s*=\s*\([^)]*\)\s*=>\s*\{)/, 
                `$1\n    const { t } = useTranslation();\n`);
        }

        fs.writeFileSync(filePath, finalCode, 'utf8');
        
        // Append safely to en.json
        const enPath = path.join(__dirname, '../src/dictionaries/en.json');
        let enJson = JSON.parse(fs.readFileSync(enPath, 'utf8'));
        
        Object.keys(extractionKeysMap).forEach(fullKey => {
            const [domain, exactKey] = fullKey.split('.');
            if (!enJson[domain]) enJson[domain] = {};
            if (!enJson[domain][exactKey]) {
                enJson[domain][exactKey] = extractionKeysMap[fullKey];
            }
        });
        
        fs.writeFileSync(enPath, JSON.stringify(enJson, null, 2), 'utf8');
        console.log(`✅ Successfully synthesized and Translated JSX Text Nodes in: ${path.basename(filePath)}`);
    } else {
        console.log(`⏩ No new text found to extract in: ${path.basename(filePath)}`);
    }
}

const filesToProcess = [];

function getAllFiles(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const files = fs.readdirSync(dirPath);
    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            filesToProcess.push(fullPath);
        }
    });
}

console.log(`🚀 Starting AST Mass Injection Protocol across entire website...`);
getAllFiles(SRC_DIR);
filesToProcess.forEach(file => processFile(file));
console.log(`✨ All eligible UI files processed successfully.`);
