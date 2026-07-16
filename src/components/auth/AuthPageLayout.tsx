import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import logoUrl from "@/assets/logo/logo.png";

type AuthPageLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

/** Standalone sign-in / sign-up page — not the homepage hero. */
export function AuthPageLayout({ title, subtitle, children }: AuthPageLayoutProps) {
  return (
    <div className="min-h-dvh bg-[oklch(0.13_0.06_22)] text-foreground">
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 sm:px-6">
        <header className="flex items-center justify-between py-6 sm:py-8">
          <Link to="/" className="inline-flex" aria-label="The Royal Passage — Home">
            <img
              src={logoUrl}
              alt="The Royal Passage"
              width={280}
              height={96}
              decoding="async"
              className="h-16 w-auto object-contain object-left sm:h-20"
            />
          </Link>
        </header>

        <main className="flex flex-1 flex-col justify-center py-8 sm:py-10">
          <div className="glass-strong w-full rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] px-6 py-8 [font-family:Georgia,'Times_New_Roman',serif] sm:px-8 sm:py-10">
            <div className="mb-6 text-center sm:mb-8">
              <h1 className="font-display text-2xl tracking-tight text-ink md:text-[1.85rem]">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-2 text-sm leading-relaxed normal-case text-ink/75">{subtitle}</p>
              ) : null}
            </div>
            {children}
          </div>
        </main>

        <footer className="py-6 text-center">
          <Link
            to="/experiences"
            className="text-sm text-ink/70 underline-offset-4 transition-colors hover:text-ember hover:underline"
          >
            Browse experiences
          </Link>
        </footer>
      </div>
    </div>
  );
}
