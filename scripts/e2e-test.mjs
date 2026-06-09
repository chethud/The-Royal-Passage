/**
 * End-to-end workflow test for Royal Passage (Connect RPC + Supabase Auth).
 *
 * Usage:
 *   node --env-file=backend/.env scripts/e2e-test.mjs
 *   API_BASE_URL=http://127.0.0.1:8000 node --env-file=backend/.env scripts/e2e-test.mjs
 */

import { createClient } from "@supabase/supabase-js";

const API_BASE =
  (process.env.API_BASE_URL ?? "https://the-royal-passage.onrender.com").replace(/\/$/, "");
const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ADMIN_EMAIL = "Admin@gmail.com";
const ADMIN_PASSWORD = "Admin@123";

const results = [];

function pass(name, detail = "") {
  results.push({ name, ok: true, detail });
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, error) {
  const detail = error instanceof Error ? error.message : String(error);
  results.push({ name, ok: false, detail });
  console.error(`✗ ${name} — ${detail}`);
}

async function rpc(method, body = {}, token = null) {
  const headers = { "Content-Type": "application/json", Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/royalpassage.v1.RoyalPassageService/${method}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    const msg = json.message ?? json.raw ?? text ?? res.statusText;
    throw new Error(`${res.status} ${msg}`);
  }
  return json;
}

async function signIn(email, password) {
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!anonKey) {
    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await admin.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.session?.access_token ?? null;
  }

  const client = createClient(SUPABASE_URL, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session?.access_token ?? null;
}

async function createGuestUser() {
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const email = `e2e.guest.${Date.now()}@gmail.com`;
  const password = "E2eGuestTest123!";

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "E2E Guest" },
  });
  if (error) throw error;

  const { data: sessionData, error: signInError } = await admin.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) throw signInError;

  return {
    email,
    userId: data.user.id,
    token: sessionData.session?.access_token,
  };
}

async function cleanupGuest(admin, userId) {
  try {
    await admin.auth.admin.deleteUser(userId);
  } catch {
    // best effort
  }
}

async function main() {
  console.log(`\nRoyal Passage E2E — API: ${API_BASE}\n`);

  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (use --env-file=backend/.env)");
    process.exit(1);
  }

  const adminClient = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let guestUserId = null;
  let bookingId = null;
  let hostToken = null;
  let testHostEmail = null;

  // --- Public marketplace ---
  try {
    const health = await rpc("HealthCheck", {});
    if (health.status === "ok") pass("HealthCheck");
    else fail("HealthCheck", `unexpected: ${JSON.stringify(health)}`);
  } catch (e) {
    fail("HealthCheck", e);
  }

  try {
    const cities = await rpc("ListCities", {});
    pass("ListCities", `${cities.cities?.length ?? 0} cities`);
  } catch (e) {
    fail("ListCities", e);
  }

  let catalog;
  try {
    catalog = await rpc("GetCatalog", {});
    const count = catalog.experiences?.length ?? 0;
    if (count > 0) pass("GetCatalog", `${count} experiences (${catalog.mode})`);
    else fail("GetCatalog", "no experiences returned");
  } catch (e) {
    fail("GetCatalog", e);
  }

  let slotId = null;
  try {
    const slug = catalog?.experiences?.[0]?.slug ?? "mysuru-wheel-and-clay";
    const detail = await rpc("GetExperienceBySlug", { slug });
    slotId = detail.exp?.slots?.[0]?.id ?? null;
    pass("GetExperienceBySlug", `${detail.exp?.title ?? slug}`);
  } catch (e) {
    fail("GetExperienceBySlug", e);
  }

  try {
    const slug = catalog?.experiences?.[0]?.slug ?? "mysuru-wheel-and-clay";
    const reviews = await rpc("ListExperienceReviews", { slug });
    pass("ListExperienceReviews", `${reviews.reviews?.length ?? 0} reviews`);
  } catch (e) {
    fail("ListExperienceReviews", e);
  }

  // --- Guest booking flow ---
  let guestToken = null;
  try {
    const guest = await createGuestUser();
    guestToken = guest.token;
    guestUserId = guest.userId;
    if (!guestToken) throw new Error("no access token");
    pass("Guest auth", guest.email);
  } catch (e) {
    fail("Guest auth", e);
  }

  if (guestToken && slotId) {
    try {
      const booking = await rpc(
        "CreateBooking",
        { slotId, guestCount: 2, notes: "E2E test booking" },
        guestToken,
      );
      bookingId = booking.bookingId;
      pass("CreateBooking", `id=${bookingId}, total=${booking.totalAmount}`);
    } catch (e) {
      fail("CreateBooking", e);
    }

    try {
      const list = await rpc("ListMyBookings", {}, guestToken);
      pass("ListMyBookings", `${list.bookings?.length ?? 0} booking(s)`);
    } catch (e) {
      fail("ListMyBookings", e);
    }

    try {
      await rpc("AddToWishlist", { experienceId: catalog.experiences[0].id }, guestToken);
      pass("AddToWishlist");
    } catch (e) {
      fail("AddToWishlist", e);
    }

    try {
      const wishlist = await rpc("ListWishlist", {}, guestToken);
      pass("ListWishlist", `${wishlist.items?.length ?? 0} item(s)`);
    } catch (e) {
      fail("ListWishlist", e);
    }
  }

  // --- Admin flow ---
  let adminToken = null;
  try {
    adminToken = await signIn(ADMIN_EMAIL, ADMIN_PASSWORD);
    if (!adminToken) throw new Error("no admin token — run npm run setup:admin");
    pass("Admin auth", ADMIN_EMAIL);
  } catch (e) {
    fail("Admin auth", e);
  }

  if (adminToken) {
    try {
      const stats = await rpc("GetAdminStats", {}, adminToken);
      pass("GetAdminStats", `${stats.publishedExperiences} published experiences`);
    } catch (e) {
      fail("GetAdminStats", e);
    }

    try {
      const users = await rpc("ListAdminUsers", {}, adminToken);
      pass("ListAdminUsers", `${users.users?.length ?? 0} users`);
    } catch (e) {
      fail("ListAdminUsers", e);
    }

    try {
      testHostEmail = `e2e.host.${Date.now()}@gmail.com`;
      const host = await rpc(
        "CreateHost",
        {
          displayName: "E2E Test Host",
          email: testHostEmail,
          password: "E2eHostTest123!",
          phone: "+919999999999",
        },
        adminToken,
      );
      pass("CreateHost", host.email ?? testHostEmail);
    } catch (e) {
      fail("CreateHost", e);
    }
  }

  if (testHostEmail) {
    try {
      hostToken = await signIn(testHostEmail, "E2eHostTest123!");
      if (!hostToken) throw new Error("no host token");
      pass("Host auth", testHostEmail);
    } catch (e) {
      fail("Host auth", e);
    }
  }

  if (hostToken) {
    try {
      const dash = await rpc("GetHostDashboard", {}, hostToken);
      pass("GetHostDashboard", `${dash.publishedExperiences ?? 0} published`);
    } catch (e) {
      fail("GetHostDashboard", e);
    }

    try {
      const exps = await rpc("ListHostExperiences", {}, hostToken);
      pass("ListHostExperiences", `${exps.experiences?.length ?? 0} experiences`);
    } catch (e) {
      fail("ListHostExperiences", e);
    }

    if (hostToken && adminToken) {
      try {
        const created = await rpc(
          "CreateHostExperience",
          {
            title: "E2E Host Heritage Walk",
            description:
              "Automated end-to-end test experience with enough detail for validation and admin review.",
            categorySlug: "cultural_heritage",
            citySlug: "mysuru",
            durationMinutes: 90,
            pricePerPersonMinor: 95000,
            submitForReview: true,
          },
          hostToken,
        );
        const published = await rpc(
          "PublishExperience",
          { experienceId: created.id },
          adminToken,
        );
        const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
        const withSlot = await rpc(
          "CreateHostSlot",
          {
            experienceId: published.id,
            slot: {
              slotDate: tomorrow,
              startTime: "10:00",
              endTime: "12:00",
              capacity: 8,
            },
          },
          hostToken,
        );
        const hostSlotId = withSlot.slots?.[withSlot.slots.length - 1]?.id;
        if (!hostSlotId || !guestToken) throw new Error("missing slot or guest token");

        const hostBooking = await rpc(
          "CreateBooking",
          { slotId: hostSlotId, guestCount: 1 },
          guestToken,
        );
        await rpc("ConfirmHostBooking", { bookingId: hostBooking.bookingId }, hostToken);
        pass("Host booking lifecycle", `confirmed ${hostBooking.bookingId}`);
      } catch (e) {
        fail("Host booking lifecycle", e);
      }
    }
  }

  // --- Guest cancel (cleanup) ---
  if (guestToken && bookingId) {
    try {
      await rpc("CancelBooking", { bookingId }, guestToken);
      pass("CancelBooking", bookingId);
    } catch (e) {
      fail("CancelBooking", e);
    }
  }

  if (guestUserId) {
    await cleanupGuest(adminClient, guestUserId);
  }

  // --- Frontend reachability ---
  try {
    const res = await fetch("https://the-royal-passage.vercel.app/", { method: "HEAD" });
    if (res.ok) pass("Vercel frontend", res.status);
    else fail("Vercel frontend", `HTTP ${res.status}`);
  } catch (e) {
    fail("Vercel frontend", e);
  }

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;

  console.log(`\n--- Summary: ${passed} passed, ${failed} failed ---\n`);
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
