#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix specific syntax errors
const fixes = [
  // Fix broken property access patterns
  {
    pattern: /result\.\(error as Error\)\.message/g,
    replacement: '(result.error as Error).message'
  },

  // Fix broken property access in other contexts
  {
    pattern: /(\w+)\.\(error as Error\)\.message/g,
    replacement: '($1.error as Error).message'
  }
];

// Files to process
const srcDir = './src';

function getAllTsxFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllTsxFiles(fullPath));
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  for (const fix of fixes) {
    const newContent = content.replace(fix.pattern, fix.replacement);
    if (newContent !== content) {
      content = newContent;
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
  }
}

// Process all files
const files = getAllTsxFiles(srcDir);
console.log(`Processing ${files.length} files...`);

for (const file of files) {
  try {
    fixFile(file);
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
}

console.log('Done!');
