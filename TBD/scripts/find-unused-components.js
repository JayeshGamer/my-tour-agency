/* eslint-disable */
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const srcRoot = path.join(repoRoot, 'src');
const componentsRoot = path.join(srcRoot, 'components');

function walk(dir, exts) {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    const full = path.join(dir, it.name);
    if (it.isDirectory()) {
      files.push(...walk(full, exts));
    } else if (exts.includes(path.extname(it.name))) {
      files.push(full);
    }
  }
  return files;
}

function relPosix(p) {
  return p.split(path.sep).join('/');
}

if (!fs.existsSync(componentsRoot)) {
  console.error('No src/components folder found.');
  process.exit(2);
}

const compFiles = walk(componentsRoot, ['.tsx', '.ts', '.jsx', '.js']);
const codeFiles = walk(srcRoot, ['.tsx', '.ts', '.jsx', '.js', '.mdx']);

// Read index barrel files in component dirs
const indexCache = {}; // dir -> content
for (const f of compFiles) {
  const dir = path.dirname(f);
  if (!indexCache[dir]) {
    const indexTs = path.join(dir, 'index.ts');
    const indexTsx = path.join(dir, 'index.tsx');
    let c = null;
    if (fs.existsSync(indexTs)) c = fs.readFileSync(indexTs, 'utf8');
    else if (fs.existsSync(indexTsx)) c = fs.readFileSync(indexTsx, 'utf8');
    indexCache[dir] = c;
  }
}

function fileContains(filePath, token) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.indexOf(token) !== -1;
  } catch (e) {
    console.error('Error reading file', filePath, e);
    return false;
  }
}

const results = [];
for (const f of compFiles) {
  const rel = path.relative(srcRoot, f); // components/....tsx
  const relNoExt = rel.replace(/\.[^.]+$/, ''); // components/.../name
  const posixRelNoExt = relPosix(relNoExt);
  const dir = path.dirname(f);
  const dirRel = path.relative(srcRoot, dir).split(path.sep).join('/'); // components/ui

  let used = false;
  for (const cf of codeFiles) {
    if (path.resolve(cf) === path.resolve(f)) continue;
    // check direct import path: 'components/ui/button'
    if (fileContains(cf, posixRelNoExt)) {
      used = true;
      break;
    }
  }

  if (!used) {
    // check directory barrel usage: search for imports of the directory and check if index exports this file
    // first, does any file import the directory (e.g., 'components/ui')?
    let dirImported = false;
    for (const cf of codeFiles) {
      if (fileContains(cf, dirRel)) {
        dirImported = true;
        break;
      }
    }
    if (dirImported) {
      const idxContent = indexCache[dir];
      if (idxContent) {
        const baseName = path.basename(relNoExt);
        // check for export of this component from index files
        if (idxContent.indexOf("'./" + baseName) !== -1 || idxContent.indexOf('"./' + baseName) !== -1 || idxContent.indexOf('./' + baseName) !== -1) {
          used = true;
        }
      }
    }
  }

  results.push({ file: relPosix(rel), used });
}

const usedList = results.filter(r => r.used).map(r => r.file).sort();
const unusedList = results.filter(r => !r.used).map(r => r.file).sort();

const out = {
  summary: {
    totalComponents: results.length,
    used: usedList.length,
    unused: unusedList.length
  },
  used: usedList,
  unused: unusedList
};

const outPath = path.join(repoRoot, 'COMPONENTS_UNUSED_REPORT.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
console.log('Wrote report to', outPath);
console.log('Summary:', out.summary);

// Also print unused list to stdout for convenience
if (unusedList.length) {
  console.log('\nUnused components:');
  for (const u of unusedList) console.log('-', u);
} else {
  console.log('\nNo unused components found by this heuristic.');
}
