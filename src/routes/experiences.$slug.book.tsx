import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ExperienceBookingPanel } from "@/components/booking/ExperienceBookingPanel";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { useAuthUser } from "@/lib/auth-user";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { fetchGuestProfile } from "@/lib/api/guest";
import { submitBooking } from "@/lib/booking-fns";
import { bookExperiencePath, guestBookingLimits, parseBookSearch } from "@/lib/booking-url";
import { formatDateLong } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";
import { getExperienceForDetail } from "@/lib/marketplace-fns";
import { isGuestAccount, isStaffRole } from "@/lib/roles";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export const Route = createFileRoute("/experiences/$slug/book")({
  validateSearch: parseBookSearch,
  loader: async ({ params }) => {
    const row = await getExperienceForDetail({ data: { slug: params.slug } });
    if (!row) throw new Error("Experience not found.");
    return row;
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.exp
          ? `Book ${loaderData.exp.title} — The Royal Passage`
          : "Book experience — The Royal Passage",
      },
    ],
  }),
  component: BookExperiencePage,
});

function BookExperiencePage() {
  const { exp, source } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();

  const initialSlot = useMemo(() => {
    const fromSearch = search.slotId
      ? exp.slots.find((s) => s.id === search.slotId && s.available > 0)
      : null;
    return fromSearch ?? exp.slots.find((s) => s.available > 0) ?? null;
  }, [exp.slots, search.slotId]);

  const [selectedSlot, setSelectedSlot] = useState(initialSlot);
  const [guests, setGuests] = useState(() => {
    if (!initialSlot) return 1;
    const { min, max } = guestBookingLimits(exp, initialSlot.available);
    const preferred = search.guests ?? min;
    return Math.min(Math.max(min, preferred), max);
  });
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileReady, setProfileReady] = useState(false);

  const sym = exp.currencySymbol ?? "₹";
  const totalMinor = selectedSlot ? exp.pricePerPerson * 100 * guests : 0;
  const redirectPath = bookExperiencePath(exp.slug, {
    slotId: selectedSlot?.id,
    guests,
  });
  const isLiveExperience = source === "live";

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/sign-in", search: { redirect: redirectPath } });
      return;
    }
    if (isStaffRole(role)) {
      void navigate({ to: "/dashboard" });
    }
  }, [loading, navigate, redirectPath, role, user]);

  useEffect(() => {
    if (!user || isStaffRole(role)) {
      setProfileReady(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        if (!isApiConfigured()) {
          if (!cancelled) setProfileReady(true);
          return;
        }
        const { data: sessionData } = await getSupabaseBrowser().auth.getSession();
        const token = sessionData.session?.access_token;
        if (token) {
          await fetchGuestProfile(token);
        }
      } catch {
        // Booking will surface a clearer error if profile sync fails.
      } finally {
        if (!cancelled) setProfileReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [role, user]);

  useEffect(() => {
    if (!selectedSlot) return;
    const { min, max } = guestBookingLimits(exp, selectedSlot.available);
    setGuests((g) => Math.min(Math.max(min, g), max));
  }, [exp, selectedSlot]);

  const handleSubmit = async () => {
    if (!selectedSlot || !user) return;
    if (!isLiveExperience) {
      setError("This experience is not available for online booking yet. Please browse live listings.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      const { data: sessionData } = await getSupabaseBrowser().auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Please sign in again to complete your booking.");

      const result = await submitBooking({
        data: {
          accessToken: token,
          slotId: selectedSlot.id,
          guestCount: guests,
          notes: notes.trim() || undefined,
        },
      });

      void navigate({
        to: "/dashboard",
        search: { booked: result.bookingId },
      });
    } catch (err) {
      setError(toErrorMessage(err, "Failed to create booking."));
    } finally {
      setBusy(false);
    }
  };

  if (loading || !user || !profileReady) {
    return (
      <div className="min-h-screen pt-[var(--header-height)] text-foreground">
        <Header />
        <div className="container-page py-16">
          <p className="text-sm text-muted-foreground">Preparing your booking…</p>
        </div>
      </div>
    );
  }

  if (!isGuestAccount(role)) {
    return null;
  }

  return (
    <div className="pt-[var(--header-height)] text-foreground">
      <Header />

      <section className="container-page py-10 sm:py-14">
        <Link
          to="/experiences/$slug"
          params={{ slug: exp.slug }}
          hash="book"
          className="text-xs eyebrow text-muted-foreground hover:text-foreground"
        >
          ← Back to experience
        </Link>

        {!isLiveExperience ? (
          <div className="mt-6 rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            This listing is preview-only and cannot be booked online. Please choose a live experience
            from the library.
          </div>
        ) : null}

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="eyebrow mb-3 text-ember/90">Book your seats</div>
            <h1 className="font-display text-3xl sm:text-4xl">{exp.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {exp.city} · {exp.hostName}
            </p>

            <div className="mt-8">
              <ExperienceBookingPanel
                exp={exp}
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlot}
                guests={guests}
                onGuestsChange={setGuests}
                variant="checkout"
                signedIn
                userRole={role ?? "guest"}
                notes={notes}
                onNotesChange={setNotes}
                onConfirm={() => void handleSubmit()}
                busy={busy}
                error={error}
              />
            </div>
          </div>

          <aside className="glass-strong h-fit rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-6 lg:sticky lg:top-[calc(var(--header-height)+1rem)]">
            <h2 className="font-display text-2xl">Summary</h2>
            <div className="hairline my-5" />

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Experience</dt>
                <dd className="text-right">{exp.title}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Date</dt>
                <dd className="text-right">
                  {selectedSlot ? formatDateLong(selectedSlot.date) : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Guests</dt>
                <dd>{guests}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Per person</dt>
                <dd>
                  {sym}
                  {exp.pricePerPerson}
                </dd>
              </div>
            </dl>

            <div className="hairline my-5" />

            <div className="flex items-baseline justify-between">
              <span className="eyebrow text-muted-foreground">Total</span>
              <span className="font-display text-3xl">
                {selectedSlot ? formatMoney(totalMinor, sym) : "—"}
              </span>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </div>
  );
}
