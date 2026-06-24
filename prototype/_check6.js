// "Lines 1-604 parses OK" but "Lines 1-605 ERROR: Unexpected token ')'"
// The comment on line 604 is: /* ========== M3: EVENTS ========== */
// But wait - could the EVENTS array in CFG contain unbalanced parens in choice strings?
// Let's check the choices text in CFG.EVENTS

const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];
const lines = code.split('\n');

// Count parens in lines 1 through 605
let depth = 0;
let inStr = false, strChar = '';
let inLineComment = false, inBlockComment = false;

for (let i = 0; i < code.length; i++) {
  const c = code[i];
  
  if (inLineComment) { if (c === '\n') inLineComment = false; continue; }
  if (inBlockComment) {
    if (c === '*' && code[i+1] === '/') { inBlockComment = false; i++; }
    continue;
  }
  if (inStr) {
    if (c === '\\') { i++; continue; }
    if (c === strChar && strChar !== '`') { inStr = false; continue; }
    if (strChar === '`' && c === '`') { inStr = false; continue; }
    continue;
  }
  
  if (c === '"' || c === "'" || c === '`') { inStr = true; strChar = c; continue; }
  if (c === '/' && code[i+1] === '/') { inLineComment = true; i++; continue; }
  if (c === '/' && code[i+1] === '*') { inBlockComment = true; i++; continue; }
  
  if (c === '(') depth++;
  if (c === ')') {
    depth--;
    if (depth < 0) {
      const lineNo = code.substring(0, i).split('\n').length;
      console.log('EXTRA ) at script line', lineNo, ':', lines[lineNo-1]);
      console.log('Context:', JSON.stringify(code.substring(Math.max(0,i-60), i+40)));
      depth = 0;
    }
  }
}
console.log('Final paren depth:', depth);

// Check square brackets too
depth = 0; inStr = false; inLineComment = false; inBlockComment = false;
for (let i = 0; i < code.length; i++) {
  const c = code[i];
  if (inLineComment) { if (c === '\n') inLineComment = false; continue; }
  if (inBlockComment) { if (c === '*' && code[i+1] === '/') { inBlockComment = false; i++; } continue; }
  if (inStr) { if (c === '\\') { i++; continue; } if (c === strChar) { inStr = false; } continue; }
  if (c === '"' || c === "'" || c === '`') { inStr = true; strChar = c; continue; }
  if (c === '/' && code[i+1] === '/') { inLineComment = true; i++; continue; }
  if (c === '/' && code[i+1] === '*') { inBlockComment = true; i++; continue; }
  if (c === '[') depth++;
  if (c === ']') { depth--; if (depth < 0) { const ln = code.substring(0,i).split('\n').length; console.log('EXTRA ] at line',ln); depth=0; } }
}
console.log('Final bracket depth:', depth);
