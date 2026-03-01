// Script to fix the corrupted MasterDashboard.tsx file
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/views/MasterDashboard.tsx');

// Read the file
const content = fs.readFileSync(filePath, 'utf8');

// Split by lines
const lines = content.split('\n');

// Find the line that contains the corruption (line 1704, which is index 1703)
// It should start with "}\" followed by escape sequences
// We need to keep lines 0-1702 (indices), then add a clean closing brace

// Keep everything up to and including line 1703 (index 1702 which ends with ");")
const goodLines = lines.slice(0, 1703);

// Add the closing brace
goodLines.push('}');

// Write back
const fixedContent = goodLines.join('\n') + '\n';
fs.writeFileSync(filePath, fixedContent, 'utf8');

console.log('Fixed MasterDashboard.tsx successfully!');
console.log(`Original lines: ${lines.length}`);
console.log(`Fixed lines: ${goodLines.length + 1}`); // +1 for the final newline
