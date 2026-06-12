import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outfile = resolve(root, "dist/server/homepage-photo-api.js");

await mkdir(dirname(outfile), { recursive: true });

await build({
  absWorkingDir: root,
  entryPoints: [resolve(root, "src/lib/homepage-photo-api.entry.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  outfile,
  packages: "external",
  alias: {
    "@": resolve(root, "src"),
  },
  logLevel: "info",
});

console.log(`Built ${outfile}`);
