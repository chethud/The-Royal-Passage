import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ShieldCheck, Users } from "lucide-react";
import { DashboardShell } from "@/components/auth/DashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { dashboardPathForRole } from "@/lib/roles";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — The Royal Passage" },
      { name: "description", content: "Platform administration for hosts, experiences, and bookings." },
    ],
  }),
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/sign-in", search: { role: "admin" } });
      return;
    }
    if (role && role !== "admin") {
      void navigate({ to: dashboardPathForRole(role) });
    }
  }, [loading, navigate, role, user]);

  if (loading || !user || role !== "admin") {
    return <div className="min-h-[50vh] pt-[var(--header-height)]" />;
  }

  return (
    <DashboardShell
      role="admin"
      title="Platform control"
      subtitle="Oversee guests, hosts, experience approvals, and marketplace health."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <article className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6">
          <Users className="h-5 w-5 text-ember" />
          <h2 className="mt-4 font-display text-2xl">Hosts & guests</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Review host applications, verify profiles, and manage user access across the platform.
          </p>
        </article>
        <article className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6">
          <ShieldCheck className="h-5 w-5 text-ember" />
          <h2 className="mt-4 font-display text-2xl">Experience curation</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Approve listings, monitor bookings, and keep the Royal Passage standard consistent.
          </p>
        </article>
      </div>
    </DashboardShell>
  );
}
