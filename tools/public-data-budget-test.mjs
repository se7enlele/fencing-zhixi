import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "web", "data");
const INDEX_FILE = path.join(DATA_DIR, "public-data-index.json");

const ONE_MIB = 1024 * 1024;
const BUDGETS = {
  // Keep chunks below the current static asset target so a sync cannot silently
  // create oversized files that are expensive to fetch on mobile.
  chunkBytes: 8 * ONE_MIB,
  indexBytes: 20 * ONE_MIB,
  totalBytes: 320 * ONE_MIB,
};

function assertFileExists(filePath, label) {
  assert.ok(fs.existsSync(filePath), `${label} missing: ${filePath}`);
}

function toLocalDataPath(assetPath) {
  assert.equal(typeof assetPath, "string", "chunk path should be a string");
  assert.ok(assetPath.startsWith("/data/"), `chunk path should live under /data/: ${assetPath}`);
  return path.join(DATA_DIR, assetPath.replace(/^\/data\//, ""));
}

assertFileExists(INDEX_FILE, "public data index");

const indexBytes = fs.statSync(INDEX_FILE).size;
assert.ok(
  indexBytes <= BUDGETS.indexBytes,
  `public-data-index.json is ${(indexBytes / ONE_MIB).toFixed(2)} MiB, budget is ${BUDGETS.indexBytes / ONE_MIB} MiB`,
);

const index = JSON.parse(fs.readFileSync(INDEX_FILE, "utf8"));
assert.equal(typeof index.version, "string", "public data index should expose a version");
assert.ok(index.chunks && typeof index.chunks === "object", "public data index should expose chunks");
assert.ok(index.chunkLookup && typeof index.chunkLookup === "object", "public data index should expose chunkLookup");

const chunkPaths = new Set();
for (const [group, files] of Object.entries(index.chunks)) {
  assert.ok(Array.isArray(files), `${group} chunks should be an array`);
  assert.ok(files.length > 0, `${group} should contain at least one chunk`);
  for (const assetPath of files) {
    const localPath = toLocalDataPath(assetPath);
    assertFileExists(localPath, `${group} chunk`);
    chunkPaths.add(assetPath);
  }
}

for (const [group, lookup] of Object.entries(index.chunkLookup)) {
  assert.ok(lookup && typeof lookup === "object" && !Array.isArray(lookup), `${group} lookup should be an object`);
  for (const [id, assetPath] of Object.entries(lookup)) {
    assert.ok(chunkPaths.has(assetPath), `${group} lookup for ${id} points to an unknown chunk: ${assetPath}`);
  }
}

const publicDataFiles = fs
  .readdirSync(DATA_DIR)
  .filter((file) => file.startsWith("public-data") && file.endsWith(".json"));

const totalBytes = publicDataFiles.reduce((total, file) => total + fs.statSync(path.join(DATA_DIR, file)).size, 0);
assert.ok(
  totalBytes <= BUDGETS.totalBytes,
  `public data files total ${(totalBytes / ONE_MIB).toFixed(2)} MiB, budget is ${BUDGETS.totalBytes / ONE_MIB} MiB`,
);

for (const assetPath of chunkPaths) {
  const localPath = toLocalDataPath(assetPath);
  const bytes = fs.statSync(localPath).size;
  assert.ok(
    bytes <= BUDGETS.chunkBytes,
    `${path.basename(localPath)} is ${(bytes / ONE_MIB).toFixed(2)} MiB, budget is ${BUDGETS.chunkBytes / ONE_MIB} MiB`,
  );
}

console.log(
  `public-data-budget ok: ${publicDataFiles.length} files, ${(totalBytes / ONE_MIB).toFixed(2)} MiB total, ${chunkPaths.size} chunks`,
);
