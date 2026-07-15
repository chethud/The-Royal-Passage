import type { AdminModerationReview, AdminModerationReviews, ReviewSummary } from "@/lib/api/reviews";
import { verifySupabaseAccessToken } from "@/lib/auth-verify.server";
import { isSupabaseConfigured } from "@/lib/env.server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type ReviewRow = {
  id: string;
  experience_id: string;
  booking_id: string | null;
  guest_id: string | null;
  rating: number;
  comment: string | null;
  reviewer_display_name: string | null;
  host_reply: string | null;
  host_replied_at: string | null;
  is_verified: boolean | null;
  status: string | null;
  created_at: string;
};

function mapReviewRow(row: ReviewRow): ReviewSummary {
  return {
    id: row.id,
    experienceId: row.experience_id,
    bookingId: row.booking_id,
    rating: row.rating,
    comment: row.comment,
    reviewerDisplayName: row.reviewer_display_name,
    hostReply: row.host_reply,
    hostRepliedAt: row.host_replied_at,
    isVerified: Boolean(row.is_verified),
    status: row.status ?? "published",
    createdAt: row.created_at,
  };
}

async function loadPublishedReviewsForExperienceId(
  experienceId: string,
  limit = 20,
): Promise<ReviewSummary[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("experience_id", experienceId)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapReviewRow(row as ReviewRow));
}

export async function loadPublishedReviewsForSlug(
  slug: string,
  limit = 20,
): Promise<ReviewSummary[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = getSupabaseAdmin();
  const { data: exp, error: expError } = await supabase
    .from("experiences")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (expError) throw new Error(expError.message);
  if (!exp) return [];

  return loadPublishedReviewsForExperienceId(exp.id, limit);
}

export async function loadReviewForBookingId(bookingId: string): Promise<ReviewSummary | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("booking_id", bookingId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapReviewRow(data as ReviewRow) : null;
}

export async function createGuestReviewInDb(
  accessToken: string,
  payload: { bookingId: string; rating: number; comment?: string },
): Promise<ReviewSummary> {
  if (!isSupabaseConfigured()) {
    throw new Error("Reviews are not configured on the server.");
  }

  const user = await verifySupabaseAccessToken(accessToken);
  const supabase = getSupabaseAdmin();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) throw new Error(profileError.message);

  const guestName = profile?.full_name || user.email || "Guest";

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id, guest_id, experience_id, booking_status")
    .eq("id", payload.bookingId)
    .maybeSingle();
  if (bookingError) throw new Error(bookingError.message);
  if (!booking) throw new Error("Booking not found.");
  if (booking.guest_id !== user.id) {
    throw new Error("You can only review your own bookings.");
  }
  if (booking.booking_status !== "completed") {
    throw new Error("Only completed bookings can be reviewed.");
  }

  const { data: existing, error: existingError } = await supabase
    .from("reviews")
    .select("id")
    .eq("booking_id", payload.bookingId)
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);
  if (existing) throw new Error("You have already reviewed this booking.");

  const { data: inserted, error: insertError } = await supabase
    .from("reviews")
    .insert({
      experience_id: booking.experience_id,
      booking_id: payload.bookingId,
      guest_id: user.id,
      rating: payload.rating,
      comment: payload.comment?.trim() || null,
      reviewer_display_name: guestName,
      is_verified: true,
      status: "published",
    })
    .select("*")
    .single();

  if (insertError) throw new Error(insertError.message);
  return mapReviewRow(inserted as ReviewRow);
}

export async function hostReplyToReviewInDb(
  accessToken: string,
  reviewId: string,
  reply: string,
): Promise<ReviewSummary> {
  if (!isSupabaseConfigured()) {
    throw new Error("Reviews are not configured on the server.");
  }

  const user = await verifySupabaseAccessToken(accessToken);
  const supabase = getSupabaseAdmin();

  const { data: host, error: hostError } = await supabase
    .from("hosts")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (hostError) throw new Error(hostError.message);
  if (!host) throw new Error("Host account not found.");

  const { data: review, error: reviewError } = await supabase
    .from("reviews")
    .select("*, experiences ( host_id )")
    .eq("id", reviewId)
    .maybeSingle();
  if (reviewError) throw new Error(reviewError.message);
  if (!review) throw new Error("Review not found.");

  const experience = review.experiences as { host_id?: string } | null;
  if (experience?.host_id !== host.id) {
    throw new Error("You do not have access to this review.");
  }

  const now = new Date().toISOString();
  const { data: updated, error: updateError } = await supabase
    .from("reviews")
    .update({ host_reply: reply.trim(), host_replied_at: now })
    .eq("id", reviewId)
    .select("*")
    .single();

  if (updateError) throw new Error(updateError.message);
  return mapReviewRow(updated as ReviewRow);
}

async function requireAdminUser(accessToken: string) {
  const user = await verifySupabaseAccessToken(accessToken);
  const supabase = getSupabaseAdmin();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (profile?.role !== "admin") {
    throw new Error("Only admins can moderate reviews.");
  }
  return user;
}

export async function loadAdminModerationReviews(limitPerKind = 5): Promise<AdminModerationReviews> {
  if (!isSupabaseConfigured()) {
    return { experiences: [], homestays: [] };
  }

  const supabase = getSupabaseAdmin();

  const { data: expRows, error: expError } = await supabase
    .from("reviews")
    .select("id, experience_id, rating, comment, reviewer_display_name, status, created_at, experiences(title)")
    .order("rating", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limitPerKind);

  if (expError) throw new Error(expError.message);

  const experiences: AdminModerationReview[] = (expRows ?? []).map((row) => {
    const exp = row.experiences as { title?: string } | { title?: string }[] | null;
    const title = Array.isArray(exp) ? exp[0]?.title : exp?.title;
    return {
      id: row.id,
      kind: "experience",
      listingId: row.experience_id,
      listingTitle: title ?? null,
      rating: row.rating,
      comment: row.comment,
      reviewerDisplayName: row.reviewer_display_name,
      status: row.status ?? "published",
      createdAt: row.created_at,
    };
  });

  const { data: hsRows, error: hsError } = await supabase
    .from("homestay_reviews")
    .select("id, homestay_id, guest_id, rating, title, body, status, created_at, homestays(title)")
    .order("rating", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limitPerKind);

  if (hsError) throw new Error(hsError.message);

  const guestIds = [...new Set((hsRows ?? []).map((r) => r.guest_id).filter(Boolean))];
  const nameByGuest = new Map<string, string>();
  if (guestIds.length > 0) {
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", guestIds);
    if (profileError) throw new Error(profileError.message);
    for (const profile of profiles ?? []) {
      if (profile.full_name) nameByGuest.set(profile.id, profile.full_name);
    }
  }

  const homestays: AdminModerationReview[] = (hsRows ?? []).map((row) => {
    const hs = row.homestays as { title?: string } | { title?: string }[] | null;
    const title = Array.isArray(hs) ? hs[0]?.title : hs?.title;
    let comment: string | null = null;
    if (row.title && row.body) comment = `${row.title} — ${row.body}`;
    else if (row.title) comment = row.title;
    else if (row.body) comment = row.body;
    return {
      id: row.id,
      kind: "homestay",
      listingId: row.homestay_id,
      listingTitle: title ?? null,
      rating: row.rating,
      comment,
      reviewerDisplayName: nameByGuest.get(row.guest_id) ?? null,
      status: row.status ?? "pending",
      createdAt: row.created_at,
    };
  });

  return { experiences, homestays };
}

export async function hideExperienceReviewInDb(
  accessToken: string,
  reviewId: string,
): Promise<ReviewSummary> {
  await requireAdminUser(accessToken);
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("reviews")
    .update({ status: "hidden" })
    .eq("id", reviewId)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapReviewRow(data as ReviewRow);
}

export async function hideHomestayReviewInDb(
  accessToken: string,
  reviewId: string,
): Promise<AdminModerationReview> {
  await requireAdminUser(accessToken);
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("homestay_reviews")
    .update({ status: "rejected" })
    .eq("id", reviewId)
    .select("id, homestay_id, guest_id, rating, title, body, status, created_at, homestays(title)")
    .single();
  if (error) throw new Error(error.message);

  const hs = data.homestays as { title?: string } | { title?: string }[] | null;
  const title = Array.isArray(hs) ? hs[0]?.title : hs?.title;
  let comment: string | null = null;
  if (data.title && data.body) comment = `${data.title} — ${data.body}`;
  else comment = data.body || data.title || null;

  let reviewerDisplayName: string | null = null;
  if (data.guest_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", data.guest_id)
      .maybeSingle();
    reviewerDisplayName = profile?.full_name ?? null;
  }

  return {
    id: data.id,
    kind: "homestay",
    listingId: data.homestay_id,
    listingTitle: title ?? null,
    rating: data.rating,
    comment,
    reviewerDisplayName,
    status: data.status ?? "rejected",
    createdAt: data.created_at,
  };
}
