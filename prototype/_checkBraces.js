const fs = require('fs');
const html = fs.readFileSync('D:/游戏/小镇股票交易所_GDD/prototype/index.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];
const lines = code.split('\n');

// Accurate brace counting (respecting strings and comments)
let depth = 0;
let inStr = false, strChar = '';
let inLineComment = false, inBlockComment = false;
let maxDepth = 0;
let history = []; // track all { and }

for (let i = 0; i < code.length; i++) {
  const c = code[i];
  
  if (inLineComment) { if (c === '\n') inLineComment = false; continue; }
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
  
  if (c === '{') {
    depth++;
    const ln = code.substring(0, i).split('\n').length;
    history.push({ type: '{', depth, line: ln, content: lines[ln-1].trim().substring(0, 80) });
  }
  if (c === '}') {
    depth--;
    const ln = code.substring(0, i).split('\n').length;
    history.push({ type: '}', depth, line: ln, content: lines[ln-1].trim().substring(0, 80) });
  }
}

console.log('Final brace depth:', depth);
if (depth > 0) {
  // Find unmatched opening braces
  let stack = [];
  depth = 0; inStr = false; inLineComment = false; inBlockComment = false;
  for (let i = 0; i < code.length; i++) {
    const c = code[i];
    if (inLineComment) { if (c === '\n') inLineComment = false; continue; }
    if (inBlockComment) { if (c === '*' && code[i+1] === '/') { inBlockComment = false; i++; } continue; }
    if (inStr) { if (c === '\\') { i++; continue; } if (c === strChar) inStr = false; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = true; strChar = c; continue; }
    if (c === '/' && code[i+1] === '/') { inLineComment = true; i++; continue; }
    if (c === '/' && code[i+1] === '*') { inBlockComment = true; i++; continue; }
    if (c === '{') {
      const ln = code.substring(0, i).split('\n').length;
      stack.push({ line: ln, content: lines[ln-1].trim().substring(0, 80) });
    }
    if (c === '}') {
      if (stack.length > 0) stack.pop();
    }
  }
  console.log('\nUnclosed { braces:');
  stack.forEach(s => console.log('  Line', s.line+':', s.content));
}
