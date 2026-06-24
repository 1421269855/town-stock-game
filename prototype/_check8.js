// Lines 1-604 OK, but adding "function tryEvent() {" causes "Unexpected token ')'
// This is bizarre. Let me check if the PARSER state at end of line 604 is weird.
// Actually: could the comment contain something that acts as a division regex?
// "/* ========== M3: EVENTS ========== */" - no, that's a block comment.
//
// Wait - tryEvent() { -- this is a function declaration. Unexpected token ')' means
// parser sees: "function tryEvent" then "(" then ")" and then "{" - the ")" is unexpected.
// This means the parser thinks we're in an expression context where ')' is not valid.
// 
// Could this be a regex like /tryEvent/ being parsed as a regex?
// Actually more likely: the preceding code ended with an operator that makes
// the parser interpret "function" as a function EXPRESSION, and then tryEvent as 
// an identifier, and () as a call. But that doesn't make sense either.
//
// Let me check what's at the END of line 604 (line index 603 - the 604th line).
// And look for any = or return or ( at end of code before that.

const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];
const lines = code.split('\n');

// Print last 20 lines of "lines 1-604" that parse OK
console.log('Lines 585-604:');
for (let i = 584; i <= 603; i++) {
  console.log((i+1)+':', JSON.stringify(lines[i]));
}

// Also try: what if we trim the \r?
const codeNoCR = code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
const linesCR = codeNoCR.split('\n');
try {
  new Function(linesCR.slice(0, 605).join('\n'));
  console.log('\nWith \\r removed, lines 1-605: OK!');
} catch(e) {
  console.log('\nWith \\r removed, lines 1-605: ERROR -', e.message);
}
