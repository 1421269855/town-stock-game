const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];
const lines = code.split('\n');

// Find all lines where depth goes negative
let depth = 0;
let inStr = false, strChar = '';
let inLineComment = false, inBlockComment = false;
let problems = [];

for (let i = 0; i < code.length; i++) {
  const c = code[i];
  const prev = i > 0 ? code[i-1] : '';
  
  if (inLineComment) {
    if (c === '\n') inLineComment = false;
    continue;
  }
  if (inBlockComment) {
    if (c === '*' && code[i+1] === '/') { inBlockComment = false; i++; }
    continue;
  }
  if (inStr) {
    if (c === '\\') { i++; continue; }
    if (c === strChar) inStr = false;
    continue;
  }
  
  if (c === '"' || c === "'" || c === '`') { inStr = true; strChar = c; continue; }
  if (c === '/' && code[i+1] === '/') { inLineComment = true; i++; continue; }
  if (c === '/' && code[i+1] === '*') { inBlockComment = true; i++; continue; }
  
  if (c === '{') depth++;
  if (c === '}') {
    depth--;
    if (depth < 0) {
      const lineNo = code.substring(0, i).split('\n').length;
      problems.push({ lineNo, depth, char: '}' });
      depth = 0; // reset so we can find more
    }
  }
}

console.log('Final depth:', depth);
console.log('Problems found:', problems.length);
problems.forEach(p => {
  console.log('  Extra } at script line', p.lineNo, ':', lines[p.lineNo - 1]);
});

if (problems.length === 0) {
  // Try to narrow down differently using new Function
  let lo = 1, hi = lines.length;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    try { new Function(lines.slice(0, mid).join('\n')); lo = mid + 1; }
    catch (e) { hi = mid; }
  }
  console.log('\nSyntax error binary search -> script line', lo);
  console.log('Line', lo, ':', lines[lo - 1]);
  // Show context
  for (let j = Math.max(0, lo - 6); j <= Math.min(lines.length - 1, lo + 3); j++) {
    console.log((j + 1) + ': ' + lines[j]);
  }
}
