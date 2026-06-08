import { useCallback, useEffect, useState } from "react";
import { RoleBadge } from "@/components/auth/RoleBadge";
import { fetchManagedUsers, type ManagedUser } from "@/lib/api/admin";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { ROLE_LABELS } from "@/lib/roles";

type ManagedUsersPanelProps = {
  accessToken: string;
  refreshKey: number;
};

export function ManagedUsersPanel({ accessToken, refreshKey }: ManagedUsersPanelProps) {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "guest" | "host" | "admin">("all");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      const rows = await fetchManagedUsers(accessToken);
      setUsers(rows);
    } catch (err) {
      setError(toErrorMessage(err, "Failed to load users."));
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers, refreshKey]);

  const filtered = users.filter((user) => filter === "all" || user.role === filter);

  return (
    <section className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl">Users & logins</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Guests sign up themselves. Hosts and admins are created here and sign in with email and
            password.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "guest", "host", "admin"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-sm border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                filter === value
                  ? "border-ember/70 bg-ember/10 text-ember"
                  : "border-[oklch(0.88_0.08_86_/_0.35)] text-foreground/80 hover:border-ember/40"
              }`}
            >
              {value === "all" ? "All" : ROLE_LABELS[value]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading accounts...</p>
      ) : error ? (
        <p className="mt-6 rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : filtered.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No accounts in this view yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-[oklch(0.88_0.08_86_/_0.2)] text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Role</th>
                <th className="px-3 py-2 font-medium">Phone</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-[oklch(0.88_0.08_86_/_0.1)] last:border-0"
                >
                  <td className="px-3 py-3">{user.fullName ?? "—"}</td>
                  <td className="px-3 py-3 text-muted-foreground">{user.email ?? "—"}</td>
                  <td className="px-3 py-3">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{user.phone ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
