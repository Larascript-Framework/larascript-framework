#!/usr/bin/env node
import fs from "fs";
import path from "path";

/**
 * Check if a file is a TypeScript/JavaScript file that should be exported
 */
function isExportableFile(filename) {
  const ext = path.extname(filename);
  return (
    [".ts", ".js", ".tsx", ".jsx"].includes(ext) &&
    filename !== "index.ts" &&
    filename !== "index.js"
  );
}

/**
 * Get all exportable files in a directory
 */
function getExportableFiles(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    return files.filter((file) => isExportableFile(file));
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error.message);
    return [];
  }
}

/**
 * Parse index.ts file to get current exports
 */
function getCurrentExports(indexPath) {
  try {
    if (!fs.existsSync(indexPath)) {
      return [];
    }

    const content = fs.readFileSync(indexPath, "utf8");
    const exportLines = content
      .split("\n")
      .filter((line) => line.trim().startsWith("export"))
      .map((line) => {
        // Extract the file name from export statements
        const match = line.match(/from\s+["']\.\/([^"']+)["']/);
        return match ? match[1] : null;
      })
      .filter(Boolean);

    return exportLines;
  } catch (error) {
    console.error(`Error reading ${indexPath}:`, error.message);
    return [];
  }
}

/**
 * Check exports for a specific directory
 */
function checkDirectoryExports(dirPath) {
  const dirName = path.basename(dirPath);
  const indexPath = path.join(dirPath, "index.ts");

  console.log(`\n📁 Checking ${dirName}/`);

  // Get all exportable files in the directory
  const exportableFiles = getExportableFiles(dirPath);

  if (exportableFiles.length === 0) {
    console.log(`   ℹ️  No exportable files found in ${dirName}/`);
    return { hasIssues: false, missing: [] };
  }

  // Get current exports from index.ts
  const currentExports = getCurrentExports(indexPath);

  // Find missing exports
  const missing = exportableFiles.filter((file) => {
    const baseName = path.basename(file, path.extname(file));
    return !currentExports.some((exportPath) => {
      // Handle both cases: with and without .ts extension
      const exportBaseName = path.basename(
        exportPath,
        path.extname(exportPath),
      );
      // Also check if the export path matches the file name without extension
      return exportBaseName === baseName || exportPath === baseName;
    });
  });

  if (missing.length > 0) {
    console.log(`   ❌ Missing exports in ${dirName}/index.ts:`);
    missing.forEach((file) => {
      console.log(`      - ${file}`);
    });
    return { hasIssues: true, missing };
  } else {
    // console.log(`   ✅ All files in ${dirName}/ are properly exported`);
    return { hasIssues: false, missing: [] };
  }
}

/**
 * Main function
 */
function main() {
  const srcPath = path.join(process.cwd(), "src");

  if (!fs.existsSync(srcPath)) {
    console.error("❌ src directory not found");
    process.exit(1);
  }

  console.log("🔍 Checking exports in src/ directories...\n");

  // Get all directories in src, excluding tests
  const dirs = fs
    .readdirSync(srcPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory() && dirent.name !== "tests")
    .map((dirent) => path.join(srcPath, dirent.name));

  if (dirs.length === 0) {
    console.log("ℹ️  No directories found in src/ (excluding tests)");
    return;
  }

  let hasAnyIssues = false;
  const allMissing = [];

  // Check each directory
  dirs.forEach((dirPath) => {
    const result = checkDirectoryExports(dirPath);
    if (result.hasIssues) {
      hasAnyIssues = true;
      allMissing.push({
        directory: path.basename(dirPath),
        missing: result.missing,
      });
    }
  });

  // Summary
  console.log("\n📊 Summary:");
  if (hasAnyIssues) {
    console.log("❌ Export issues found:");
    allMissing.forEach(({ directory, missing }) => {
      console.log(`   ${directory}/: ${missing.length} missing export(s)`);
    });
    console.log(
      "\n💡 To fix, add the missing exports to the respective index.ts files.",
    );
    process.exit(1);
  } else {
    console.log("✅ All directories properly export their files!");
  }
}

// Run the script
if (import.meta.main === true) {
  main();
}

export default {
  main,
  checkDirectoryExports,
  getExportableFiles,
  getCurrentExports,
};
