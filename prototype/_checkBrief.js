// The error is caused by something I just added. Let me check the showDailyBrief function
// by finding what contains unbalanced parens or malformed strings.

const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];

// Find where showDailyBrief is
const idx = code.indexOf('function showDailyBrief');
console.log('showDailyBrief starts at code position:', idx);
const lineNo = code.substring(0, idx).split('\n').length;
console.log('showDailyBrief starts at script line:', lineNo);

// Extract the function
const funcCode = code.substring(idx, idx + 5000);
const lines = funcCode.split('\n');
console.log('\nFirst 20 lines of showDailyBrief:');
for (let i = 0; i < Math.min(20, lines.length); i++) {
  console.log((lineNo + i) + ': ' + lines[i]);
}

// Check for problematic substrings (unescaped quotes in strings)
// The HTML building with + signs might have issues with apostrophes
const apostrophePatterns = funcCode.match(/html \+= '[^']*'[^;,]+/g) || [];
console.log('\nLong string concat lines with potential apostrophes:', apostrophePatterns.length);
