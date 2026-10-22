/**
 * One-off helper: reads the bikes[] and RENTAL_EXTRAS[] arrays straight out of the
 * existing frontend (assets/js/app.js) and writes prisma/data/*.json for the seed.
 * It only READS the frontend; it never modifies it.
 *
 * Usage: node scripts/extract-frontend-data.js [path/to/assets/js/app.js]
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const appJs = path.resolve(process.argv[2] || path.join(__dirname, '..', '..', 'assets', 'js', 'app.js'));
const src = fs.readFileSync(appJs, 'utf8');

function grabArray(startToken) {
  const i = src.indexOf(startToken);
  if (i === -1) throw new Error(`"${startToken}" not found in ${appJs}`);
  const open = src.indexOf('[', i);
  let depth = 0;
  let inStr = null;
  let esc = false;
  for (let k = open; k < src.length; k++) {
    const c = src[k];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      inStr = c;
      continue;
    }
    if (c === '[') depth++;
    if (c === ']' && --depth === 0) {
      return vm.runInNewContext('(' + src.slice(open, k + 1) + ')', { getAsset: (f) => f });
    }
  }
  throw new Error(`Unterminated array after "${startToken}"`);
}

const bikes = grabArray('const bikes = [').map((b) => ({
  id: b.id,
  name: b.name,
  brand: b.brand,
  type: b.type,
  pricePerDay: b.price,
  deposit: b.deposit,
  rating: String(b.rating),
  fuel: b.fuel,
  transmission: b.transmission,
  available: b.available !== false,
  imgFile: b.imgFile,
  engine: b.engine,
  power: b.power,
  torque: b.torque,
  weight: b.weight,
  seat: b.seat,
  topSpeed: b.topSpeed,
  fuelCap: b.fuelCap,
  extra: { aiMatch: b.aiMatch, dna: b.dna, stars: b.stars },
}));

const extras = grabArray('const RENTAL_EXTRAS = [').map((e) => ({
  id: e.id,
  name: e.name,
  pricePerDay: e.price,
}));

const ids = new Set(bikes.map((b) => b.id));
if (ids.size !== bikes.length) throw new Error('Duplicate bike ids in frontend data');

const out = path.join(__dirname, '..', 'prisma', 'data');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'bikes.json'), JSON.stringify(bikes, null, 2) + '\n');
fs.writeFileSync(path.join(out, 'extras.json'), JSON.stringify(extras, null, 2) + '\n');
console.log(`Wrote ${bikes.length} bikes and ${extras.length} extras to ${out}`);
