import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { readAuthCallbackError, redirectOffLocalhostIfNeeded } from "@/lib/auth-redirect";
import { useAuthUser } from "@/lib/auth-user";
import { dashboardPathForRole } from "@/lib/roles";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

type Search = {
  redirect?: string;
};

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [{ title: "Signing in — The Royal Passage" }],
  }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    redirectOffLocalhostIfNeeded();
  }, []);

  useEffect(() => {
    const oauthError = readAuthCallbackError();
    if (oauthError) {
      setError(oauthError);
    }
  }, []);

  useEffect(() => {
    void getSupabaseBrowser().auth.getSession();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (error) return;

    if (user && role) {
      if (redirect && role === "guest" && redirect.startsWith("/")) {
        window.location.href = redirect;
        return;
      }
      void navigate({ to: dashboardPathForRole(role) });
      return;
    }

    const timeout = window.setTimeout(() => {
      if (!user) {
        setError("Sign-in could not be completed. Try again from the sign-in page.");
      }
    }, 12000);

    return () => window.clearTimeout(timeout);
  }, [error, loading, navigate, redirect, role, user]);

  return (
    <div className="pt-[var(--header-height)] text-foreground">
      <Header />
      <section className="container-page flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
        {error ? (
          <>
            <p className="max-w-md rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
            <Link
              to="/sign-in"
              search={redirect ? { redirect } : undefined}
              className="mt-6 text-sm text-ember underline-offset-4 hover:underline"
            >
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <p className="eyebrow text-ember/90">Almost there</p>
            <h1 className="mt-3 font-display text-3xl">Finishing sign-in…</h1>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Completing your Google sign-in. You will be redirected in a moment.
            </p>
          </>
        )}
      </section>
      <Footer />
    </div>
  );
}
