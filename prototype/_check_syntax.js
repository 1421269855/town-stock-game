const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];
const lines = code.split('\n');

// Binary search for syntax error
let lo = 1, hi = lines.length;
while (lo < hi) {
  let mid = Math.floor((lo + hi) / 2);
  try {
    new Function(lines.slice(0, mid).join('\n'));
    lo = mid + 1;
  } catch (e) {
    hi = mid;
  }
}
console.log('Error appears near script line', lo);
console.log('Line', lo, ':', lines[lo - 1]);
console.log('\nContext:');
for (let j = Math.max(0, lo - 5); j <= Math.min(lines.length - 1, lo + 3); j++) {
  console.log((j + 1) + ': ' + lines[j]);
}
