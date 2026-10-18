// Runs after `next build`: writes out/sw.js with a precache list of every
// file in the static export, so the app works offline after the first visit.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const OUT = new URL("../out/", import.meta.url).pathname;
const SKIP = [/\.map$/, /^sw\.js$/, /^404/, /^_not-found/, /\.DS_Store$/];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const files = walk(OUT)
  .map((f) => relative(OUT, f).split(sep).join("/"))
  .filter((f) => !SKIP.some((re) => re.test(f)))
  .sort();

const hash = createHash("sha256");
for (const f of files) hash.update(f).update(readFileSync(join(OUT, f)));
const version = hash.digest("hex").slice(0, 12);

const urls = ["/", ...files.filter((f) => f !== "index.html").map((f) => `/${f}`)];
const template = readFileSync(new URL("./sw-template.js", import.meta.url), "utf8");
const sw = template
  .replace("__CACHE_VERSION__", version)
  .replace("__PRECACHE_URLS__", JSON.stringify(urls, null, 2));

writeFileSync(join(OUT, "sw.js"), sw);
console.log(`sw.js: precaching ${urls.length} files (cache ${version})`);
