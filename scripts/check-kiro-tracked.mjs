#!/usr/bin/env node
// Fails when .kiro/ would be left out of a commit: ignored by git, or holding untracked files.
// Run directly (`pnpm check:kiro`) or as a Kiro PreToolUse hook (`--hook`), where it only
// acts on `git commit` commands and exits 2 to block them.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();

if (process.argv.includes("--hook")) {
  let command = "";
  try {
    const event = JSON.parse(readFileSync(0, "utf8") || "{}");
    command = String(event.tool_input?.command ?? "");
  } catch {
    process.exit(0);
  }
  if (!/\bgit\b[^|;&]*\bcommit\b/.test(command)) process.exit(0);
}

const problems = [];

try {
  const ignored = git("check-ignore", "-v", "--no-index", ".kiro/steering/tech.md");
  if (ignored) problems.push(`.kiro/ is ignored by: ${ignored}`);
} catch {
  // Exit 1 from check-ignore means "not ignored".
}

const untracked = git("ls-files", "--others", "--exclude-standard", "--", ".kiro", "docs/kiro-log.md");
if (untracked) problems.push(`untracked Kiro files (git add them):\n  ${untracked.split("\n").join("\n  ")}`);

if (problems.length) {
  console.error(`check-kiro: ${problems.join("\n")}`);
  process.exit(process.argv.includes("--hook") ? 2 : 1);
}
console.log("check-kiro: .kiro/ is tracked");
