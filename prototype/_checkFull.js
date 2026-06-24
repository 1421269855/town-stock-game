// Last 500 lines start at line 2002 (0-indexed: 2001).
// Error appears at position 5 of those 500 lines = absolute line 2007.
// But lines 2003-2007 look fine. Let me check more carefully.

const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];
const lines = code.split('\n');

console.log('Total script lines:', lines.length);

// Full range binary search
let lo = 1, hi = lines.length;
while (lo < hi) {
  const mid = Math.floor((lo + hi) / 2);
  try { new Function(lines.slice(0, mid).join('\n')); lo = mid+1; }
  catch(e) { hi = mid; }
}
const errLine = lo;
console.log('First problematic script line:', errLine);
console.log('Line', errLine, ':', JSON.stringify(lines[errLine-1]));
console.log('\nContext:');
for (let j = Math.max(0, errLine-8); j <= Math.min(lines.length-1, errLine+4); j++) {
  console.log((j+1)+':', JSON.stringify(lines[j]));
}

// Also check what line 2007 actual content is (from context)
console.log('\n\nChecking line 2007:', JSON.stringify(lines[2006]));
console.log('Line 2008:', JSON.stringify(lines[2007]));
console.log('Line 2009:', JSON.stringify(lines[2008]));
