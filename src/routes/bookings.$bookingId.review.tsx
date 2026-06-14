import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { useAuthUser } from "@/lib/auth-user";
import { fetchBookingById, type BookingSummary } from "@/lib/api/bookings";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { createReview } from "@/lib/review-fns";
import { experienceDetailSlug } from "@/lib/experience-path";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export const Route = createFileRoute("/bookings/$bookingId/review")({
  head: () => ({
    meta: [{ title: "Leave a review — The Royal Passage" }],
  }),
  component: BookingReviewPage,
});

function BookingReviewPage() {
  const { bookingId } = Route.useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuthUser();
  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/sign-in" });
      return;
    }

    void (async () => {
      try {
        const { data: sessionData } = await getSupabaseBrowser().auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) throw new Error("Please sign in again.");

        if (!isApiConfigured()) {
          throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
        }
        const row = await fetchBookingById(token, bookingId);
        if (row.bookingStatus !== "completed") {
          throw new Error("Only completed bookings can be reviewed.");
        }
        setBooking(row);
      } catch (err) {
        setLoadError(toErrorMessage(err, "Failed to load booking."));
      }
    })();
  }, [bookingId, loading, navigate, user]);

  const handleSubmit = async (payload: { rating: number; comment: string }) => {
    if (!booking) return;
    setSubmitting(true);
    try {
      const { data: sessionData } = await getSupabaseBrowser().auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Please sign in again.");

      await createReview({
        data: {
          accessToken: token,
          bookingId,
          rating: payload.rating,
          comment: payload.comment || undefined,
        },
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || (!booking && !loadError)) {
    return <div className="min-h-screen pt-[var(--header-height)]" />;
  }

  if (loadError || !booking) {
    return (
      <div className="min-h-screen pt-[var(--header-height)] text-foreground">
        <Header />
        <div className="container-page py-20 max-w-lg">
          <p className="text-destructive">{loadError ?? "Booking not found."}</p>
          <Link to="/dashboard/history" className="mt-4 inline-block text-ember hover:underline">
            Back to past bookings
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[var(--header-height)] text-foreground">
      <Header />

      <section className="container-page py-12 sm:py-16 max-w-lg">
        <div className="eyebrow mb-2 text-muted-foreground">Share your experience</div>
        <h1 className="font-display text-3xl sm:text-4xl">{booking.experience.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your review helps other travellers discover authentic Mysuru experiences.
        </p>

        {submitted ? (
          <div className="glass-strong mt-8 rounded-md border border-ember/30 bg-ember/10 p-6">
            <p className="text-sm">Thank you — your review has been published.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/experiences/$slug"
                params={{
                  slug: experienceDetailSlug(booking.experience) ?? booking.experience.id,
                }}
                className="text-sm text-ember hover:underline"
              >
                View experience
              </Link>
              <Link to="/dashboard/history" className="text-sm text-ember hover:underline">
                Booking history
              </Link>
            </div>
          </div>
        ) : (
          <div className="glass-strong mt-8 rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6 sm:p-8">
            <ReviewForm onSubmit={handleSubmit} submitting={submitting} />
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
