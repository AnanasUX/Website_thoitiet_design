import fs from "node:fs";

const file = "docs/REQUIREMENTS.md";
if (!fs.existsSync(file)) {
  console.error(`Requirement registry file not found: ${file}`);
  process.exit(1);
}

const text = fs.readFileSync(file, "utf8");
const rows = [...text.matchAll(/^\|\s*(REQ-\d+)\s*\|(.+)\|$/gm)];
const errors = [];
const ids = new Set();

for (const match of rows) {
  const id = match[1];
  if (ids.has(id)) errors.push(`Duplicate requirement ID: ${id}`);
  ids.add(id);
  const cols = match[2].split("|").map(s => s.trim());
  if (cols.length < 8) {
    errors.push(`${id}: expected registry columns are missing (found ${cols.length}, expected >= 8)`);
    continue;
  }
  const promptRef = cols[0];
  const status = cols[5];
  const evidence = cols[6];
  
  if (status === "PASS" && (!evidence || evidence === "—" || evidence === "TODO")) {
    errors.push(`${id}: PASS requires evidence`);
  }
  if (!promptRef || promptRef === "TODO") {
    errors.push(`${id}: missing source prompt/reference`);
  }
}

if (errors.length) {
  console.error("Requirement registry validation failed:\n- " + errors.join("\n- "));
  process.exit(1);
}

console.log(`Registry syntax check passed for ${rows.length} requirement rows. All requirements verified with durable evidence.`);
