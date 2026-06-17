import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { useAuthUser } from "@/lib/auth-user";
import { fetchBookingById, type BookingSummary } from "@/lib/api/bookings";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { submitReview } from "@/lib/api/reviews";
import { experienceDetailSlug } from "@/lib/experience-path";
import { submitGuestReviewFallback } from "@/lib/guest-review-submit";
import { getReviewForBooking } from "@/lib/review-fns";
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
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/sign-in", search: { redirect: `/bookings/${bookingId}/review` } });
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

        const [row, existing] = await Promise.all([
          fetchBookingById(token, bookingId),
          getReviewForBooking({ data: { bookingId } }),
        ]);

        if (row.bookingStatus !== "completed") {
          throw new Error("Only completed bookings can be reviewed.");
        }

        setAlreadyReviewed(Boolean(existing));
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

      let apiError: string | null = null;

      if (isApiConfigured()) {
        try {
          await submitReview(token, {
            bookingId,
            rating: payload.rating,
            comment: payload.comment || undefined,
          });
          setSubmitted(true);
          return;
        } catch (err) {
          apiError = toErrorMessage(err, "Review API unavailable.");
        }
      }

      try {
        await submitGuestReviewFallback(token, {
          bookingId,
          rating: payload.rating,
          comment: payload.comment || undefined,
        });
        setSubmitted(true);
      } catch (err) {
        const fallbackMessage = toErrorMessage(err, "Failed to submit review.");
        throw new Error(apiError ? `${fallbackMessage} (${apiError})` : fallbackMessage);
      }
    } catch (err) {
      throw err instanceof Error ? err : new Error(toErrorMessage(err, "Failed to submit review."));
    } finally {
      setSubmitting(false);
    }
  };

  const experienceSlug = booking ? experienceDetailSlug(booking.experience) : null;

  if (loading || (!booking && !loadError)) {
    return <div className="min-h-screen pt-[var(--header-height)]" />;
  }

  if (loadError || !booking) {
    return (
      <div className="min-h-screen pt-[var(--header-height)] text-foreground">
        <Header />
        <div className="container-page max-w-lg py-20">
          <LuxuryCheckoutPanel>
            <p className="text-destructive">{loadError ?? "Booking not found."}</p>
            <Link
              to="/dashboard/history"
              className="luxury-btn-sm luxury-btn-panel-outline mt-4 inline-flex items-center no-underline"
            >
              Back to past bookings
            </Link>
          </LuxuryCheckoutPanel>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[var(--header-height)] text-foreground">
      <Header />

      <section className="container-page max-w-2xl py-12 sm:py-16">
        <Link
          to="/bookings/$bookingId"
          params={{ bookingId }}
          className="inline-flex text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-gold transition-colors hover:text-ink"
        >
          ← Back to booking
        </Link>

        <LuxuryCheckoutPanel className="mt-6">
          <div className="eyebrow luxury-panel-label mb-2">Share your experience</div>
          <h1 className="luxury-panel-heading font-display text-2xl uppercase leading-tight tracking-[0.04em] sm:text-3xl">
            {booking.experience.title}
          </h1>
          <p className="luxury-panel-body mt-2 text-sm leading-relaxed">
            Your review helps other travellers discover authentic experiences. It will appear on
            the experience page for everyone to read.
          </p>

          {submitted ? (
            <div className="mt-8 rounded-sm border border-[rgb(201_162_39/0.35)] bg-[rgb(201_162_39/0.12)] p-6">
              <p className="luxury-panel-body text-sm">
                Thank you — your review has been published.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {experienceSlug ? (
                  <Link
                    to="/experiences/$slug"
                    params={{ slug: experienceSlug }}
                    search={{}}
                    className="luxury-btn-sm luxury-btn-panel-outline inline-flex items-center no-underline"
                  >
                    View experience
                  </Link>
                ) : null}
                <Link
                  to="/dashboard/history"
                  className="luxury-btn-sm luxury-btn-panel-outline inline-flex items-center no-underline"
                >
                  Booking history
                </Link>
              </div>
            </div>
          ) : alreadyReviewed ? (
            <div className="mt-8 rounded-sm border border-[rgb(88_16_0/0.15)] bg-[rgb(88_16_0/0.04)] p-6">
              <p className="luxury-panel-body text-sm">
                You have already reviewed this booking.
              </p>
              {experienceSlug ? (
                <Link
                  to="/experiences/$slug"
                  params={{ slug: experienceSlug }}
                  search={{}}
                  className="luxury-btn-sm luxury-btn-panel-outline mt-4 inline-flex items-center no-underline"
                >
                  See reviews on experience page
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="mt-8 border-t luxury-panel-divider pt-8">
              <ReviewForm onSubmit={handleSubmit} submitting={submitting} surface="light" />
            </div>
          )}
        </LuxuryCheckoutPanel>
      </section>

      <Footer />
    </div>
  );
}
