import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  ALLOWED_EXPERIENCE_PHOTO_MIME,
  EXPERIENCE_PHOTOS_BUCKET,
  MAX_EXPERIENCE_PHOTO_BYTES,
  PHOTO_CACHE_CONTROL,
} from "@/lib/experience-photos-config";
import {
  createProviderLogin,
  ensureUniqueSlug,
  slugifyTitle,
} from "@/lib/provider-invite.server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const lineListSchema = z.array(z.string().trim().min(1)).max(40);
const urlListSchema = z.array(z.string().url().max(2000)).max(20);

const submitSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(7).max(40),
  bio: z.string().trim().max(2000).optional(),
  city: z.string().trim().min(2).max(120),
  panNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Enter a valid PAN (e.g. ABCDE1234F)."),
  passportPhotoUrl: z.string().url().max(2000),
  tradeLicenseUrl: z.string().url().max(2000),
  title: z.string().trim().min(3).max(200),
  tagline: z.string().trim().max(280).optional(),
  description: z.string().trim().min(20).max(8000),
  categorySlug: z.string().trim().min(1).max(80),
  region: z.string().trim().max(120).optional(),
  address: z.string().trim().min(5).max(500),
  mapLink: z.string().trim().url().max(1000).optional(),
  durationMinutes: z.number().int().min(30).max(480),
  pricePerPersonMinor: z.number().int().positive().max(50_000_000),
  minGuests: z.number().int().min(1).max(50),
  maxGuests: z.number().int().min(1).max(50),
  heroImageUrl: z.string().url().max(2000).optional(),
  galleryUrls: urlListSchema.default([]),
  inclusions: lineListSchema.default([]),
  exclusions: lineListSchema.default([]),
  requirements: lineListSchema.default([]),
});

const adminTokenSchema = z.object({
  accessToken: z.string().min(1),
});

const reviewSchema = z.object({
  accessToken: z.string().min(1),
  applicationId: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
  adminNotes: z.string().trim().max(2000).optional(),
  slots: z
    .array(
      z.object({
        slotDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        startTime: z.string().min(4).max(8),
        endTime: z.string().min(4).max(8),
        capacity: z.number().int().min(1).max(200),
      }),
    )
    .optional(),
});

const photoUploadSchema = z.object({
  fileName: z.string().trim().min(1).max(200),
  contentType: z.string().trim().min(1).max(100),
  base64: z.string().min(1).max(7_500_000),
});

export type PartnerExperienceApplication = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  bio: string | null;
  city: string;
  panNumber: string | null;
  passportPhotoUrl: string | null;
  tradeLicenseUrl: string | null;
  title: string;
  tagline: string | null;
  description: string;
  categorySlug: string;
  region: string | null;
  address: string;
  mapLink: string | null;
  durationMinutes: number;
  pricePerPersonMinor: number;
  minGuests: number;
  maxGuests: number;
  heroImageUrl: string | null;
  galleryUrls: string[];
  inclusions: string[];
  exclusions: string[];
  requirements: string[];
  status: "pending" | "approved" | "rejected";
  adminNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function mapRow(row: Record<string, unknown>): PartnerExperienceApplication {
  return {
    id: String(row.id),
    fullName: String(row.full_name ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    bio: row.bio == null ? null : String(row.bio),
    city: String(row.city ?? ""),
    panNumber: row.pan_number == null ? null : String(row.pan_number),
    passportPhotoUrl: row.passport_photo_url == null ? null : String(row.passport_photo_url),
    tradeLicenseUrl: row.trade_license_url == null ? null : String(row.trade_license_url),
    title: String(row.title ?? ""),
    tagline: row.tagline == null ? null : String(row.tagline),
    description: String(row.description ?? ""),
    categorySlug: String(row.category_slug ?? ""),
    region: row.region == null ? null : String(row.region),
    address: String(row.address ?? ""),
    mapLink: row.map_link == null ? null : String(row.map_link),
    durationMinutes: Number(row.duration_minutes ?? 0),
    pricePerPersonMinor: Number(row.price_per_person_minor ?? 0),
    minGuests: Number(row.min_guests ?? 1),
    maxGuests: Number(row.max_guests ?? 1),
    heroImageUrl: row.hero_image_url == null ? null : String(row.hero_image_url),
    galleryUrls: Array.isArray(row.gallery_urls) ? row.gallery_urls.map(String) : [],
    inclusions: Array.isArray(row.inclusions) ? row.inclusions.map(String) : [],
    exclusions: Array.isArray(row.exclusions) ? row.exclusions.map(String) : [],
    requirements: Array.isArray(row.requirements) ? row.requirements.map(String) : [],
    status: row.status as PartnerExperienceApplication["status"],
    adminNotes: row.admin_notes == null ? null : String(row.admin_notes),
    reviewedAt: row.reviewed_at == null ? null : String(row.reviewed_at),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

async function requireAdmin(accessToken: string) {
  const supabase = getSupabaseAdmin();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    throw new Error("You must be signed in as an admin.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    throw new Error("Only admins can perform this action.");
  }

  return user;
}

async function notifyAdminsPartnerApplication(applicationId: string, title: string, fullName: string) {
  const supabase = getSupabaseAdmin();
  const { data: admins, error } = await supabase.from("profiles").select("id").eq("role", "admin");
  if (error) throw new Error(error.message);

  const rows = (admins ?? []).map((admin) => ({
    user_id: admin.id,
    type: "partner_experience_application",
    title: "New partner experience application",
    body: `${fullName} submitted "${title}" for review.`,
    metadata: {
      applicationId,
      href: "/admin/experiences/requests",
    },
  }));

  if (rows.length === 0) return;
  const { error: insertError } = await supabase.from("notifications").insert(rows);
  if (insertError) throw new Error(insertError.message);
}

function extensionFromContentType(contentType: string, fileName: string): string {
  const fromName = fileName.split(".").pop()?.toLowerCase();
  if (fromName && ["jpg", "jpeg", "png", "webp", "gif"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  if (contentType === "image/gif") return "gif";
  return "jpg";
}

export const uploadPartnerExperiencePhoto = createServerFn({ method: "POST" })
  .inputValidator(photoUploadSchema)
  .handler(async ({ data }): Promise<{ url: string }> => {
    if (!ALLOWED_EXPERIENCE_PHOTO_MIME.has(data.contentType)) {
      throw new Error("Use a JPEG, PNG, WebP, or GIF image.");
    }

    const raw = data.base64.includes(",") ? data.base64.split(",")[1]! : data.base64;
    const buffer = Buffer.from(raw, "base64");
    if (buffer.byteLength === 0 || buffer.byteLength > MAX_EXPERIENCE_PHOTO_BYTES) {
      throw new Error("Each photo must be between 1 byte and 5 MB.");
    }

    const ext = extensionFromContentType(data.contentType, data.fileName);
    const path = `partner-applications/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage.from(EXPERIENCE_PHOTOS_BUCKET).upload(path, buffer, {
      cacheControl: PHOTO_CACHE_CONTROL,
      upsert: false,
      contentType: data.contentType,
    });
    if (error) throw new Error(error.message);

    const { data: publicData } = supabase.storage.from(EXPERIENCE_PHOTOS_BUCKET).getPublicUrl(path);
    return { url: publicData.publicUrl };
  });

export const submitPartnerExperienceApplication = createServerFn({ method: "POST" })
  .inputValidator(submitSchema)
  .handler(async ({ data }) => {
    if (data.maxGuests < data.minGuests) {
      throw new Error("Maximum guests must be at least the minimum.");
    }

    const galleryUrls = data.galleryUrls.map((url) => url.trim()).filter(Boolean);
    const heroImageUrl = data.heroImageUrl?.trim() || galleryUrls[0] || null;
    const mapLink = data.mapLink?.trim() || null;

    const supabase = getSupabaseAdmin();
    const { data: row, error } = await supabase
      .from("partner_experience_applications")
      .insert({
        full_name: data.fullName,
        email: data.email.toLowerCase(),
        phone: data.phone,
        bio: data.bio?.trim() || null,
        city: data.city,
        pan_number: data.panNumber.trim().toUpperCase(),
        passport_photo_url: data.passportPhotoUrl,
        trade_license_url: data.tradeLicenseUrl,
        title: data.title,
        tagline: data.tagline?.trim() || null,
        description: data.description,
        category_slug: data.categorySlug,
        region: data.region?.trim() || null,
        address: data.address,
        map_link: mapLink,
        duration_minutes: data.durationMinutes,
        price_per_person_minor: data.pricePerPersonMinor,
        min_guests: data.minGuests,
        max_guests: data.maxGuests,
        hero_image_url: heroImageUrl,
        gallery_urls: galleryUrls,
        inclusions: data.inclusions,
        exclusions: data.exclusions,
        requirements: data.requirements,
        status: "pending",
      })
      .select("id, title, full_name")
      .single();

    if (error || !row) {
      throw new Error(error?.message ?? "Failed to submit application.");
    }

    await notifyAdminsPartnerApplication(String(row.id), String(row.title), String(row.full_name));
    return { id: String(row.id) };
  });

export const listPartnerExperienceApplications = createServerFn({ method: "POST" })
  .inputValidator(
    adminTokenSchema.extend({
      status: z.enum(["pending", "approved", "rejected", "all"]).default("pending"),
    }),
  )
  .handler(async ({ data }): Promise<PartnerExperienceApplication[]> => {
    await requireAdmin(data.accessToken);
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from("partner_experience_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (data.status !== "all") {
      query = query.eq("status", data.status);
    }

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return (rows ?? []).map((row) => mapRow(row as Record<string, unknown>));
  });

export const countPendingPartnerExperienceApplications = createServerFn({ method: "POST" })
  .inputValidator(adminTokenSchema)
  .handler(async ({ data }): Promise<number> => {
    await requireAdmin(data.accessToken);
    const supabase = getSupabaseAdmin();
    const { count, error } = await supabase
      .from("partner_experience_applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");

    if (error) throw new Error(error.message);
    return count ?? 0;
  });

export const reviewPartnerExperienceApplication = createServerFn({ method: "POST" })
  .inputValidator(reviewSchema)
  .handler(async ({ data }) => {
    const admin = await requireAdmin(data.accessToken);
    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();

    const { data: application, error: loadError } = await supabase
      .from("partner_experience_applications")
      .select("*")
      .eq("id", data.applicationId)
      .eq("status", "pending")
      .maybeSingle();

    if (loadError) throw new Error(loadError.message);
    if (!application) throw new Error("Application not found or already reviewed.");

    if (data.action === "reject") {
      const { data: row, error } = await supabase
        .from("partner_experience_applications")
        .update({
          status: "rejected",
          reviewed_by: admin.id,
          reviewed_at: now,
          admin_notes: data.adminNotes?.trim() || null,
          updated_at: now,
        })
        .eq("id", data.applicationId)
        .eq("status", "pending")
        .select("id")
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (!row) throw new Error("Application not found or already reviewed.");
      return { id: String(row.id), status: "rejected" as const, passwordEmailWarning: null as string | null };
    }

    const slots = data.slots ?? [];
    if (slots.length < 1) {
      throw new Error("Add at least one bookable session before approving.");
    }

    const login = await createProviderLogin({
      email: String(application.email),
      fullName: String(application.full_name),
      phone: application.phone == null ? null : String(application.phone),
      bio: application.bio == null ? null : String(application.bio),
      role: "host",
    });

    if (!login.hostId) {
      throw new Error("Host profile was not created for this applicant.");
    }

    const slug = await ensureUniqueSlug(
      "experiences",
      slugifyTitle(String(application.title), "experience"),
    );
    const galleryUrls = Array.isArray(application.gallery_urls)
      ? application.gallery_urls.map(String)
      : [];
    const heroImageUrl =
      (application.hero_image_url == null ? null : String(application.hero_image_url)) ||
      galleryUrls[0] ||
      null;

    const insertRow: Record<string, unknown> = {
      host_id: login.hostId,
      slug,
      title: String(application.title).trim(),
      tagline: application.tagline == null ? null : String(application.tagline),
      description: String(application.description).trim(),
      category_slug: String(application.category_slug),
      city_slug: "mysuru",
      city: "Mysuru",
      region: application.region == null ? null : String(application.region),
      address: String(application.address),
      duration_minutes: Number(application.duration_minutes),
      price_per_person_minor: Number(application.price_per_person_minor),
      hero_image_url: heroImageUrl,
      gallery_urls: galleryUrls,
      inclusions: Array.isArray(application.inclusions) ? application.inclusions : [],
      exclusions: Array.isArray(application.exclusions) ? application.exclusions : [],
      requirements: Array.isArray(application.requirements) ? application.requirements : [],
      min_guests_per_booking: Number(application.min_guests ?? 1),
      max_guests_per_booking: Number(application.max_guests ?? 1),
      status: "published",
      currency_code: "INR",
    };
    if (application.map_link) {
      insertRow.map_link = String(application.map_link);
    }

    const { data: experienceRow, error: experienceError } = await supabase
      .from("experiences")
      .insert(insertRow)
      .select("id")
      .single();

    if (experienceError || !experienceRow) {
      throw new Error(experienceError?.message ?? "Failed to create experience listing.");
    }

    const experienceId = String(experienceRow.id);
    const { error: slotsError } = await supabase.from("experience_slots").insert(
      slots.map((slot) => ({
        experience_id: experienceId,
        slot_date: slot.slotDate,
        start_time: slot.startTime,
        end_time: slot.endTime,
        capacity: slot.capacity,
      })),
    );
    if (slotsError) {
      await supabase.from("experiences").delete().eq("id", experienceId);
      throw new Error(slotsError.message);
    }

    const { data: row, error } = await supabase
      .from("partner_experience_applications")
      .update({
        status: "approved",
        reviewed_by: admin.id,
        reviewed_at: now,
        admin_notes: data.adminNotes?.trim() || null,
        updated_at: now,
        created_user_id: login.userId,
        created_experience_id: experienceId,
      })
      .eq("id", data.applicationId)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!row) throw new Error("Application not found or already reviewed.");

    return {
      id: String(row.id),
      status: "approved" as const,
      experienceId,
      userId: login.userId,
      passwordEmailWarning: login.passwordEmailWarning,
    };
  });
