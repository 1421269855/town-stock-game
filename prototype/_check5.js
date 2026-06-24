// The CFG closes at line 218, and lines 1-604 are OK.
// But the full script fails when encountering "tryEvent" at line 605.
// This means the issue is in lines 218-604.
// Let me check: does the EVENTS array have nested choices with string issues?

const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];
const lines = code.split('\n');

// Check: can we parse lines 1-604 as complete code?
try {
  new Function(lines.slice(0, 604).join('\n'));
  console.log('Lines 1-604 parses OK');
} catch(e) {
  console.log('Lines 1-604 ERROR:', e.message);
}

// What about 1-605?
try {
  new Function(lines.slice(0, 605).join('\n'));
  console.log('Lines 1-605 parses OK');
} catch(e) {
  console.log('Lines 1-605 ERROR:', e.message);
}

// Check 600-610 in isolation
console.log('\nLines 599-611:');
for (let i = 598; i <= 610; i++) {
  console.log((i+1)+':', lines[i]);
}
