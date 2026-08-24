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
    <div className="min-h-dvh bg-[color:var(--royal-burgundy)] text-foreground">
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 sm:px-6">
        <main className="flex flex-1 flex-col justify-center py-4 sm:py-6">
          <div className="glass-strong w-full rounded-[var(--radius-xl)] border border-[color:rgba(198,161,91,0.22)] bg-[color:rgba(252,249,243,0.96)] px-6 pb-8 pt-0 text-[color:var(--royal-charcoal)] shadow-[var(--shadow-lift)] sm:px-8 sm:pb-10 sm:pt-1">
            <div className="mb-5 pt-1 text-center sm:mb-6 sm:pt-2">
              <Link
                to="/"
                className="mx-auto mb-1 inline-flex justify-center leading-none"
                aria-label="The Royal Passage — Home"
              >
                <span className="block h-[4.75rem] w-full max-w-[9rem] overflow-hidden sm:h-[5.25rem] sm:max-w-[10rem]">
                  <img
                    src={logoUrl}
                    alt="The Royal Passage"
                    width={280}
                    height={96}
                    decoding="async"
                    className="mx-auto block h-[8rem] w-auto -translate-y-[1.25rem] sm:h-[8.75rem] sm:-translate-y-[1.4rem]"
                  />
                </span>
              </Link>
              <h1 className="mt-1 font-display text-[1.75rem] tracking-tight text-[color:var(--royal-burgundy)] md:text-[2.1rem]">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-1.5 text-sm leading-snug normal-case text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
            {children}
          </div>
        </main>

        <footer className="py-6 text-center">
          <Link
            to="/experiences"
            className="text-sm text-[color:var(--royal-ivory)]/78 underline-offset-4 transition-colors hover:text-[color:var(--soft-champagne)] hover:underline"
          >
            Browse experiences
          </Link>
        </footer>
      </div>
    </div>
  );
}
