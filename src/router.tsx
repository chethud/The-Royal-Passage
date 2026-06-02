import { createRouter, useRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

function DefaultErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="glass-strong max-w-md rounded-md px-8 py-10 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 text-destructive"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>
        <p className="eyebrow mb-2 text-ember/90">The Royal Passage</p>
        <h1 className="font-display text-2xl tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>
        {import.meta.env.DEV && error.message && (
          <pre className="mt-4 max-h-40 overflow-auto rounded-sm border border-border/50 bg-muted/30 p-3 text-left font-mono text-xs text-destructive">
            {error.message}
          </pre>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-sm bg-ember px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110"
          >
            Try again
          </button>
          <a
            href="/"
            className="glass glass-hover inline-flex items-center justify-center rounded-sm border border-[oklch(0.72_0.09_78_/_0.28)] px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-ember/40"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const getRouter = () => {
  const router = createRouter({
    routeTree,
    context: {},
    scrollRestoration: true,
    // Keep route preloads warm briefly to improve perceived navigation speed.
    defaultPreloadStaleTime: 30_000,
    defaultErrorComponent: DefaultErrorComponent,
  });

  return router;
};
