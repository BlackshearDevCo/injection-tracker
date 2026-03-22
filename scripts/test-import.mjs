import { readFileSync } from "fs";

const json = readFileSync("seed-data.json", "utf-8");
const parsed = JSON.parse(json);

console.log("Is array:", Array.isArray(parsed));
console.log("Length:", parsed.length);
console.log("First:", parsed[0]);
console.log("Last:", parsed[parsed.length - 1]);

let badItems = 0;
for (const item of parsed) {
  if (!item.id || !item.date || !item.site) {
    console.log("BAD ITEM:", item);
    badItems++;
  }
}

if (badItems === 0) {
  console.log("All items pass validation");
}

// Simulate the full round-trip
const stored = JSON.stringify(parsed);
const reparsed = JSON.parse(stored);
console.log("Round-trip length:", reparsed.length);

// Test sorting (what useInjections does)
const sorted = [...reparsed].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);
console.log("Sorted first (newest):", sorted[0]);
console.log("Sorted last (oldest):", sorted[sorted.length - 1]);
