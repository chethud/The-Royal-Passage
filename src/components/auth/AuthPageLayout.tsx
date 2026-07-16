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
        <main className="flex flex-1 flex-col justify-center py-4 sm:py-6">
          <div className="glass-strong w-full rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] px-6 pb-8 pt-0 [font-family:Georgia,'Times_New_Roman',serif] sm:px-8 sm:pb-10 sm:pt-1">
            <div className="-mt-1 mb-2 text-center sm:-mt-1.5">
              <Link
                to="/"
                className="mx-auto inline-flex justify-center"
                aria-label="The Royal Passage — Home"
              >
                <span className="block h-[4.5rem] w-full max-w-[8.5rem] overflow-hidden sm:h-[5rem] sm:max-w-[9.5rem]">
                  <img
                    src={logoUrl}
                    alt="The Royal Passage"
                    width={280}
                    height={96}
                    decoding="async"
                    className="mx-auto block h-[7.5rem] w-auto -translate-y-[1.2rem] sm:h-[8.25rem] sm:-translate-y-[1.35rem]"
                  />
                </span>
              </Link>
              <h1 className="-mt-5 font-display text-[1.45rem] tracking-tight text-ink sm:-mt-6 md:text-[1.78rem]">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-0 text-sm leading-snug normal-case text-ink/75">{subtitle}</p>
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
