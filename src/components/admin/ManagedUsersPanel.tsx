import { useCallback, useEffect, useState } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { RoleBadge } from "@/components/auth/RoleBadge";
import {
  DashboardTable,
  DashboardTableBody,
  DashboardTableCell,
  DashboardTableEmpty,
  DashboardTableFilters,
  DashboardTableHead,
  DashboardTableHeadCell,
  DashboardTableHeadRow,
  DashboardTableRow,
  DashboardTableScroll,
  dashboardFilterBtnClass,
} from "@/components/ui/DashboardTable";
import { DashboardPanelSkeleton } from "@/components/ui/DashboardPanelSkeleton";
import { fetchManagedUsers, type ManagedUser } from "@/lib/api/admin";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { ROLE_LABELS, USER_ROLES, type UserRole } from "@/lib/roles";

type ManagedUsersPanelProps = {
  accessToken: string;
  refreshKey: number;
};

type UserFilter = "all" | UserRole;

const FILTER_ROLES = USER_ROLES;

function filterBtnClass(active: boolean) {
  return dashboardFilterBtnClass(active);
}

export function ManagedUsersPanel({ accessToken, refreshKey }: ManagedUsersPanelProps) {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<UserFilter>("all");

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
            Guests sign up themselves. Hosts, owners, editors, and admins are created by platform
            admins and sign in with email and password.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={filterBtnClass(filter === "all")}
          >
            All
          </button>
          {FILTER_ROLES.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={filterBtnClass(filter === value)}
            >
              {ROLE_LABELS[value]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-6">
          <DashboardPanelSkeleton rows={4} />
        </div>
      ) : error ? (
        <p className="mt-6 rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : filtered.length === 0 ? (
        <DashboardTableEmpty>No accounts in this view yet.</DashboardTableEmpty>
      ) : (
        <div className="mt-6">
          <DashboardTableScroll>
            <DashboardTable minWidth="sm">
              <DashboardTableHead>
                <DashboardTableHeadRow>
                  <DashboardTableHeadCell>Name</DashboardTableHeadCell>
                  <DashboardTableHeadCell>Email</DashboardTableHeadCell>
                  <DashboardTableHeadCell>Role</DashboardTableHeadCell>
                  <DashboardTableHeadCell>Phone</DashboardTableHeadCell>
                </DashboardTableHeadRow>
              </DashboardTableHead>
              <DashboardTableBody>
                {filtered.map((user) => (
                  <DashboardTableRow key={user.id}>
                    <DashboardTableCell variant="heading">{user.fullName ?? "—"}</DashboardTableCell>
                    <DashboardTableCell>{user.email ?? "—"}</DashboardTableCell>
                    <DashboardTableCell>
                      <RoleBadge role={user.role} />
                    </DashboardTableCell>
                    <DashboardTableCell>{user.phone ?? "—"}</DashboardTableCell>
                  </DashboardTableRow>
                ))}
              </DashboardTableBody>
            </DashboardTable>
          </DashboardTableScroll>
        </div>
      )}
    </LuxuryCheckoutPanel>
  );
}
