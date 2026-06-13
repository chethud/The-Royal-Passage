import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outfile = resolve(root, "dist/server/homepage-photo-api.js");

/** Vite resolves image imports to hashed URLs; this bundle only needs structural defaults. */
const assetStubPlugin = {
  name: "asset-stub",
  setup(buildApi) {
    buildApi.onLoad({ filter: /\.(png|jpe?g|gif|webp|svg|avif)$/i }, (args) => ({
      contents: `export default ${JSON.stringify(args.path.split(/[/\\]/).pop() ?? "asset")};`,
      loader: "js",
    }));
  },
};

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
  plugins: [assetStubPlugin],
  alias: {
    "@": resolve(root, "src"),
  },
  logLevel: "info",
});

console.log(`Built ${outfile}`);
