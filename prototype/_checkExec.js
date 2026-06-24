// The unbalanced parens are just multi-line constructs (IIFE and event listener).
// That's expected. Now let me try a completely different approach:
// Parse the script using Node's module.wrap() which is what browsers do essentially.
// Or better: use eval() in a try-catch to get the actual V8 error with line info.

const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];

// Write the script to a file and try to require it
fs.writeFileSync('_testscript.js', 'var document={getElementById:function(){return {innerHTML:"",textContent:"",className:"",style:{},value:"",childNodes:[],children:[],querySelector:function(){return null},querySelectorAll:function(){return {forEach:function(){}}},addEventListener:function(){},setAttribute:function(){},getAttribute:function(){return null}}},querySelector:function(){return null},querySelectorAll:function(){return {forEach:function(){}}},addEventListener:function(){}};\nvar localStorage={getItem:function(){return null},setItem:function(){},removeItem:function(){}};\nvar window={location:{search:""}};\nvar URLSearchParams=function(s){this.get=function(){return null}};\nvar setTimeout=function(){};\nvar setInterval=function(){};\nvar alert=function(){};\nvar confirm=function(){return false};\nvar location={search:""};\n' + code);
try {
  require('./_testscript.js');
  console.log('Script executed OK ✅');
} catch(e) {
  console.log('Script ERROR:', e.message);
  // Node's require gives us stack info
  const stack = e.stack;
  const lineMatch = stack.match(/_testscript\.js:(\d+)/);
  if (lineMatch) {
    const errLineNum = parseInt(lineMatch[1]) - 16; // subtract the 16 preamble lines
    console.log('Error at script line approximately:', errLineNum);
    const lines = code.split('\n');
    for (let j = Math.max(0, errLineNum-6); j <= Math.min(lines.length-1, errLineNum+4); j++) {
      console.log((j+1)+':', lines[j]);
    }
  }
  console.log('\nFull stack:', stack);
}
