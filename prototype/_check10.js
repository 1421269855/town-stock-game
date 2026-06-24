// Lines 1-604 OK. Lines 605-end OK. But TOGETHER they fail.
// This means the CONTEXT at end of lines 1-604 leaves the parser
// in a state that makes "function tryEvent() {" invalid.
//
// This is almost certainly because:
// - Lines 1-604 end in the middle of a string (but new Function says OK?)
// - OR lines 1-604 end without a semicolon and the next "function" is ASI-ambiguous
//
// Actually, wait. Let me re-check: new Function("lines 1-604") says OK,
// meaning it's a COMPLETE valid program. But a complete valid program 
// ending in a completed expression, followed by "function tryEvent() {"
// should ALSO be valid.
//
// UNLESS: there's a regex literal issue. In certain contexts, / can be
// a division operator. If line 604 ends an expression like a regex,
// then "function tryEvent() {" might be parsed as 
// regex / function_keyword_parsed_as_identifier ... /tryEvent() {}
// which would be division: (prev expression) / (tryEvent) () {} 
// That would give "Unexpected token ')'" because after /tryEvent you can't have ()
//
// The comment "/* ========== M3: EVENTS ========== */" - block comment, no issue.
// But the PIE_COLORS line added earlier: var PIE_COLORS = [...]
// Then renderHoldingsPie function.
// Then renderAssetChart function.
// 
// Wait - let me look at what ends the "lines 1-604" block to find the actual issue.
// Line 604 = index 603 = "/* ========== M3: EVENTS ========== */"
// So lines 1-603 are the actual code. What's on line 603?

const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];
const lines = code.split('\n');

console.log('Total lines:', lines.length);

// Check what the issue is by testing 1-603 vs 1-604
try { new Function(lines.slice(0,603).join('\n')); console.log('1-603: OK'); }
catch(e) { console.log('1-603: ERROR:', e.message); }

try { new Function(lines.slice(0,604).join('\n')); console.log('1-604: OK'); }
catch(e) { console.log('1-604: ERROR:', e.message); }

// What's on lines 596-603?
console.log('\nLines 596-605:');
for (let i = 595; i <= 604; i++) {
  console.log((i+1)+':', JSON.stringify(lines[i]));
}

// Key question: is the whole file actually ONE script tag?
const scriptMatches = [...html.matchAll(/<script[\s\S]*?<\/script>/g)];
console.log('\nNumber of script elements:', scriptMatches.length);
scriptMatches.forEach((sm, idx) => {
  console.log('Script', idx, 'at position', sm.index, 'length', sm[0].length);
  console.log('  Content preview:', JSON.stringify(sm[0].substring(0, 80)));
});
