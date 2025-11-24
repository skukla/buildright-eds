#!/usr/bin/env node

/**
 * HTML Path Validator
 * 
 * Validates that HTML files use correct path patterns:
 * - Root files (index.html) use ./
 * - Subdirectory files (pages/*.html) use ../
 * - No absolute paths in <head>
 * - critical-init.js loads first
 * 
 * Usage: node scripts/tools/validate-html-paths.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

const errors = [];
const warnings = [];

// Patterns to check
const ABSOLUTE_PATH_PATTERN = /(href|src)=["']\/(styles|scripts|blocks|images|fragments)\//g;
const CRITICAL_INIT_PATTERN = /<script[^>]+src=["'][^"']*critical-init\.js["'][^>]*>/;

/**
 * Validate a single HTML file
 */
function validateHTMLFile(filePath, relativePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const headMatch = content.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  
  if (!headMatch) {
    // Only warn about missing <head> for actual page files, not fragments/blocks
    if (!relativePath.includes('/blocks/') && !relativePath.includes('/fragments/')) {
      warnings.push(`${relativePath}: No <head> section found`);
    }
    return;
  }
  
  const head = headMatch[1];
  const isRootFile = !relativePath.includes('/');
  const expectedPrefix = isRootFile ? './' : '../';
  
  // Check for absolute paths in head
  const absolutePaths = [...head.matchAll(ABSOLUTE_PATH_PATTERN)];
  if (absolutePaths.length > 0) {
    absolutePaths.forEach(match => {
      const line = content.substring(0, match.index).split('\n').length;
      errors.push(
        `${relativePath}:${line} - Absolute path found: ${match[0]}\n` +
        `  Expected: ${match[1]}="${expectedPrefix}${match[2]}/..."`
      );
    });
  }
  
  // Check critical-init.js loads first (if present)
  const criticalInitMatch = head.match(CRITICAL_INIT_PATTERN);
  if (criticalInitMatch) {
    const scriptsBeforeCritical = head
      .substring(0, criticalInitMatch.index)
      .match(/<script[^>]+src=/g);
    
    if (scriptsBeforeCritical && scriptsBeforeCritical.length > 0) {
      const line = content.substring(0, criticalInitMatch.index).split('\n').length;
      errors.push(
        `${relativePath}:${line} - Scripts loading before critical-init.js\n` +
        `  critical-init.js must be the FIRST script in <head>`
      );
    }
  }
  
}

/**
 * Find all HTML files recursively
 */
function findHTMLFiles(dir, baseDir = dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);
    
    // Skip node_modules, .git, etc.
    if (entry.name.startsWith('.') || entry.name === 'node_modules') {
      continue;
    }
    
    if (entry.isDirectory()) {
      files.push(...findHTMLFiles(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push({ fullPath, relativePath });
    }
  }
  
  return files;
}

/**
 * Main validation
 */
function main() {
  console.log('🔍 Validating HTML path patterns...\n');
  
  const htmlFiles = findHTMLFiles(rootDir);
  console.log(`Found ${htmlFiles.length} HTML files\n`);
  
  htmlFiles.forEach(({ fullPath, relativePath }) => {
    try {
      validateHTMLFile(fullPath, relativePath);
    } catch (error) {
      errors.push(`${relativePath}: Failed to validate - ${error.message}`);
    }
  });
  
  // Report results
  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:\n');
    warnings.forEach(warning => console.log(`  ${warning}\n`));
  }
  
  if (errors.length > 0) {
    console.log('❌ ERRORS:\n');
    errors.forEach(error => console.log(`  ${error}\n`));
    console.log(`\n❌ Validation failed with ${errors.length} error(s)`);
    console.log('\n📖 See docs/HTML-PATH-PATTERN.md for guidelines\n');
    process.exit(1);
  }
  
  console.log('✅ All HTML files use correct path patterns!\n');
}

main();

