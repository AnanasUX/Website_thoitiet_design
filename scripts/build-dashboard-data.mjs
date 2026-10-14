import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requirementsPath = path.join(root, "qa", "requirements.json");
const casesPath = path.join(root, "qa", "test-cases.json");

const requirements = JSON.parse(fs.readFileSync(requirementsPath, "utf8"));
const cases = JSON.parse(fs.readFileSync(casesPath, "utf8"));
const caseIds = new Set(cases.testCases.map(t => t.id));

const errors = [];
const reqIds = new Set();
for (const req of requirements.requirements) {
  if (reqIds.has(req.id)) errors.push(`Duplicate requirement ID: ${req.id}`);
  reqIds.add(req.id);
  if (!req.title || !req.description) errors.push(`${req.id}: title and description are required`);
  if (!Array.isArray(req.testIds) || req.testIds.length === 0) errors.push(`${req.id}: no testIds`);
  for (const id of req.testIds || []) if (!caseIds.has(id)) errors.push(`${req.id}: unknown test case ${id}`);
  if (!["NOT_TESTED","PASS","FAIL","BLOCKED","NEEDS_REVIEW","NOT_APPLICABLE"].includes(req.status)) errors.push(`${req.id}: invalid status ${req.status}`);
  if (req.status === "PASS" && (!Array.isArray(req.evidence) || req.evidence.length === 0)) {
    errors.push(`${req.id}: PASS requires evidence; refusing to treat it as verified`);
  }
}
const testIds = new Set();
for (const tc of cases.testCases) {
  if (testIds.has(tc.id)) errors.push(`Duplicate test case ID: ${tc.id}`);
  testIds.add(tc.id);
  for (const id of tc.requirementIds || []) if (!reqIds.has(id)) errors.push(`${tc.id}: unknown requirement ${id}`);
}
if (errors.length) {
  console.error("QA registry validation FAILED:\n- " + errors.join("\n- "));
  process.exitCode = 1;
} else {
  const covered = requirements.requirements.filter(r => r.testIds.every(id => caseIds.has(id))).length;
  console.log(`QA registry valid: ${requirements.requirements.length} requirements, ${cases.testCases.length} test cases, ${covered} requirements linked.`);
  console.log("Note: registry validity does not mean the website tests have passed.");

  // Sync to public/qa and public/dashboard.html for Vite builds and GitHub Pages deployment
  const publicQa = path.join(root, "public", "qa");
  if (!fs.existsSync(publicQa)) fs.mkdirSync(publicQa, { recursive: true });
  fs.copyFileSync(requirementsPath, path.join(publicQa, "requirements.json"));
  fs.copyFileSync(casesPath, path.join(publicQa, "test-cases.json"));
  if (fs.existsSync(path.join(root, "dashboard.html"))) {
    fs.copyFileSync(path.join(root, "dashboard.html"), path.join(root, "public", "dashboard.html"));
  }
  console.log("Successfully synchronized QA assets to public/qa and public/dashboard.html");
}
