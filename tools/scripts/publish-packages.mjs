#!/usr/bin/env node
/**
 * Publish helpers for NeuroUX SDK packages (Trusted Publisher / OIDC).
 *
 * Usage:
 *   node tools/scripts/publish-packages.mjs check  [--tag v0.1.0-rc.3]
 *   node tools/scripts/publish-packages.mjs pack   [--out artifacts]
 *   node tools/scripts/publish-packages.mjs publish [--tag v0.1.0-rc.3] [--dir artifacts]
 *
 * Package order follows dependency graph (leaf → dependents).
 */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

/** Nx project directory names under libs/, in publish order. */
const PACKAGE_DIRS = [
  'signals',
  'styles',
  'utils',
  'assist',
  'core',
  'neuro-react',
  'neuro-js',
  'neuro-vue',
  'neuro-svelte',
  'neuro-angular',
  'neuro-next',
];

function usage(exitCode = 1) {
  console.error(`Usage:
  node tools/scripts/publish-packages.mjs check   [--tag <vX.Y.Z>]
  node tools/scripts/publish-packages.mjs pack    [--out <dir>]
  node tools/scripts/publish-packages.mjs publish [--tag <vX.Y.Z>] [--dir <dir>]`);
  process.exit(exitCode);
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  if (!command || command === '-h' || command === '--help') usage(command ? 0 : 1);

  const opts = { command, tag: null, out: 'artifacts', dir: 'artifacts' };
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg === '--tag') opts.tag = rest[++i];
    else if (arg === '--out') opts.out = rest[++i];
    else if (arg === '--dir') opts.dir = rest[++i];
    else {
      console.error(`Unknown argument: ${arg}`);
      usage(1);
    }
  }
  return opts;
}

function normalizeTag(tag) {
  if (!tag) {
    console.error('Missing --tag (e.g. v0.1.0-rc.3) or TAG / GITHUB_REF_NAME env.');
    process.exit(1);
  }
  return tag.startsWith('v') ? tag.slice(1) : tag;
}

function resolveTag(cliTag) {
  return (
    cliTag ||
    process.env.TAG ||
    process.env.RELEASE_TAG ||
    (process.env.GITHUB_REF_NAME?.startsWith('v') ? process.env.GITHUB_REF_NAME : null)
  );
}

function readPackageJson(dirName) {
  const pkgPath = join(ROOT, 'libs', dirName, 'package.json');
  if (!existsSync(pkgPath)) {
    console.error(`Missing package.json: ${pkgPath}`);
    process.exit(1);
  }
  return { pkgPath, pkg: JSON.parse(readFileSync(pkgPath, 'utf8')), dirName };
}

function loadPackages() {
  return PACKAGE_DIRS.map(readPackageJson);
}

function distTagForVersion(version) {
  return version.includes('-') ? 'rc' : 'latest';
}

function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
    ...options,
  });
  return result;
}

function tarballName(name, version) {
  // @adapt-ux/neuro-ux-sdk-core@0.1.0-rc.3 → adapt-ux-neuro-ux-sdk-core-0.1.0-rc.3.tgz
  const base = name.startsWith('@') ? name.slice(1).replace('/', '-') : name;
  return `${base}-${version}.tgz`;
}

function assertVersionsMatchTag(packages, version) {
  const mismatches = [];
  for (const { dirName, pkg } of packages) {
    if (pkg.version !== version) {
      mismatches.push(`${pkg.name} (${dirName}): package.json=${pkg.version}, tag=${version}`);
    }
  }
  if (mismatches.length > 0) {
    console.error('Version mismatch — aborting before any publish:');
    for (const line of mismatches) console.error(`  - ${line}`);
    process.exit(1);
  }
  console.log(`All ${packages.length} packages match version ${version}`);
}

function cmdCheck(opts) {
  const version = normalizeTag(resolveTag(opts.tag));
  const packages = loadPackages();
  assertVersionsMatchTag(packages, version);
}

function cmdPack(opts) {
  const outDir = resolve(ROOT, opts.out);
  mkdirSync(outDir, { recursive: true });
  const packages = loadPackages();

  for (const { dirName, pkg } of packages) {
    const cwd = join(ROOT, 'libs', dirName);
    console.log(`Packing ${pkg.name}@${pkg.version}...`);
    // Ignore lifecycle scripts (e.g. prepare → nx build); CI builds before pack.
    const result = run('npm', ['pack', '--ignore-scripts', '--pack-destination', outDir], {
      cwd,
    });
    if (result.status !== 0) {
      console.error(result.stderr || result.stdout);
      console.error(`npm pack failed for ${pkg.name}`);
      process.exit(result.status ?? 1);
    }
    const expected = tarballName(pkg.name, pkg.version);
    const packedPath = join(outDir, expected);
    if (!existsSync(packedPath)) {
      // npm pack prints the filename; fall back to renaming if needed
      const printed = (result.stdout || '').trim().split(/\r?\n/).pop();
      if (printed && existsSync(join(outDir, printed)) && printed !== expected) {
        renameSync(join(outDir, printed), packedPath);
      } else {
        console.error(`Expected tarball missing: ${packedPath}`);
        console.error(`npm pack output:\n${result.stdout}`);
        process.exit(1);
      }
    }
    console.log(`  → ${expected}`);
  }

  const tgz = readdirSync(outDir).filter((f) => f.endsWith('.tgz'));
  console.log(`Packed ${tgz.length} packages into ${outDir}`);
}

function versionExistsOnNpm(name, version) {
  const result = run('npm', ['view', `${name}@${version}`, 'version'], {
    env: { ...process.env, npm_config_yes: 'true' },
  });
  if (result.status === 0 && (result.stdout || '').trim() === version) {
    return true;
  }
  // npm view exits non-zero when the version is missing — that is expected
  const err = `${result.stderr || ''}${result.stdout || ''}`.toLowerCase();
  if (
    result.status !== 0 &&
    (err.includes('e404') || err.includes('not found') || err.includes('404'))
  ) {
    return false;
  }
  if (result.status !== 0) {
    // Network / auth / other errors should fail the job, not look like "missing"
    console.error(`npm view failed for ${name}@${version}:`);
    console.error(result.stderr || result.stdout);
    process.exit(result.status ?? 1);
  }
  return false;
}

function cmdPublish(opts) {
  const version = normalizeTag(resolveTag(opts.tag));
  const artifactDir = resolve(ROOT, opts.dir);
  const packages = loadPackages();

  // A5: verify every package before the first publish
  assertVersionsMatchTag(packages, version);

  if (!existsSync(artifactDir)) {
    console.error(`Artifact directory not found: ${artifactDir}`);
    process.exit(1);
  }

  const tag = distTagForVersion(version);

  for (const { pkg } of packages) {
    const tgz = join(artifactDir, tarballName(pkg.name, pkg.version));
    if (!existsSync(tgz)) {
      console.error(`Missing tarball for ${pkg.name}: ${tgz}`);
      process.exit(1);
    }

    if (versionExistsOnNpm(pkg.name, pkg.version)) {
      console.log(`skip ${pkg.name}@${pkg.version} (already on npm)`);
      continue;
    }

    console.log(`Publishing ${pkg.name}@${pkg.version} with --tag ${tag} --provenance...`);
    const result = run(
      'npm',
      ['publish', tgz, '--access', 'public', '--provenance', '--tag', tag],
      { stdio: 'inherit' }
    );
    if (result.status !== 0) {
      // Re-check: concurrent publish or race may have created the version
      if (versionExistsOnNpm(pkg.name, pkg.version)) {
        console.log(`skip ${pkg.name}@${pkg.version} (appeared on npm during publish)`);
        continue;
      }
      console.error(`npm publish failed for ${pkg.name}`);
      process.exit(result.status ?? 1);
    }
    console.log(`published ${pkg.name}@${pkg.version}`);
  }

  console.log('Publish complete');
}

const opts = parseArgs(process.argv.slice(2));

switch (opts.command) {
  case 'check':
    cmdCheck(opts);
    break;
  case 'pack':
    cmdPack(opts);
    break;
  case 'publish':
    cmdPublish(opts);
    break;
  default:
    console.error(`Unknown command: ${opts.command}`);
    usage(1);
}
