#!/usr/bin/env node
// Validates zip.js and data.js. Zero dependencies: run `node scripts/validate.js`.
// Exits 1 with a message per problem if any check fails.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const TOLERANCE = 1.5; // allowed deviation of percentage sums from 100

// Load a classic <script> file and return the listed top-level consts.
function load(file, names) {
  const src = fs.readFileSync(path.join(ROOT, file), "utf8");
  return new Function(src + "\nreturn {" + names.join(",") + "};")();
}
const { ZIP } = load("zip.js", ["ZIP"]);
const { CD, SD, AD, MAYOR } = load("data.js", ["CD", "SD", "AD", "MAYOR"]);

// ---- Coverage rule (check b) ----
// A district referenced by some zip with pct > 0 MUST have an entry in
// CD/SD/AD when it lies inside the COVERED range for its level, unless it is
// listed in INTENTIONALLY_OUT. Districts outside the covered range (rest of
// California, e.g. SoCal CDs 22+, AD 1-8, AD 36+) are out of scope and ignored.
// So: removing e.g. CD 15 or SD 10 from data.js makes this script fail, while
// out-of-scope districts never do. To extend coverage, widen the range and add
// data; to drop a district deliberately, add it to INTENTIONALLY_OUT.
const COVERED = {
  CD: { min: 9, max: 21 },
  SD: { min: 2, max: 16 }, // only even-numbered SDs are up in 2026
  AD: { min: 9, max: 35 },
};
const INTENTIONALLY_OUT = {
  CD: [],
  SD: [2, 6, 8],
  AD: [10, 11, 12, 34], // 34 (Kern/Inyo/Riverside area) is not covered for now
};
const DATA = { CD, SD, AD };
const LEVELS = ["CD", "SD", "AD"]; // index i+1 in each ZIP entry

const errors = [];
const fail = (msg) => errors.push(msg);

// (a) percentages sum to ~100 per level. An empty level (e.g. Avalon island
// has no congressional district listed) is allowed.
for (const [zip, entry] of Object.entries(ZIP)) {
  LEVELS.forEach((lvl, i) => {
    const rows = entry[i + 1];
    if (!Array.isArray(rows)) return fail(`zip ${zip}: ${lvl} is not an array`);
    if (rows.length === 0) return;
    const sum = rows.reduce((a, [, p]) => a + p, 0);
    if (Math.abs(sum - 100) > TOLERANCE)
      fail(`zip ${zip} (${entry[0]}): ${lvl} percentages sum to ${sum.toFixed(1)}, expected ~100`);
  });
}

// (b) covered districts have data
LEVELS.forEach((lvl, i) => {
  const referenced = new Set();
  for (const entry of Object.values(ZIP))
    for (const [d, p] of entry[i + 1]) if (p > 0) referenced.add(d);
  const { min, max } = COVERED[lvl];
  for (const d of [...referenced].sort((x, y) => x - y)) {
    if (d < min || d > max) continue;
    if (lvl === "SD" && d % 2 === 1) continue; // odd SDs: see check (d)
    if (!DATA[lvl][d] && !INTENTIONALLY_OUT[lvl].includes(d))
      fail(`${lvl} ${d} is referenced in zip.js but has no entry in data.js (add it or list it in INTENTIONALLY_OUT)`);
  }
  for (const d of INTENTIONALLY_OUT[lvl])
    if (DATA[lvl][d]) fail(`${lvl} ${d} is in INTENTIONALLY_OUT but also has data; remove it from the list`);
});

// (c) every mayor city exists as a zip city
const cities = new Set(Object.values(ZIP).map((e) => e[0]));
for (const city of Object.keys(MAYOR))
  if (!cities.has(city)) fail(`MAYOR city "${city}" does not match any city in zip.js`);

// (d) odd-numbered state senate districts are not up in 2026
for (const d of Object.keys(SD))
  if (Number(d) % 2 === 1) fail(`SD ${d} is odd-numbered and not up in 2026; remove it from SD`);

if (errors.length) {
  console.error(`validate: ${errors.length} problem(s)`);
  errors.forEach((e) => console.error("  - " + e));
  process.exit(1);
}
console.log(
  `validate: OK (${Object.keys(ZIP).length} zips, ${Object.keys(CD).length} CD, ` +
    `${Object.keys(SD).length} SD, ${Object.keys(AD).length} AD, ${Object.keys(MAYOR).length} mayors)`
);
