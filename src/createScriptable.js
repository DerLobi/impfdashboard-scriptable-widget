const fs = require('fs');

const scriptable = JSON.parse(fs.readFileSync('./scriptable/Impfdashboard.scriptable', 'utf8'));

const originalScript = fs.readFileSync('./scriptable/Impfdashboard.js', 'utf8');
let output = originalScript.split('\n');

for (let i = 0; i < 3; i += 1) {
  output.shift();
}

output = output.join('\n');

scriptable.script = output;

fs.writeFileSync('./scriptable/Impfdashboard.scriptable', JSON.stringify(scriptable));
