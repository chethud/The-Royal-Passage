// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";

// Lovable's TanStack preset defaults to port 8080 + host "::". Many tutorials assume Vite's 5173,
// and some environments resolve `localhost` more reliably with host `true`.
//
// Disable the Cloudflare plugin so the server build produces a Node-compatible SSR bundle
// (`dist/server/index.js`) that we can host on Vercel via a serverless function in `/api`.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Vercel/CI inject vars into process.env — loadEnv alone only reads .env files.
  const viteSupabaseUrl = env.VITE_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
  const viteSupabaseAnon = env.VITE_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? "";
  const viteApiBaseUrl = env.VITE_API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? "";
  const viteSiteUrl = env.VITE_SITE_URL ?? process.env.VITE_SITE_URL ?? "";

  return {
    cloudflare: false,
    vite: {
      envDir: process.cwd(),
      define: {
        "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(viteSupabaseUrl),
        "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(viteSupabaseAnon),
        "import.meta.env.VITE_API_BASE_URL": JSON.stringify(viteApiBaseUrl),
        "import.meta.env.VITE_SITE_URL": JSON.stringify(viteSiteUrl),
      },
      server: {
        port: 5173,
        strictPort: false,
        host: true,
      },
      build: {
        // Ensure the SSR bundle targets a recent Node runtime supported by Vercel.
        target: "node20",
      },
      ssr: {
        // Bundle these so the Vercel function can be self-contained without bringing huge
        // optional Node deps along for the ride. Safe defaults that match TanStack Start's
        // own recommendations.
        noExternal: [
          "@tanstack/react-start",
          "@tanstack/react-router",
          "@connectrpc/connect",
          "@connectrpc/connect-web",
          "@bufbuild/protobuf",
        ],
      },
    },
  };
});
