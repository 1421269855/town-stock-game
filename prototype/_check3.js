const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];

// The issue is that brace depth is 0 but new Function still fails.
// This means there's an issue BEFORE tryEvent line 605.
// Let's try: code up to line 604 (excluding tryEvent)
const lines = code.split('\n');
const chunk = lines.slice(0, 604).join('\n');
try {
  new Function(chunk);
  console.log('Lines 1-604 OK');
} catch(e) {
  console.log('Lines 1-604 ERROR:', e.message);
}

// So the error is in lines 1-604
// Binary search within that range
let lo = 1, hi = 604;
while (lo < hi) {
  const mid = Math.floor((lo + hi) / 2);
  try { new Function(lines.slice(0, mid).join('\n')); lo = mid + 1; }
  catch(e) { hi = mid; }
}
console.log('\nError at script line:', lo);
console.log('Line', lo, ':', lines[lo-1]);
console.log('\nContext (lines', lo-6, 'to', lo+3, '):');
for (let j = Math.max(0, lo-7); j <= Math.min(lines.length-1, lo+3); j++) {
  console.log((j+1)+':', lines[j]);
}
