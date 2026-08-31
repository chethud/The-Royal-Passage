import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createProviderLogin } from "@/lib/provider-invite.server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

const submitSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(7).max(40),
  bio: z.string().trim().max(2000).optional(),
  city: z.string().trim().min(2).max(120),
  companyName: z.string().trim().min(2).max(200),
  companyAddress: z.string().trim().min(5).max(500),
  gstNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(GSTIN_REGEX, "Enter a valid GSTIN."),
  panNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Enter a valid PAN (e.g. ABCDE1234F)."),
  gstCertificateUrl: z.string().url().max(2000).optional(),
  companyRegistrationUrl: z.string().url().max(2000).optional(),
  passportPhotoUrl: z.string().url().max(2000),
});

const adminTokenSchema = z.object({
  accessToken: z.string().min(1),
});

const reviewSchema = z.object({
  accessToken: z.string().min(1),
  applicationId: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
  adminNotes: z.string().trim().max(2000).optional(),
  discountPercent: z.number().min(0).max(100).optional(),
});

export type PartnerTravelAgentApplication = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  bio: string | null;
  city: string;
  companyName: string;
  companyAddress: string;
  gstNumber: string;
  panNumber: string;
  gstCertificateUrl: string | null;
  companyRegistrationUrl: string | null;
  passportPhotoUrl: string;
  status: "pending" | "approved" | "rejected";
  adminDiscountPercent: number | null;
  adminNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function mapRow(row: Record<string, unknown>): PartnerTravelAgentApplication {
  return {
    id: String(row.id),
    fullName: String(row.full_name ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    bio: row.bio == null ? null : String(row.bio),
    city: String(row.city ?? ""),
    companyName: String(row.company_name ?? ""),
    companyAddress: String(row.company_address ?? ""),
    gstNumber: String(row.gst_number ?? ""),
    panNumber: String(row.pan_number ?? ""),
    gstCertificateUrl: row.gst_certificate_url == null ? null : String(row.gst_certificate_url),
    companyRegistrationUrl:
      row.company_registration_url == null ? null : String(row.company_registration_url),
    passportPhotoUrl: String(row.passport_photo_url ?? ""),
    status: String(row.status ?? "pending") as PartnerTravelAgentApplication["status"],
    adminDiscountPercent:
      row.admin_discount_percent == null ? null : Number(row.admin_discount_percent),
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

async function notifyAdmins(applicationId: string, companyName: string, fullName: string) {
  const supabase = getSupabaseAdmin();
  const { data: admins, error } = await supabase.from("profiles").select("id").eq("role", "admin");
  if (error) throw new Error(error.message);

  const rows = (admins ?? []).map((admin) => ({
    user_id: admin.id,
    type: "partner_travel_agent_application",
    title: "New travel agent application",
    body: `${fullName} from ${companyName} applied to join as a travel agent.`,
    metadata: {
      applicationId,
      href: "/admin/travel-agent/requests",
    },
  }));

  if (rows.length === 0) return;
  const { error: insertError } = await supabase.from("notifications").insert(rows);
  if (insertError) throw new Error(insertError.message);
}

export const submitPartnerTravelAgentApplication = createServerFn({ method: "POST" })
  .inputValidator(submitSchema)
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    const { data: row, error } = await supabase
      .from("partner_travel_agent_applications")
      .insert({
        full_name: data.fullName,
        email: data.email.toLowerCase(),
        phone: data.phone,
        bio: data.bio?.trim() || null,
        city: data.city,
        company_name: data.companyName,
        company_address: data.companyAddress,
        gst_number: data.gstNumber.trim().toUpperCase(),
        pan_number: data.panNumber.trim().toUpperCase(),
        gst_certificate_url: data.gstCertificateUrl?.trim() || null,
        company_registration_url: data.companyRegistrationUrl?.trim() || null,
        passport_photo_url: data.passportPhotoUrl,
        status: "pending",
      })
      .select("id, company_name, full_name")
      .single();

    if (error || !row) {
      throw new Error(error?.message ?? "Failed to submit application.");
    }

    await notifyAdmins(String(row.id), String(row.company_name), String(row.full_name));
    return { id: String(row.id) };
  });

export const listPartnerTravelAgentApplications = createServerFn({ method: "POST" })
  .inputValidator(
    adminTokenSchema.extend({
      status: z.enum(["pending", "approved", "rejected", "all"]).default("pending"),
    }),
  )
  .handler(async ({ data }): Promise<PartnerTravelAgentApplication[]> => {
    await requireAdmin(data.accessToken);
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from("partner_travel_agent_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (data.status !== "all") {
      query = query.eq("status", data.status);
    }

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return (rows ?? []).map((row) => mapRow(row as Record<string, unknown>));
  });

export const countPendingPartnerTravelAgentApplications = createServerFn({ method: "POST" })
  .inputValidator(adminTokenSchema)
  .handler(async ({ data }): Promise<number> => {
    await requireAdmin(data.accessToken);
    const supabase = getSupabaseAdmin();
    const { count, error } = await supabase
      .from("partner_travel_agent_applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");

    if (error) throw new Error(error.message);
    return count ?? 0;
  });

export const reviewPartnerTravelAgentApplication = createServerFn({ method: "POST" })
  .inputValidator(reviewSchema)
  .handler(async ({ data }) => {
    const admin = await requireAdmin(data.accessToken);
    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();

    const { data: application, error: loadError } = await supabase
      .from("partner_travel_agent_applications")
      .select("*")
      .eq("id", data.applicationId)
      .eq("status", "pending")
      .maybeSingle();

    if (loadError) throw new Error(loadError.message);
    if (!application) throw new Error("Application not found or already reviewed.");

    if (data.action === "reject") {
      const { data: row, error } = await supabase
        .from("partner_travel_agent_applications")
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

    const discountPercent = data.discountPercent;
    if (discountPercent == null || Number.isNaN(discountPercent)) {
      throw new Error("Enter the discount percentage before approving.");
    }

    const login = await createProviderLogin({
      email: String(application.email),
      fullName: String(application.full_name),
      phone: application.phone == null ? null : String(application.phone),
      bio: application.bio == null ? null : String(application.bio),
      role: "travel_agent",
      address: String(application.company_address),
      companyName: String(application.company_name),
      city: String(application.city),
      gstNumber: String(application.gst_number),
      panNumber: String(application.pan_number),
      gstCertificateUrl:
        application.gst_certificate_url == null ? null : String(application.gst_certificate_url),
      companyRegistrationUrl:
        application.company_registration_url == null
          ? null
          : String(application.company_registration_url),
      passportPhotoUrl: String(application.passport_photo_url),
      discountPercent,
    });

    if (!login.travelAgentId) {
      throw new Error("Travel agent profile was not created for this applicant.");
    }

    const { data: row, error } = await supabase
      .from("partner_travel_agent_applications")
      .update({
        status: "approved",
        reviewed_by: admin.id,
        reviewed_at: now,
        admin_notes: data.adminNotes?.trim() || null,
        admin_discount_percent: discountPercent,
        created_user_id: login.userId,
        created_travel_agent_id: login.travelAgentId,
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
      status: "approved" as const,
      passwordEmailWarning: login.passwordEmailWarning,
    };
  });

export const fetchTravelAgentProfile = createServerFn({ method: "POST" })
  .inputValidator(z.object({ accessToken: z.string().min(1) }))
  .handler(async ({ data }) => {
    const supabase = getSupabaseAdmin();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(data.accessToken);
    if (error || !user) throw new Error("You must be signed in.");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("travel_agent_id")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) throw new Error(profileError.message);
    if (!profile?.travel_agent_id) throw new Error("Travel agent profile not found.");

    const { data: agent, error: agentError } = await supabase
      .from("travel_agents")
      .select("*")
      .eq("id", profile.travel_agent_id)
      .maybeSingle();
    if (agentError) throw new Error(agentError.message);
    if (!agent) throw new Error("Travel agent profile not found.");

    return {
      id: String(agent.id),
      companyName: String(agent.company_name),
      contactName: String(agent.contact_name),
      email: String(agent.email),
      discountPercent: Number(agent.discount_percent ?? 0),
    };
  });
