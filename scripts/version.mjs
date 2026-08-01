#!/usr/bin/env node

/**
 * Biliq semantic-version helper.
 *
 * This intentionally updates package.json and package-lock.json without
 * creating a Git commit or tag. That keeps version changes reviewable before
 * they are published. Run `npm run version:help` for the command catalogue.
 */

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const packagePath = resolve(root, "package.json");
const lockPath = resolve(root, "package-lock.json");
const action = process.argv[2] ?? "help";
const requestedVersion = process.argv[3];

const help = `Biliq version commands

  npm run version:show          Show the current website/package version.
  npm run version:check         Validate SemVer and package-lock consistency.
  npm run version:patch         Bug fix: 1.2.3 -> 1.2.4.
  npm run version:minor         Backwards-compatible feature: 1.2.3 -> 1.3.0.
  npm run version:major         Breaking change: 1.2.3 -> 2.0.0.
  npm run version:prerelease    Start/advance beta: 1.2.3 -> 1.2.4-beta.1.
  npm run version:release       Promote prerelease: 1.2.4-beta.2 -> 1.2.4.
  npm run version:set -- 2.1.0 Set an explicit valid SemVer.

The helper updates package.json and package-lock.json only. Review, test,
commit, and tag the release separately.`;

if (action === "help") {
  console.log(help);
  process.exit(0);
}

const packageJson = JSON.parse(await readFile(packagePath, "utf8"));
const lockJson = JSON.parse(await readFile(lockPath, "utf8"));
const current = parseSemver(packageJson.version);

if (action === "show") {
  console.log(`Biliq v${formatSemver(current)}`);
  process.exit(0);
}

if (action === "check") {
  const lockVersion = lockJson.packages?.[""]?.version ?? lockJson.version;
  parseSemver(lockVersion);
  if (packageJson.version !== lockJson.version || packageJson.version !== lockVersion) {
    throw new Error("package.json and package-lock.json versions do not match.");
  }
  console.log(`Biliq v${packageJson.version} is valid and synchronized.`);
  process.exit(0);
}

let next;
switch (action) {
  case "patch":
    next = { major: current.major, minor: current.minor, patch: current.patch + 1 };
    break;
  case "minor":
    next = { major: current.major, minor: current.minor + 1, patch: 0 };
    break;
  case "major":
    next = { major: current.major + 1, minor: 0, patch: 0 };
    break;
  case "prerelease":
    next = nextPrerelease(current);
    break;
  case "release":
    if (!current.prerelease) throw new Error("The current version is already stable.");
    next = { major: current.major, minor: current.minor, patch: current.patch };
    break;
  case "set":
    if (!requestedVersion) throw new Error("Pass a version, for example: npm run version:set -- 1.4.0");
    next = parseSemver(requestedVersion);
    break;
  default:
    throw new Error(`Unknown version action "${action}". Run npm run version:help.`);
}

const nextVersion = formatSemver(next);
packageJson.version = nextVersion;
lockJson.version = nextVersion;
if (lockJson.packages?.[""]) lockJson.packages[""].version = nextVersion;

await Promise.all([
  writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`),
  writeFile(lockPath, `${JSON.stringify(lockJson, null, 2)}\n`)
]);

console.log(`Biliq ${formatSemver(current)} -> ${nextVersion}`);
console.log("Version files updated. Run npm run check before committing the release.");

function parseSemver(value) {
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/.exec(value);
  if (!match) throw new Error(`"${value}" is not a valid semantic version.`);
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4]
  };
}

function formatSemver(version) {
  const base = `${version.major}.${version.minor}.${version.patch}`;
  return version.prerelease ? `${base}-${version.prerelease}` : base;
}

function nextPrerelease(version) {
  if (!version.prerelease) {
    return {
      major: version.major,
      minor: version.minor,
      patch: version.patch + 1,
      prerelease: "beta.1"
    };
  }

  const identifiers = version.prerelease.split(".");
  const last = identifiers.at(-1);
  if (last && /^\d+$/.test(last)) {
    identifiers[identifiers.length - 1] = String(Number(last) + 1);
  } else {
    identifiers.push("1");
  }
  return { ...version, prerelease: identifiers.join(".") };
}
