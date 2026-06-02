// Ambient declarations for runtime-only artifacts that the api/ functions
// import. The Vite build emits `dist/server/server.js`, but it has no type
// declarations — this stub keeps Vercel's TS build happy.

declare module "*/dist/server/server.js" {
  type FetchHandler = {
    fetch: (request: Request) => Promise<Response> | Response;
  };
  const handler: FetchHandler;
  export default handler;
}
