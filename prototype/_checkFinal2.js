// The binary search says error appears at script line 2253 when adding the comment.
// But line 2251 = end of _doAdvanceCore, line 2252 = blank, line 2253 = comment.
// 
// This suggests: lines 1-2252 parse OK, but adding ANY new line causes error.
// That can't be right... unless lines 1-2252 end in an unclosed context.
//
// Wait: earlier we showed that lines 1-604 -> OK; 1-605 -> fails.
// But the full script is OK? That's the binary search false positive issue:
// when a program A ends in an "open" state (awaiting more input), adding 
// unrelated code B might make A+B parse as if B is inside A's expression.
//
// Actually NO - the full script parses OK! Let me re-run _checkFinal.js after
// the recent edits.

const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];
try {
  new Function(code);
  console.log('ENTIRE SCRIPT: OK ✅');
} catch(e) {
  console.log('ENTIRE SCRIPT ERROR:', e.message);
  
  // Also try with acorn for better error positions
  const lines = code.split('\n');
  
  // Test last 500 lines (the new code we added)
  const lastN = lines.slice(-500);
  try {
    new Function(lastN.join('\n'));
    console.log('Last 500 lines alone: OK');
  } catch(e2) {
    console.log('Last 500 lines alone: ERROR:', e2.message);
    let lo = 0, hi = lastN.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      try { new Function(lastN.slice(0, mid).join('\n')); lo = mid+1; }
      catch(e3) { hi = mid; }
    }
    console.log('Error in last 500 lines at position', lo, '(abs line', lines.length-500+lo, ')');
    console.log('Line:', lastN[lo-1]);
    for (let j = Math.max(0, lo-5); j <= Math.min(lastN.length-1, lo+3); j++) {
      console.log((lines.length-500+j+1)+':', JSON.stringify(lastN[j]));
    }
  }
}
