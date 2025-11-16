const fs = require('fs');
const { glob } = require('glob');
const path = require('path');

const srcDir = 'src'; // Adjust this to your source directory
const baseDir = path.resolve(process.cwd(), srcDir);

// Patterns to match import statements
const importPatterns = [
  /from\s+['"](.+)['"]/g,
  /import\s+['"](.+)['"]/g,
  /require\s*\(\s*['"](.+)['"]\s*\)/g
];

// Function to convert relative path to absolute path
function toAbsolutePath(filePath, importPath) {
  if (importPath.startsWith('@')) return importPath; // Already absolute
  const absolutePath = path.resolve(path.dirname(filePath), importPath);
  const relativePath = path.relative(baseDir, absolutePath);
  return '@' + srcDir + '/' + relativePath.replace(/\\/g, '/');
}

// Process a single file
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  importPatterns.forEach(pattern => {
    content = content.replace(pattern, (match, importPath) => {
      if (!importPath.startsWith('.')) return match; // Skip if not relative
      const absolutePath = toAbsolutePath(filePath, importPath);
      modified = true;
      return match.replace(importPath, absolutePath);
    });
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

// Find and process all JavaScript/TypeScript files
async function main() {
  try {
    const files = await glob(`${srcDir}/**/*.{js,jsx,ts,tsx}`);
    files.forEach(processFile);
    console.log('Finished processing files.');
  } catch (err) {
    console.error('Error finding files:', err);
  }
}

// Call the main function
main();