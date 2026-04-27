/**
 * One-off: verify file / file-link paths in CSVs exist (non-x order rows).
 * Run: node scripts/check-csv-assets.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function parseCSVLine(line) {
  const result = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"' && !inQ) inQ = true;
    else if (c === '"' && inQ && line[i + 1] === '"') {
      cur += '"';
      i++;
    } else if (c === '"' && inQ) inQ = false;
    else if (c === ',' && !inQ) {
      result.push(cur);
      cur = '';
    } else cur += c;
  }
  result.push(cur);
  return result;
}

function parseCSV(text) {
  const body = text.replace(/^\uFEFF/, '');
  const lines = body.split(/\r?\n/).map((l) => l.replace(/\r$/, '')).filter((l) => l.trim() !== '');
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const vals = parseCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = (vals[i] || '').trim();
    });
    return obj;
  });
}

function isSkip(order) {
  return String(order || '')
    .trim()
    .toLowerCase() === 'x';
}

function check(csvName, fileKeys) {
  const full = path.join(root, csvName);
  const text = fs.readFileSync(full, 'utf8');
  const rows = parseCSV(text);
  const missing = [];
  rows.forEach((row, idx) => {
    const lineNo = idx + 2;
    if (isSkip(row.order)) return;
    for (const fk of fileKeys) {
      const fp = (row[fk] || '').trim();
      if (!fp) continue;
      if (/^https?:\/\//i.test(fp)) continue;
      const tgt = path.join(root, ...fp.split('/'));
      if (!fs.existsSync(tgt) || !fs.statSync(tgt).isFile()) {
        missing.push({ lineNo, col: fk, path: fp, title: (row.title || row.Title || '').slice(0, 60) });
      }
    }
  });
  return missing;
}

let exit = 0;
for (const [name, keys] of [
  ['corpus-data.csv', ['file']],
]) {
  console.log(`=== ${name} ===`);
  const m = check(name, keys);
  if (!m.length) {
    console.log('OK: all non-empty file paths exist for non-x rows.\n');
  } else {
    exit = 1;
    m.forEach((x) => {
      console.log(`MISSING line ${x.lineNo} [${x.col}] ${x.path}`);
      if (x.title) console.log(`  title: ${x.title}`);
    });
    console.log('');
  }
}
process.exit(exit);
