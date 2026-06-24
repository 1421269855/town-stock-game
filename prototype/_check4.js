const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];
const lines = code.split('\n');

// Lines 1-604 is OK individually. But the whole script fails at line 605.
// This means the CFG object starting on line 6 is unclosed (no closing '}' 
// before line 605 context). Let's check CFG depth.

// Extract CFG.EVENTS section specifically
const cfgStart = code.indexOf('var CFG = {');
const eventsStart = code.indexOf('EVENTS:');
const eventsCtx = code.substring(eventsStart, eventsStart + 50000);

// Find where EVENTS array ends
let depth = 0;
let eventsEnd = -1;
let inStr = false, strChar = '';
for (let i = 0; i < eventsCtx.length; i++) {
  const c = eventsCtx[i];
  if (inStr) {
    if (c === '\\') { i++; continue; }
    if (c === strChar) inStr = false;
    continue;
  }
  if (c === '"' || c === "'" || c === '`') { inStr = true; strChar = c; continue; }
  if (c === '[') depth++;
  if (c === ']') {
    depth--;
    if (depth === 0) { eventsEnd = i; break; }
  }
}

console.log('EVENTS array ends at offset', eventsEnd, 'from EVENTS: start');
const cfgAfterEvents = eventsCtx.substring(eventsEnd, eventsEnd + 200);
console.log('After EVENTS closing ]:', JSON.stringify(cfgAfterEvents));

// Now find where CFG object closes
const cfgCtx = code.substring(cfgStart);
depth = 0;
let cfgEnd = -1;
inStr = false;
for (let i = 0; i < cfgCtx.length; i++) {
  const c = cfgCtx[i];
  if (inStr) {
    if (c === '\\') { i++; continue; }
    if (c === strChar) inStr = false;
    continue;
  }
  if (c === '"' || c === "'" || c === '`') { inStr = true; strChar = c; continue; }
  if (c === '{') depth++;
  if (c === '}') {
    depth--;
    if (depth === 0) { cfgEnd = i; break; }
  }
}
const cfgEndLine = code.substring(0, cfgStart + cfgEnd).split('\n').length;
console.log('\nCFG object closes at script line', cfgEndLine);
console.log('CFG close context:', JSON.stringify(cfgCtx.substring(cfgEnd - 30, cfgEnd + 60)));
