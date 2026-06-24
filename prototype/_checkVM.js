const fs = require('fs');
const html = fs.readFileSync('D:/游戏/小镇股票交易所_GDD/prototype/index.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
const code = m[1];

// Use Node's vm module to get accurate error with line number
const vm = require('vm');
try {
  vm.compileFunction(code, [], { filename: 'game.js' });
  console.log('Script OK ✅');
} catch(e) {
  console.log('Error:', e.message);
  const stack = e.stack;
  console.log('Stack:', stack.split('\n').slice(0,5).join('\n'));
  
  // Get line number from V8 error
  const lines = code.split('\n');
  const lineMatch = stack.match(/game\.js:(\d+)/);
  if (lineMatch) {
    const errLine = parseInt(lineMatch[1]);
    console.log('\nError at script line:', errLine);
    for (let j = Math.max(0, errLine-6); j <= Math.min(lines.length-1, errLine+4); j++) {
      console.log((j+1)+':', lines[j]);
    }
  }
}
