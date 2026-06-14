import { useCallback, useEffect, useState } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { RoleBadge } from "@/components/auth/RoleBadge";
import { fetchManagedUsers, type ManagedUser } from "@/lib/api/admin";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { ROLE_LABELS } from "@/lib/roles";

type ManagedUsersPanelProps = {
  accessToken: string;
  refreshKey: number;
};

function filterBtnClass(active: boolean) {
  return active ? "luxury-btn-sm luxury-btn-primary" : "luxury-btn-sm luxury-btn-panel-outline";
}

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
    <LuxuryCheckoutPanel>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="luxury-panel-heading font-display text-2xl">Users & logins</h2>
          <p className="luxury-panel-body mt-2 text-sm">
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
              className={filterBtnClass(filter === value)}
            >
              {value === "all" ? "All" : ROLE_LABELS[value]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="luxury-panel-body mt-6 text-sm">Loading accounts...</p>
      ) : error ? (
        <p className="mt-6 rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : filtered.length === 0 ? (
        <p className="luxury-panel-body mt-6 text-sm">No accounts in this view yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase tracking-[0.14em] luxury-panel-divider luxury-panel-label">
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Role</th>
                <th className="px-3 py-2 font-medium">Phone</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b luxury-panel-divider last:border-0">
                  <td className="luxury-panel-heading px-3 py-3">{user.fullName ?? "—"}</td>
                  <td className="luxury-panel-body px-3 py-3">{user.email ?? "—"}</td>
                  <td className="px-3 py-3">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="luxury-panel-body px-3 py-3">{user.phone ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </LuxuryCheckoutPanel>
  );
}
