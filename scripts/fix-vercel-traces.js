#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const targetDir = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve('.next');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.nft.json')) {
      files.push(fullPath);
    }
  }
  return files;
}

function normalizeTracePath(p) {
  if (typeof p !== 'string') return p;

  // Vercel can fail if traces contain absolute root paths like /node_modules/...
  if (p.startsWith('/node_modules/')) {
    return p.slice(1);
  }

  // Normalize build-root absolute paths to workspace-relative paths.
  if (p.startsWith('/vercel/path0/')) {
    return p.replace('/vercel/path0/', '');
  }

  return p;
}

if (!fs.existsSync(targetDir)) {
  console.log(`[fix-vercel-traces] Skipping: directory not found: ${targetDir}`);
  process.exit(0);
}

const traceFiles = walk(targetDir);
let updatedFiles = 0;
let updatedEntries = 0;

for (const filePath of traceFiles) {
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    continue;
  }

  if (!Array.isArray(parsed.files)) {
    continue;
  }

  let changed = false;
  const nextFiles = parsed.files.map((entry) => {
    const normalized = normalizeTracePath(entry);
    if (normalized !== entry) {
      changed = true;
      updatedEntries += 1;
    }
    return normalized;
  });

  if (changed) {
    parsed.files = nextFiles;
    fs.writeFileSync(filePath, JSON.stringify(parsed));
    updatedFiles += 1;
  }
}

console.log(
  `[fix-vercel-traces] scanned=${traceFiles.length} updatedFiles=${updatedFiles} updatedEntries=${updatedEntries}`
);
