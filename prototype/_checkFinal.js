// OK so 1-604 is OK, and 1-605 fails. But 605-end is also OK alone.
// This means there's a SPECIFIC interaction. Let me try a completely clean approach.
// 
// The real question: does the entire script have a syntax error?
// Let me test the ENTIRE script with new Function.

const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];

try {
  new Function(code);
  console.log('ENTIRE SCRIPT: OK ✅');
} catch(e) {
  console.log('ENTIRE SCRIPT ERROR:', e.message);
  
  // Do binary search with the FULL code
  const lines = code.split('\n');
  let lo = 1, hi = lines.length;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    try { new Function(lines.slice(0, mid).join('\n')); lo = mid + 1; }
    catch(e2) { hi = mid; }
  }
  console.log('Binary search error at script line:', lo);
  console.log('Line:', lines[lo-1]);
  
  // Show context
  console.log('\nContext:');
  for (let j = Math.max(0, lo-8); j <= Math.min(lines.length-1, lo+4); j++) {
    console.log((j+1)+':', lines[j]);
  }
}
