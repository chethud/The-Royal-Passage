import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ClipboardList, Sparkles } from "lucide-react";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { dashboardPathForRole } from "@/lib/roles";

export const Route = createFileRoute("/host/dashboard")({
  head: () => ({
    meta: [
      { title: "Host dashboard — The Royal Passage" },
      {
        name: "description",
        content: "Manage the experiences you host — pottery, culinary, farm, and heritage sessions.",
      },
    ],
  }),
  component: HostDashboardPage,
});

function HostDashboardPage() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/sign-in" });
      return;
    }
    if (role && role !== "host") {
      void navigate({ to: dashboardPathForRole(role) });
    }
  }, [loading, navigate, role, user]);

  if (loading || !user || role !== "host") {
    return <div className="min-h-[50vh] pt-[var(--header-height)]" />;
  }

  return (
    <DashboardShell
      role="host"
      title="Host studio"
      subtitle="You are a host — the local expert who offers experiences like pottery workshops, farm breakfasts, or palace walks."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <article className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6">
          <Sparkles className="h-5 w-5 text-ember" />
          <h2 className="mt-4 font-display text-2xl">Your experiences</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Draft, submit, and publish the sessions you host. Each listing is reviewed before it
            goes live.
          </p>
        </article>
        <article className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6">
          <ClipboardList className="h-5 w-5 text-ember" />
          <h2 className="mt-4 font-display text-2xl">Bookings & slots</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            See upcoming guest bookings and manage availability for your experiences.
          </p>
          <Link
            to="/hosts"
            className="mt-5 inline-flex rounded-sm border border-[oklch(0.88_0.08_86_/_0.35)] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:border-ember/60 hover:text-ember"
          >
            Host guidelines
          </Link>
        </article>
      </div>
    </DashboardShell>
  );
}
