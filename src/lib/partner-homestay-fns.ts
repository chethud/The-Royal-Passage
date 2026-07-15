import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  createProviderLogin,
  ensureUniqueSlug,
  slugifyTitle,
} from "@/lib/provider-invite.server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const lineListSchema = z.array(z.string().trim().min(1)).max(40);
const urlListSchema = z.array(z.string().url().max(2000)).max(20);

const propertyTypeSchema = z.enum(["Home Stay", "Resort", "Hotel"]);

const GST_PRICE_THRESHOLD_MAJOR = 8000;

const submitSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(200),
    phone: z.string().trim().min(7).max(40),
    bio: z.string().trim().max(2000).optional(),
    city: z.string().trim().min(2).max(120),
    fssaiId: z.string().trim().min(5).max(40),
    panNumber: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Enter a valid PAN (e.g. ABCDE1234F)."),
    passportPhotoUrl: z.string().url().max(2000),
    gstNumber: z.string().trim().toUpperCase().max(20).optional(),
    title: z.string().trim().min(3).max(200),
    tagline: z.string().trim().max(280).optional(),
    description: z.string().trim().min(20).max(8000),
    propertyType: propertyTypeSchema,
    region: z.string().trim().max(120).optional(),
    address: z.string().trim().min(5).max(500),
    mapLink: z.string().trim().url().max(1000).optional(),
    pricePerNightMinor: z.number().int().positive().max(50_000_000),
    weekendPricePerNightMinor: z.number().int().positive().max(50_000_000).optional(),
    heroImageUrl: z.string().url().max(2000).optional(),
    galleryUrls: urlListSchema.default([]),
    amenities: lineListSchema.default([]),
    houseRules: lineListSchema.default([]),
    bedrooms: z.number().int().min(1).max(50),
    bathrooms: z.number().int().min(1).max(50),
    maxGuests: z.number().int().min(1).max(100),
    checkInTime: z.string().min(4).max(8).default("14:00"),
    checkOutTime: z.string().min(4).max(8).default("11:00"),
    extraBedAvailable: z.boolean().default(false),
    extraBedPricePerNightMinor: z.number().int().min(0).max(50_000_000).default(0),
    weekendExtraBedPricePerNightMinor: z.number().int().min(0).max(50_000_000).default(0),
    extraBedsPerRoom: z.union([z.literal(1), z.literal(2)]).default(1),
    licenseCertificateUrl: z.string().url().max(2000),
  })
  .superRefine((data, ctx) => {
    const weekdayMajor = Math.round(data.pricePerNightMinor / 100);
    const weekendMajor = Math.round(
      (data.weekendPricePerNightMinor ?? data.pricePerNightMinor) / 100,
    );
    const needsGst =
      weekdayMajor > GST_PRICE_THRESHOLD_MAJOR || weekendMajor > GST_PRICE_THRESHOLD_MAJOR;
    if (needsGst) {
      const gst = data.gstNumber?.trim() ?? "";
      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gst)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["gstNumber"],
          message: "GST number is required when price per room per day is above ₹8,000.",
        });
      }
    }
  });

const adminTokenSchema = z.object({
  accessToken: z.string().min(1),
});

const reviewSchema = z.object({
  accessToken: z.string().min(1),
  applicationId: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
  adminNotes: z.string().trim().max(2000).optional(),
  rooms: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(120),
        category: z.string().trim().max(80).optional(),
        capacity: z.number().int().min(1).max(50),
        pricePerNightMinor: z.number().int().positive().max(50_000_000),
        weekendPricePerNightMinor: z.number().int().positive().max(50_000_000).optional(),
        totalUnits: z.number().int().min(1).max(50).default(1),
      }),
    )
    .optional(),
});

export type PartnerHomestayApplication = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  bio: string | null;
  city: string;
  fssaiId: string | null;
  panNumber: string | null;
  passportPhotoUrl: string | null;
  gstNumber: string | null;
  title: string;
  tagline: string | null;
  description: string;
  propertyType: string;
  region: string | null;
  address: string;
  mapLink: string | null;
  pricePerNightMinor: number;
  weekendPricePerNightMinor: number | null;
  heroImageUrl: string | null;
  galleryUrls: string[];
  amenities: string[];
  houseRules: string[];
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  checkInTime: string;
  checkOutTime: string;
  extraBedAvailable: boolean;
  extraBedPricePerNightMinor: number;
  weekendExtraBedPricePerNightMinor: number;
  extraBedsPerRoom: number;
  licenseCertificateUrl: string;
  status: "pending" | "approved" | "rejected";
  adminNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function mapRow(row: Record<string, unknown>): PartnerHomestayApplication {
  return {
    id: String(row.id),
    fullName: String(row.full_name ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    bio: row.bio == null ? null : String(row.bio),
    city: String(row.city ?? ""),
    fssaiId: row.fssai_id == null ? null : String(row.fssai_id),
    panNumber: row.pan_number == null ? null : String(row.pan_number),
    passportPhotoUrl: row.passport_photo_url == null ? null : String(row.passport_photo_url),
    gstNumber: row.gst_number == null ? null : String(row.gst_number),
    title: String(row.title ?? ""),
    tagline: row.tagline == null ? null : String(row.tagline),
    description: String(row.description ?? ""),
    propertyType: String(row.property_type ?? "Home Stay"),
    region: row.region == null ? null : String(row.region),
    address: String(row.address ?? ""),
    mapLink: row.map_link == null ? null : String(row.map_link),
    pricePerNightMinor: Number(row.price_per_night_minor ?? 0),
    weekendPricePerNightMinor:
      row.weekend_price_per_night_minor == null
        ? null
        : Number(row.weekend_price_per_night_minor),
    heroImageUrl: row.hero_image_url == null ? null : String(row.hero_image_url),
    galleryUrls: Array.isArray(row.gallery_urls) ? row.gallery_urls.map(String) : [],
    amenities: Array.isArray(row.amenities) ? row.amenities.map(String) : [],
    houseRules: Array.isArray(row.house_rules) ? row.house_rules.map(String) : [],
    bedrooms: Number(row.bedrooms ?? 1),
    bathrooms: Number(row.bathrooms ?? 1),
    maxGuests: Number(row.max_guests ?? 2),
    checkInTime: String(row.check_in_time ?? "14:00"),
    checkOutTime: String(row.check_out_time ?? "11:00"),
    extraBedAvailable: Boolean(row.extra_bed_available),
    extraBedPricePerNightMinor: Number(row.extra_bed_price_per_night_minor ?? 0),
    weekendExtraBedPricePerNightMinor: Number(row.weekend_extra_bed_price_per_night_minor ?? 0),
    extraBedsPerRoom: Number(row.extra_beds_per_room ?? 1),
    licenseCertificateUrl: String(row.license_certificate_url ?? ""),
    status: row.status as PartnerHomestayApplication["status"],
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

async function notifyAdmins(applicationId: string, title: string, fullName: string) {
  const supabase = getSupabaseAdmin();
  const { data: admins, error } = await supabase.from("profiles").select("id").eq("role", "admin");
  if (error) throw new Error(error.message);

  const rows = (admins ?? []).map((admin) => ({
    user_id: admin.id,
    type: "partner_homestay_application",
    title: "New partner homestay application",
    body: `${fullName} submitted "${title}" for review.`,
    metadata: {
      applicationId,
      href: "/admin/homestay/requests",
    },
  }));

  if (rows.length === 0) return;
  const { error: insertError } = await supabase.from("notifications").insert(rows);
  if (insertError) throw new Error(insertError.message);
}

export const submitPartnerHomestayApplication = createServerFn({ method: "POST" })
  .inputValidator(submitSchema)
  .handler(async ({ data }) => {
    const galleryUrls = data.galleryUrls.map((url) => url.trim()).filter(Boolean);
    const heroImageUrl = data.heroImageUrl?.trim() || galleryUrls[0] || null;
    const mapLink = data.mapLink?.trim() || null;

    const supabase = getSupabaseAdmin();
    const { data: row, error } = await supabase
      .from("partner_homestay_applications")
      .insert({
        full_name: data.fullName,
        email: data.email.toLowerCase(),
        phone: data.phone,
        bio: data.bio?.trim() || null,
        city: data.city,
        fssai_id: data.fssaiId.trim(),
        pan_number: data.panNumber.trim().toUpperCase(),
        passport_photo_url: data.passportPhotoUrl,
        gst_number: data.gstNumber?.trim().toUpperCase() || null,
        title: data.title,
        tagline: data.tagline?.trim() || null,
        description: data.description,
        property_type: data.propertyType,
        region: data.region?.trim() || null,
        address: data.address,
        map_link: mapLink,
        price_per_night_minor: data.pricePerNightMinor,
        weekend_price_per_night_minor:
          data.weekendPricePerNightMinor ?? data.pricePerNightMinor,
        hero_image_url: heroImageUrl,
        gallery_urls: galleryUrls,
        amenities: data.amenities,
        house_rules: data.houseRules,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        max_guests: data.maxGuests,
        check_in_time: data.checkInTime,
        check_out_time: data.checkOutTime,
        extra_bed_available: data.extraBedAvailable,
        extra_bed_price_per_night_minor: data.extraBedAvailable
          ? data.extraBedPricePerNightMinor
          : 0,
        weekend_extra_bed_price_per_night_minor: data.extraBedAvailable
          ? data.weekendExtraBedPricePerNightMinor
          : 0,
        extra_beds_per_room: data.extraBedAvailable ? data.extraBedsPerRoom : 1,
        license_certificate_url: data.licenseCertificateUrl,
        status: "pending",
      })
      .select("id, title, full_name")
      .single();

    if (error || !row) {
      throw new Error(error?.message ?? "Failed to submit application.");
    }

    await notifyAdmins(String(row.id), String(row.title), String(row.full_name));
    return { id: String(row.id) };
  });

export const listPartnerHomestayApplications = createServerFn({ method: "POST" })
  .inputValidator(
    adminTokenSchema.extend({
      status: z.enum(["pending", "approved", "rejected", "all"]).default("pending"),
    }),
  )
  .handler(async ({ data }): Promise<PartnerHomestayApplication[]> => {
    await requireAdmin(data.accessToken);
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from("partner_homestay_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (data.status !== "all") {
      query = query.eq("status", data.status);
    }

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return (rows ?? []).map((row) => mapRow(row as Record<string, unknown>));
  });

export const countPendingPartnerHomestayApplications = createServerFn({ method: "POST" })
  .inputValidator(adminTokenSchema)
  .handler(async ({ data }): Promise<number> => {
    await requireAdmin(data.accessToken);
    const supabase = getSupabaseAdmin();
    const { count, error } = await supabase
      .from("partner_homestay_applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");

    if (error) throw new Error(error.message);
    return count ?? 0;
  });

export const reviewPartnerHomestayApplication = createServerFn({ method: "POST" })
  .inputValidator(reviewSchema)
  .handler(async ({ data }) => {
    const admin = await requireAdmin(data.accessToken);
    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();

    const { data: application, error: loadError } = await supabase
      .from("partner_homestay_applications")
      .select("*")
      .eq("id", data.applicationId)
      .eq("status", "pending")
      .maybeSingle();

    if (loadError) throw new Error(loadError.message);
    if (!application) throw new Error("Application not found or already reviewed.");

    if (data.action === "reject") {
      const { data: row, error } = await supabase
        .from("partner_homestay_applications")
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
      return {
        id: String(row.id),
        status: "rejected" as const,
        passwordEmailWarning: null as string | null,
      };
    }

    const rooms = data.rooms ?? [];
    if (rooms.length < 1) {
      throw new Error("Add at least one room before approving.");
    }

    const licenseUrl = String(application.license_certificate_url ?? "").trim();
    if (!licenseUrl) {
      throw new Error("Application is missing a property license certificate.");
    }

    const login = await createProviderLogin({
      email: String(application.email),
      fullName: String(application.full_name),
      phone: application.phone == null ? null : String(application.phone),
      bio: application.bio == null ? null : String(application.bio),
      role: "homestay_owner",
      address: String(application.address),
    });

    if (!login.homestayOwnerId) {
      throw new Error("Homestay owner profile was not created for this applicant.");
    }

    const slug = await ensureUniqueSlug(
      "homestays",
      slugifyTitle(String(application.title), "homestay"),
    );
    const galleryUrls = Array.isArray(application.gallery_urls)
      ? application.gallery_urls.map(String)
      : [];
    const heroImageUrl =
      (application.hero_image_url == null ? null : String(application.hero_image_url)) ||
      galleryUrls[0] ||
      null;
    const weekdayPrice = Number(application.price_per_night_minor);
    const weekendPrice =
      application.weekend_price_per_night_minor == null
        ? weekdayPrice
        : Number(application.weekend_price_per_night_minor);

    const insertRow: Record<string, unknown> = {
      owner_id: login.homestayOwnerId,
      slug,
      title: String(application.title).trim(),
      tagline: application.tagline == null ? null : String(application.tagline),
      description: String(application.description).trim(),
      property_type: String(application.property_type),
      city_slug: "mysuru",
      city: "Mysuru",
      region: application.region == null ? null : String(application.region),
      address: String(application.address),
      price_per_night_minor: weekdayPrice,
      weekend_price_per_night_minor: weekendPrice,
      hero_image_url: heroImageUrl,
      gallery_urls: galleryUrls,
      amenities: Array.isArray(application.amenities) ? application.amenities : [],
      house_rules: Array.isArray(application.house_rules) ? application.house_rules : [],
      bedrooms: Number(application.bedrooms ?? 1),
      bathrooms: Number(application.bathrooms ?? 1),
      max_guests: Number(application.max_guests ?? 2),
      check_in_time: String(application.check_in_time ?? "14:00"),
      check_out_time: String(application.check_out_time ?? "11:00"),
      status: "published",
      currency_code: "INR",
      extra_bed_available: Boolean(application.extra_bed_available),
      extra_bed_price_per_night_minor: Number(application.extra_bed_price_per_night_minor ?? 0),
      weekend_extra_bed_price_per_night_minor: Number(
        application.weekend_extra_bed_price_per_night_minor ?? 0,
      ),
      extra_beds_per_room: Number(application.extra_beds_per_room ?? 1),
      license_certificate_url: licenseUrl,
    };
    if (application.map_link) {
      insertRow.map_link = String(application.map_link);
    }

    const { data: homestayRow, error: homestayError } = await supabase
      .from("homestays")
      .insert(insertRow)
      .select("id")
      .single();

    if (homestayError || !homestayRow) {
      throw new Error(homestayError?.message ?? "Failed to create homestay listing.");
    }

    const homestayId = String(homestayRow.id);
    const { error: roomsError } = await supabase.from("homestay_rooms").insert(
      rooms.map((room, index) => ({
        homestay_id: homestayId,
        name: room.name.trim(),
        category: room.category?.trim() || null,
        capacity: room.capacity,
        price_per_night_minor: room.pricePerNightMinor,
        weekend_price_per_night_minor:
          room.weekendPricePerNightMinor ?? room.pricePerNightMinor,
        total_units: room.totalUnits ?? 1,
        amenities: [],
        sort_order: index,
        is_active: true,
        extra_bed_available: false,
        extra_bed_price_per_night_minor: 0,
        weekend_extra_bed_price_per_night_minor: 0,
        extra_beds_per_room: 1,
      })),
    );

    if (roomsError) {
      await supabase.from("homestays").delete().eq("id", homestayId);
      throw new Error(roomsError.message);
    }

    const { data: row, error } = await supabase
      .from("partner_homestay_applications")
      .update({
        status: "approved",
        reviewed_by: admin.id,
        reviewed_at: now,
        admin_notes: data.adminNotes?.trim() || null,
        updated_at: now,
        created_user_id: login.userId,
        created_homestay_id: homestayId,
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
      homestayId,
      userId: login.userId,
      passwordEmailWarning: login.passwordEmailWarning,
    };
  });
