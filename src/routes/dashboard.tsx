import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { CalendarDays, Compass } from "lucide-react";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { dashboardPathForRole } from "@/lib/roles";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Guest dashboard — The Royal Passage" },
      { name: "description", content: "View your bookings and saved experiences." },
    ],
  }),
  component: GuestDashboardPage,
});

function GuestDashboardPage() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/sign-in", search: { role: "guest" } });
      return;
    }
    if (role && role !== "guest") {
      void navigate({ to: dashboardPathForRole(role) });
    }
  }, [loading, navigate, role, user]);

  if (loading || !user || role !== "guest") {
    return <div className="min-h-[50vh] pt-[var(--header-height)]" />;
  }

  return (
    <DashboardShell
      role="guest"
      title="Your journeys"
      subtitle="Book experiences, track confirmations, and revisit the moments you have planned in Mysuru."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <article className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6">
          <CalendarDays className="h-5 w-5 text-ember" />
          <h2 className="mt-4 font-display text-2xl">Upcoming bookings</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Your confirmed experiences will appear here once you book while signed in.
          </p>
        </article>
        <article className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6">
          <Compass className="h-5 w-5 text-ember" />
          <h2 className="mt-4 font-display text-2xl">Discover more</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Browse pottery, farm walks, palace stories, and other curated experiences.
          </p>
          <Link
            to="/experiences"
            className="mt-5 inline-flex rounded-sm bg-ember px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110"
          >
            Explore experiences
          </Link>
        </article>
      </div>
    </DashboardShell>
  );
}
