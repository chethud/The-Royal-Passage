import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ExperienceStatusBadge } from "@/components/experience/ExperienceStatusBadge";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { HomestayOwnerDashboardShell } from "@/components/homestay-owner/HomestayOwnerDashboardShell";
import { OwnerAvailabilityManager } from "@/components/homestay-owner/OwnerAvailabilityManager";
import { OwnerHomestayForm } from "@/components/homestay-owner/OwnerHomestayForm";
import { OwnerRoomManager } from "@/components/homestay-owner/OwnerRoomManager";
import { fetchCities } from "@/lib/api/cities";
import {
  createOwnerHomestayRoom,
  deleteOwnerAvailability,
  deleteOwnerHomestay,
  fetchOwnerHomestay,
  updateOwnerHomestay,
  updateOwnerHomestayRoom,
  upsertOwnerAvailability,
  type OwnerHomestayDetail,
} from "@/lib/api/owner-homestays";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import type { CitySummary } from "@/lib/cities";
import { useHomestayOwnerAccess } from "@/lib/use-homestay-owner-access";

export const Route = createFileRoute("/homestay/properties/$homestayId")({
  head: () => ({
    meta: [{ title: "Manage property — The Royal Passage" }],
  }),
  component: OwnerHomestayDetailPage,
});

function OwnerHomestayDetailPage() {
  const { homestayId } = Route.useParams();
  const { accessToken, ready, loading } = useHomestayOwnerAccess();
  const [homestay, setHomestay] = useState<OwnerHomestayDetail | null>(null);
  const [cities, setCities] = useState<CitySummary[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roomBusy, setRoomBusy] = useState(false);

  const loadPage = useCallback(async () => {
    if (!accessToken) return;
    setPageLoading(true);
    setPageError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      const [detail, cityRows] = await Promise.all([
        fetchOwnerHomestay(accessToken, homestayId),
        fetchCities(),
      ]);
      setHomestay(detail);
      setCities(cityRows);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to load property."));
    } finally {
      setPageLoading(false);
    }
  }, [accessToken, homestayId]);

  useEffect(() => {
    if (!ready) return;
    void loadPage();
  }, [loadPage, ready]);

  const readOnly = homestay?.status === "published" || homestay?.status === "pending_review";

  const handleSave = async (
    payload: Parameters<React.ComponentProps<typeof OwnerHomestayForm>["onSubmit"]>[0],
  ) => {
    if (!accessToken) return;
    setSaving(true);
    setPageError(null);
    try {
      const updated = await updateOwnerHomestay(accessToken, homestayId, payload);
      setHomestay(updated);
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to save property."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!accessToken || !homestay) return;
    if (!window.confirm("Archive or delete this property?")) return;
    setSaving(true);
    try {
      await deleteOwnerHomestay(accessToken, homestayId);
      window.location.href = "/homestay/properties";
    } catch (err) {
      setPageError(toErrorMessage(err, "Failed to delete property."));
      setSaving(false);
    }
  };

  if (loading || !ready) {
    return (
      <HomestayOwnerDashboardShell
        title="Manage property"
        subtitle="Edit listing details, rooms, and calendar availability."
        showRoleDescription={false}
      >
        <LuxuryCheckoutPanel>
          <p className="luxury-panel-body py-8 text-sm">Loading property…</p>
        </LuxuryCheckoutPanel>
      </HomestayOwnerDashboardShell>
    );
  }

  return (
    <HomestayOwnerDashboardShell
      title={homestay?.title ?? "Manage property"}
      subtitle="Edit listing details, rooms, and calendar availability."
      showRoleDescription={false}
    >
      {pageLoading ? (
        <LuxuryCheckoutPanel>
          <p className="luxury-panel-body py-8 text-sm">Loading property…</p>
        </LuxuryCheckoutPanel>
      ) : pageError && !homestay ? (
        <LuxuryCheckoutPanel>
          <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {pageError}
          </p>
        </LuxuryCheckoutPanel>
      ) : homestay ? (
        <div className="space-y-8">
          <LuxuryCheckoutPanel>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <ExperienceStatusBadge status={homestay.status} surface="light" />
              {homestay.status === "published" ? (
                <Link
                  to="/homestays/$slug"
                  params={{ slug: homestay.slug }}
                  className="luxury-panel-link text-sm hover:underline"
                >
                  View live listing →
                </Link>
              ) : null}
            </div>
            {pageError ? (
              <p className="mb-4 rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {pageError}
              </p>
            ) : null}
            <OwnerHomestayForm
              cities={cities}
              initial={homestay}
              disabled={readOnly}
              saving={saving}
              onSubmit={handleSave}
            />
            {!readOnly ? (
              <button
                type="button"
                className="luxury-btn-sm luxury-btn-panel-outline mt-6"
                disabled={saving}
                onClick={() => void handleDelete()}
              >
                Archive / delete
              </button>
            ) : null}
          </LuxuryCheckoutPanel>

          <LuxuryCheckoutPanel>
            <h2 className="luxury-panel-heading font-display text-xl">Rooms</h2>
            <div className="mt-4">
              <OwnerRoomManager
                homestay={homestay}
                busy={roomBusy}
                onAdd={async (payload) => {
                  if (!accessToken) return;
                  setRoomBusy(true);
                  try {
                    const updated = await createOwnerHomestayRoom(accessToken, homestayId, payload);
                    setHomestay(updated);
                  } catch (err) {
                    setPageError(toErrorMessage(err, "Failed to add room."));
                  } finally {
                    setRoomBusy(false);
                  }
                }}
                onDeactivate={async (roomId) => {
                  if (!accessToken) return;
                  setRoomBusy(true);
                  try {
                    const updated = await updateOwnerHomestayRoom(accessToken, homestayId, roomId, {
                      isActive: false,
                    });
                    setHomestay(updated);
                  } catch (err) {
                    setPageError(toErrorMessage(err, "Failed to deactivate room."));
                  } finally {
                    setRoomBusy(false);
                  }
                }}
              />
            </div>
          </LuxuryCheckoutPanel>

          <LuxuryCheckoutPanel>
            <h2 className="luxury-panel-heading font-display text-xl">Calendar</h2>
            <div className="mt-4">
              <OwnerAvailabilityManager
                homestay={homestay}
                busy={roomBusy}
                onUpsert={async (payload) => {
                  if (!accessToken) return;
                  setRoomBusy(true);
                  try {
                    const updated = await upsertOwnerAvailability(accessToken, homestayId, payload);
                    setHomestay(updated);
                  } catch (err) {
                    setPageError(toErrorMessage(err, "Failed to update calendar."));
                  } finally {
                    setRoomBusy(false);
                  }
                }}
                onDelete={async (availabilityId) => {
                  if (!accessToken) return;
                  setRoomBusy(true);
                  try {
                    const updated = await deleteOwnerAvailability(accessToken, homestayId, availabilityId);
                    setHomestay(updated);
                  } catch (err) {
                    setPageError(toErrorMessage(err, "Failed to remove calendar entry."));
                  } finally {
                    setRoomBusy(false);
                  }
                }}
              />
            </div>
          </LuxuryCheckoutPanel>
        </div>
      ) : null}
    </HomestayOwnerDashboardShell>
  );
}
