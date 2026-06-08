import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { HostDashboardShell } from "@/components/host/HostDashboardShell";
import { HostReviewsList } from "@/components/host/HostReviewsList";
import { listHostReviews, type HostReviewSummary } from "@/lib/host-fns";
import { useHostAccess } from "@/lib/use-host-access";

export const Route = createFileRoute("/host/reviews")({
  head: () => ({
    meta: [
      { title: "Host reviews — The Royal Passage" },
      { name: "description", content: "Recent guest ratings for your experiences." },
    ],
  }),
  component: HostReviewsPage,
});

function HostReviewsPage() {
  const { accessToken, ready, loading } = useHostAccess();
  const [reviews, setReviews] = useState<HostReviewSummary[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const loadPage = useCallback(async () => {
    if (!accessToken) return;
    setPageLoading(true);
    setPageError(null);
    try {
      const rows = await listHostReviews({ data: { accessToken } });
      setReviews(rows);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : "Failed to load reviews.");
    } finally {
      setPageLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!ready) return;
    void loadPage();
  }, [loadPage, ready]);

  if (loading || !ready) {
    return <div className="min-h-[50vh] pt-[var(--header-height)]" />;
  }

  return (
    <HostDashboardShell
      title="Reviews"
      subtitle="Recent guest ratings and comments across your experiences."
    >
      {pageLoading ? (
        <p className="text-sm text-muted-foreground">Loading reviews…</p>
      ) : pageError ? (
        <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {pageError}
        </p>
      ) : (
        <HostReviewsList
          reviews={reviews}
          accessToken={accessToken!}
          onUpdated={() => void loadPage()}
        />
      )}
    </HostDashboardShell>
  );
}
