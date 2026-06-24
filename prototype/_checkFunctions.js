// The binary search always reports line 6 "var CFG = {" as the problematic line.
// This is a red herring from the binary search algorithm when there's a 
// STRUCTURAL issue that makes each prefix parse OK but some INTERACTION causes a problem.
//
// The real approach: scan for specific issues in my new code.
// Let me search for the actual issue by testing chunks of the script.

const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];
const lines = code.split('\n');

// Test full script
try {
  new Function(code);
  console.log('FULL SCRIPT OK ✅');
} catch(e) {
  console.log('FULL SCRIPT ERROR:', e.message, '\n');
  
  // Try to find which function has the issue by testing each function in isolation
  // Find all function declarations
  const funcRe = /^function\s+(\w+)\s*\(/mg;
  const functions = [];
  let fm;
  while ((fm = funcRe.exec(code)) !== null) {
    functions.push({ name: fm[1], pos: fm.index, line: code.substring(0, fm.index).split('\n').length });
  }
  
  console.log('Functions found:', functions.length);
  
  // Test each function from the NEWLY ADDED ones (from line 2253 onwards)
  const newFuncs = functions.filter(f => f.line >= 2253);
  console.log('New functions added (from line 2253):', newFuncs.map(f => f.name + '@' + f.line).join(', '));
  
  for (const fn of newFuncs) {
    // Find end of this function
    const funcStart = fn.pos;
    let depth = 0;
    let inStr = false, strChar = '';
    let funcEnd = funcStart;
    for (let i = funcStart; i < code.length; i++) {
      const c = code[i];
      if (inStr) { if (c === '\\') { i++; continue; } if (c === strChar) inStr = false; continue; }
      if (c === '"' || c === "'" || c === '`') { inStr = true; strChar = c; continue; }
      if (c === '{') depth++;
      if (c === '}') { depth--; if (depth === 0) { funcEnd = i; break; } }
    }
    const funcCode = code.substring(funcStart, funcEnd + 1);
    try {
      new Function(funcCode);
      // console.log(fn.name + ': OK');
    } catch(e2) {
      console.log(fn.name + '@' + fn.line + ': ERROR:', e2.message);
      // Show problematic area
      const flines = funcCode.split('\n');
      let flo = 1, fhi = flines.length;
      while (flo < fhi) {
        const mid = Math.floor((flo + fhi) / 2);
        try { new Function(flines.slice(0, mid).join('\n')); flo = mid+1; }
        catch(e3) { fhi = mid; }
      }
      console.log('  Error at function line', flo, '(abs script line', fn.line + flo - 1, ')');
      console.log('  Line:', JSON.stringify(flines[flo-1]));
      // Show context
      for (let j = Math.max(0, flo-4); j <= Math.min(flines.length-1, flo+2); j++) {
        console.log('  '+(j+1)+':', JSON.stringify(flines[j]));
      }
    }
  }
}
