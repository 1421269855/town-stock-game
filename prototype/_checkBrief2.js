// The error is "Unexpected token ')'" at "var CFG = {" line 6 using binary search.
// But we know lines 1-604 are OK and the showDailyBrief function starts at line 2254.
// The binary search result "line 6" is almost certainly a false alarm due to the 
// parser getting confused by an unclosed string starting very early in CFG.
//
// Let me check: does adding showDailyBrief introduce an unclosed quote?
// The issue is probably in html += lines where I use things like:
// '本周资产变动' or similar Chinese characters that contain apostrophe lookalikes.
//
// Actually, let me check line by line in the new code:

const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];
const lines = code.split('\n');

// Test from showDailyBrief start to end
const briefStart = 2253; // 0-indexed
let lo = briefStart, hi = lines.length;
while (lo < hi) {
  const mid = Math.floor((lo + hi) / 2);
  try { new Function(lines.slice(0, mid).join('\n')); lo = mid + 1; }
  catch(e) { hi = mid; }
}
console.log('Error appears at script line:', lo);
console.log('Line', lo, ':', lines[lo-1]);
console.log('\nContext (', lo-5, '-', lo+3, '):');
for (let j = Math.max(0, lo-6); j <= Math.min(lines.length-1, lo+3); j++) {
  console.log((j+1)+':', JSON.stringify(lines[j]));
}
