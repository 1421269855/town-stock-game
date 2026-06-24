// All balanced. The "Unexpected token ')'" might come from a regex literal.
// Let's check: when lines 1-604 parse OK, but adding line 605 causes "Unexpected token ')'",
// it means the parser's STATE at the end of line 604 is NOT a clean statement boundary.
// e.g., the parser thinks it's in the middle of an expression.
//
// This can happen if CFG.EVENTS choices array contains a string that
// gets misinterpreted as containing a regex. Let's just try to eval from a fresh context.

const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];

// Instead of new Function (which is strict), let's use a different approach:
// find what token is at position 605 that causes the unexpected )
// The error "Unexpected token )" is a parse error.
// Let's see what `new Function` actually says for 1-605:
const lines = code.split('\n');
for (let n = 603; n <= 605; n++) {
  try {
    new Function(lines.slice(0, n).join('\n'));
    console.log('Up to line', n, ': OK');
  } catch(e) {
    console.log('Up to line', n, ': ERROR -', e.message);
  }
}

// Let's try adding just the comment line
console.log('\nLine 604 content:', JSON.stringify(lines[603]));
console.log('Line 605 content:', JSON.stringify(lines[604]));

// Try with comment replaced
const testCode = lines.slice(0, 603).join('\n') + '\n// EVENTS\n' + lines[604];
try {
  new Function(testCode);
  console.log('\nWith comment replaced: OK');
} catch(e) {
  console.log('\nWith comment replaced: ERROR -', e.message);
}
