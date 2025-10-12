/* eslint-disable */
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const tbdRoot = path.join(repoRoot, 'TBD');
if (!fs.existsSync(tbdRoot)) fs.mkdirSync(tbdRoot);

const compReport = path.join(repoRoot, 'COMPONENTS_UNUSED_REPORT.json');
const filesReport = path.join(repoRoot, 'UNUSED_FILES_REPORT.json');

function readJson(p) {
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8').replace(/^\/\/.+\n/, '')); } catch (e) { return null; }
}

const comp = readJson(compReport);
const files = readJson(filesReport);

const unused = new Set();
if (comp && Array.isArray(comp.unused)) comp.unused.forEach(x => unused.add(x));
if (files && Array.isArray(files.unused)) files.unused.forEach(x => unused.add(x));

const moved = [];
const missing = [];

for (const rel of Array.from(unused).sort()) {
  // normalize rel to use repo-relative path; the reports list paths like 'components/...'
  let srcRel = rel;
  if (!srcRel.startsWith('src' + path.sep) && !srcRel.startsWith('scripts' + path.sep) && !srcRel.startsWith('components' + path.sep)) {
    // some entries start with 'components/...' so prefer src/components mapping
    if (srcRel.startsWith('components/')) srcRel = path.join('src', srcRel);
  }
  // also handle paths that already start with 'src/' in the files report
  if (srcRel.startsWith('src/') || srcRel.startsWith('src\\')) {
    // OK
  }

  // convert posix slashes to platform
  srcRel = srcRel.split('/').join(path.sep);
  const srcPath = path.join(repoRoot, srcRel);
  if (!fs.existsSync(srcPath)) {
    missing.push(srcRel);
    continue;
  }

  const destPath = path.join(tbdRoot, srcRel);
  const destDir = path.dirname(destPath);
  fs.mkdirSync(destDir, { recursive: true });
  try {
    fs.renameSync(srcPath, destPath);
    moved.push({ from: srcRel, to: path.relative(repoRoot, destPath) });
  } catch (e) {
    // fallback to copy+unlink
    try {
      fs.copyFileSync(srcPath, destPath);
      fs.unlinkSync(srcPath);
      moved.push({ from: srcRel, to: path.relative(repoRoot, destPath), copied: true });
    } catch (err) {
      missing.push(srcRel + ' (error moving: ' + err.message + ')');
    }
  }
}

const log = [];
log.push('Moved files:');
moved.forEach(m => log.push('- ' + m.from + ' -> ' + m.to + (m.copied ? ' (copied)' : '')));
log.push('');
log.push('Missing / not found:');
missing.forEach(m => log.push('- ' + m));

fs.writeFileSync(path.join(tbdRoot, 'move-log.txt'), log.join('\n'), 'utf8');
console.log('Moved:', moved.length, 'Missing:', missing.length);
console.log('Move log written to TBD/move-log.txt');

