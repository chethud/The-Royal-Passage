import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PayAtVenueBadge } from "@/components/booking/PayAtVenueBadge";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { useAuthUser } from "@/lib/auth-user";
import { submitBooking } from "@/lib/booking-fns";
import { formatDateLong } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";
import { getExperienceForDetail } from "@/lib/marketplace-fns";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

type Search = {
  slotId?: string;
  guests?: number;
};

export const Route = createFileRoute("/experiences/$slug/book")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    slotId: typeof s.slotId === "string" ? s.slotId : undefined,
    guests: typeof s.guests === "number" ? s.guests : undefined,
  }),
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
  const { exp } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user, role, loading } = useAuthUser();

  const initialSlot =
    exp.slots.find((s) => s.id === search.slotId && s.available > 0) ??
    exp.slots.find((s) => s.available > 0) ??
    null;

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(initialSlot?.id ?? null);
  const [guests, setGuests] = useState(search.guests ?? 2);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedSlot = useMemo(
    () => exp.slots.find((s) => s.id === selectedSlotId) ?? null,
    [exp.slots, selectedSlotId],
  );

  const sym = exp.currencySymbol ?? "₹";
  const totalMinor = selectedSlot ? exp.pricePerPerson * 100 * guests : 0;

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/sign-in", search: { redirect: `/experiences/${exp.slug}/book` } });
      return;
    }
    if (role && role !== "guest") {
      void navigate({ to: "/dashboard" });
    }
  }, [exp.slug, loading, navigate, role, user]);

  useEffect(() => {
    if (!selectedSlot) return;
    setGuests((g) => Math.min(Math.max(1, g), selectedSlot.available));
  }, [selectedSlot]);

  const handleSubmit = async () => {
    if (!selectedSlot || !user) return;
    setBusy(true);
    setError(null);

    try {
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
        to: "/bookings/$bookingId",
        params: { bookingId: result.bookingId },
        search: { confirmed: true },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking.");
    } finally {
      setBusy(false);
    }
  };

  if (loading || !user) {
    return <div className="min-h-screen pt-[var(--header-height)]" />;
  }

  return (
    <div className="pt-[var(--header-height)] text-foreground">
      <Header />

      <section className="container-page py-10 sm:py-14">
        <Link
          to="/experiences/$slug"
          params={{ slug: exp.slug }}
          className="text-xs eyebrow text-muted-foreground hover:text-foreground"
        >
          ← Back to experience
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="eyebrow mb-3 text-ember/90">Book your seats</div>
            <h1 className="font-display text-3xl sm:text-4xl">{exp.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {exp.city} · {exp.hostName}
            </p>

            <div className="mt-8">
              <h2 className="eyebrow mb-4">1. Choose a slot</h2>
              <div className="space-y-2">
                {exp.slots.map((slot) => {
                  const sold = slot.available === 0;
                  const active = selectedSlotId === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={sold}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`flex w-full items-center justify-between rounded-sm border p-4 text-left transition-all ${
                        active
                          ? "border-ember bg-ember/15 shadow-[var(--shadow-gold)]"
                          : sold
                            ? "cursor-not-allowed opacity-40"
                            : "border-[oklch(0.72_0.09_78_/_0.22)] hover:border-ember/45"
                      }`}
                    >
                      <div>
                        <div className="font-display text-lg">{formatDateLong(slot.date)}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {slot.start}–{slot.end}
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        {sold ? (
                          <span className="eyebrow">Sold out</span>
                        ) : (
                          <>
                            <div className="eyebrow opacity-70">Seats left</div>
                            <div className="font-display text-lg">
                              {slot.available}/{slot.capacity}
                            </div>
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="eyebrow mb-4">2. Number of guests</h2>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  aria-label="Decrease guests"
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  className="h-10 w-10 border border-[oklch(0.88_0.08_86_/_0.2)] hover:border-ember/50"
                >
                  −
                </button>
                <span className="font-display text-2xl w-8 text-center">{guests}</span>
                <button
                  type="button"
                  aria-label="Increase guests"
                  onClick={() =>
                    setGuests((g) => Math.min(selectedSlot?.available ?? 1, g + 1))
                  }
                  className="h-10 w-10 border border-[oklch(0.88_0.08_86_/_0.2)] hover:border-ember/50"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="eyebrow mb-4">3. Notes (optional)</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Dietary needs, accessibility requests, or questions for your host…"
                className="w-full rounded-sm border border-input bg-background/50 px-4 py-3 text-sm"
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

            <div className="mt-5">
              <PayAtVenueBadge />
            </div>

            {error ? (
              <p className="mt-4 rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              disabled={!selectedSlot || busy}
              onClick={() => void handleSubmit()}
              className="mt-6 w-full rounded-sm bg-ember py-4 text-sm font-medium tracking-wide text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 disabled:opacity-50"
            >
              {busy ? "Submitting…" : "Request booking"}
            </button>
            <p className="mt-3 text-center text-[0.65rem] text-muted-foreground">
              Your host will confirm. Pay at the venue on arrival.
            </p>
          </aside>
        </div>
      </section>

      <Footer />
    </div>
  );
}
