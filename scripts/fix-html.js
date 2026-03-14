/**
 * Post-build script to fix index.html for file:// protocol compatibility
 *
 * - Removes type="module" from script tags
 * - Ensures CSS is linked properly
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const distDir = join(process.cwd(), 'dist');
const indexPath = join(distDir, 'index.html');

// Read the current index.html
let html = readFileSync(indexPath, 'utf-8');

// Remove type="module" and crossorigin attributes from script tags
html = html.replace(/<script type="module" crossorigin/g, '<script');
html = html.replace(/ crossorigin/g, '');

// Find CSS file in assets
const assetsDir = join(distDir, 'assets');
const files = readdirSync(assetsDir);
const cssFile = files.find(f => f.endsWith('.css'));

// Add CSS link if not present and CSS file exists
if (cssFile && !html.includes('.css')) {
  html = html.replace(
    '</head>',
    `  <link rel="stylesheet" href="./assets/${cssFile}">\n  </head>`
  );
}

// Write the fixed HTML
writeFileSync(indexPath, html);

console.log('Fixed index.html for offline/file:// compatibility');
console.log(`- CSS file: ${cssFile || 'none'}`);
