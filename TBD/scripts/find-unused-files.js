/* eslint-disable */
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const scanRoots = [path.join(repoRoot, 'src'), path.join(repoRoot, 'scripts')];
const codeSearchRoot = repoRoot; // search whole repo for references

const exts = ['.ts', '.tsx', '.js', '.jsx', '.mdx', '.json', '.css'];
const ignoreDirs = new Set(['node_modules', '.git', '.next', 'out', 'dist', 'build', 'public']);

function walk(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    if (ignoreDirs.has(it.name)) continue;
    const full = path.join(dir, it.name);
    if (it.isDirectory()) {
      files.push(...walk(full));
    } else if (exts.includes(path.extname(it.name))) {
      files.push(full);
    }
  }
  return files;
}

function relPosix(p) { return p.split(path.sep).join('/'); }

// Collect all code files to search
const codeFiles = walk(codeSearchRoot);

// Collect target files to evaluate (from scanRoots)
let targetFiles = [];
for (const r of scanRoots) {
  if (fs.existsSync(r)) targetFiles.push(...walk(r));
}

// Helper to determine Next app/page/route files which are auto-used
function isNextAutoUsed(filePath) {
  const rel = path.relative(path.join(repoRoot, 'src'), filePath).split(path.sep).join('/');
  if (rel.startsWith('app/')) {
    const name = path.basename(filePath).toLowerCase();
    // common Next app special files
    const autoNames = ['page.tsx','page.ts','layout.tsx','layout.ts','route.ts','route.tsx','loading.tsx','error.tsx'];
    if (autoNames.includes(name)) return true;
    // files under app that are folders like route handlers named 'route.ts' covered above
  }
  if (rel.startsWith('pages/')) return true; // legacy Next pages are used
  return false;
}

function fileContains(filePath, token) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.indexOf(token) !== -1;
  } catch (e) {
    // ignore unreadable
    return false;
  }
}

const results = [];
for (const f of targetFiles) {
  const relFromSrc = path.relative(path.join(repoRoot, 'src'), f).split(path.sep).join('/');
  const relFromRepo = path.relative(repoRoot, f).split(path.sep).join('/');
  const noExt = relFromRepo.replace(/\.[^.]+$/, '');
  const noExtFromSrc = relFromSrc.replace(/\.[^.]+$/, '');
  const base = path.basename(f).replace(/\.[^.]+$/, '');

  let used = false;

  // auto-used by Next routing
  if (isNextAutoUsed(f)) used = true;

  // if the file is an index barrel used by imports of the directory, be conservative
  if (!used && /index\.(ts|tsx|js|jsx)$/.test(path.basename(f))) {
    // if any code imports the directory path, mark as used
    const dirRel = path.dirname(relFromRepo);
    for (const cf of codeFiles) {
      if (fileContains(cf, dirRel + '/')) { used = true; break; }
    }
  }

  if (!used) {
    // Search for references to the file without extension
    for (const cf of codeFiles) {
      if (path.resolve(cf) === path.resolve(f)) continue;
      // look for relative imports or absolute-ish project imports
      if (fileContains(cf, noExt) || fileContains(cf, noExtFromSrc) || fileContains(cf, base)) {
        used = true;
        break;
      }
    }
  }

  results.push({ file: relFromRepo, used });
}

const used = results.filter(r => r.used).map(r => r.file).sort();
const unused = results.filter(r => !r.used).map(r => r.file).sort();

const out = { summary: { totalScanned: results.length, used: used.length, unused: unused.length }, used, unused };
const outPath = path.join(repoRoot, 'UNUSED_FILES_REPORT.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
console.log('Wrote report to', outPath);
console.log('Summary:', out.summary);
if (unused.length) {
  console.log('\nUnused files:');
  for (const u of unused) console.log('-', u);
} else {
  console.log('\nNo unused files found by this heuristic.');
}

