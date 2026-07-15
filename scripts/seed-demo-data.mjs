/**
 * Seed comprehensive demo data into Supabase for live admin + guest testing.
 *
 * Covers: published catalogs, pending approvals, bookings, reviews, banners,
 * demo auth logins (guest / host / homestay owner / vip owner).
 *
 * Usage:
 *   npm run seed:demo
 *
 * Requires VITE_SUPABASE_URL (or SUPABASE_URL) + SUPABASE_SERVICE_ROLE_KEY.
 *
 * Demo logins (password Demo@12345 for all, unless noted):
 *   guest@royalpassage.demo
 *   host@royalpassage.demo
 *   homestay@royalpassage.demo
 *   vip@royalpassage.demo
 *   Admin@gmail.com / Admin@123  (create via npm run setup:admin)
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing VITE_SUPABASE_URL (or SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const DEMO_PASSWORD = "Demo@12345";

const IDS = {
  host1: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  host2: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  host3: "cccccccc-cccc-cccc-cccc-cccccccccccc",
  hostPending: "dddddddd-dddd-dddd-dddd-dddddddddddd",
  exp1: "e0000001-0000-0000-0000-000000000001",
  exp2: "e0000002-0000-0000-0000-000000000002",
  exp3: "e0000003-0000-0000-0000-000000000003",
  exp4: "e0000004-0000-0000-0000-000000000004",
  exp5: "e0000005-0000-0000-0000-000000000005",
  expPending1: "e0000006-0000-0000-0000-000000000006",
  expPending2: "e0000007-0000-0000-0000-000000000007",
  slot1: "50000001-0000-4000-8000-000000000001",
  slot2: "50000002-0000-4000-8000-000000000002",
  slot3: "50000003-0000-4000-8000-000000000003",
  slot4: "50000004-0000-4000-8000-000000000004",
  slot5: "50000005-0000-4000-8000-000000000005",
  slot6: "50000006-0000-4000-8000-000000000006",
  slot7: "50000007-0000-4000-8000-000000000007",
  slot8: "50000008-0000-4000-8000-000000000008",
  review1: "60000001-0000-4000-8000-000000000001",
  review2: "60000002-0000-4000-8000-000000000002",
  review3: "60000003-0000-4000-8000-000000000003",
  booking1: "70000001-0000-4000-8000-000000000001",
  booking2: "70000002-0000-4000-8000-000000000002",
  booking3: "70000003-0000-4000-8000-000000000003",
  hsOwner1: "a0000001-0000-4000-8000-000000000001",
  hsOwner2: "a0000002-0000-4000-8000-000000000002",
  hs1: "b0000001-0000-4000-8000-000000000001",
  hs2: "b0000002-0000-4000-8000-000000000002",
  hs3: "b0000003-0000-4000-8000-000000000003",
  hsPending: "b0000004-0000-4000-8000-000000000004",
  room1: "c0000001-0000-4000-8000-000000000001",
  room2: "c0000002-0000-4000-8000-000000000002",
  room3: "c0000003-0000-4000-8000-000000000003",
  roomPending: "c0000004-0000-4000-8000-000000000004",
  hsBooking1: "d0000001-0000-4000-8000-000000000001",
  hsBooking2: "d0000002-0000-4000-8000-000000000002",
  vipOwner: "f0000001-0000-4000-8000-000000000001",
  vip1: "f1000001-0000-4000-8000-000000000001",
  vip2: "f1000002-0000-4000-8000-000000000002",
  vipPending: "f1000003-0000-4000-8000-000000000003",
};

const IMG = {
  pottery: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&q=80",
  farm: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80",
  wellness: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&q=80",
  coffee: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80",
  palace: "https://images.unsplash.com/photo-1524492412937-b280c272500d?w=1200&q=80",
  nature: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80",
  cooking: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=80",
  stay1: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
  stay2: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
  stay3: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80",
  stay4: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80",
  vip1: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
  vip2: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&q=80",
  banner: "https://images.unsplash.com/photo-1524492412937-b280c272500d?w=1600&q=80",
};

function isoDate(daysFromToday) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
}

function isoDateTime(daysFromToday) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysFromToday);
  return d.toISOString();
}

async function findUserByEmail(email) {
  const target = email.toLowerCase();
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const match = data.users.find((user) => user.email?.toLowerCase() === target);
    if (match) return match;
    if (data.users.length < 200) break;
  }
  return null;
}

async function ensureAuthUser({ email, password, fullName, role, meta = {} }) {
  const existing = await findUserByEmail(email);
  let userId;
  if (existing) {
    userId = existing.id;
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role, ...meta },
    });
    if (error) throw error;
    console.log(`  auth ok (existing): ${email}`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role, ...meta },
    });
    if (error) throw error;
    userId = data.user.id;
    console.log(`  auth created: ${email}`);
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    full_name: fullName,
    role,
    ...meta,
  });
  if (profileError) throw profileError;
  return userId;
}

async function upsert(table, rows, onConflict = "id") {
  const { error } = await supabase.from(table).upsert(rows, { onConflict });
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`  ${table}: ${rows.length} row(s)`);
}

async function seedCatalogBasics() {
  console.log("Seeding cities, categories, hosts…");
  await upsert(
    "cities",
    [
      {
        slug: "mysuru",
        name: "Mysuru",
        region: "Southern Karnataka",
        state: "Karnataka",
        tagline: "Palaces, pottery, and slow living",
        description: "Heritage walks, artisan studios, farm mornings, and culinary immersions.",
        sort_order: 10,
      },
      {
        slug: "bengaluru",
        name: "Bengaluru",
        region: "Urban Karnataka",
        state: "Karnataka",
        tagline: "Creative city escapes",
        description: "Weekend workshops and curated urban experiences.",
        sort_order: 20,
      },
      {
        slug: "coorg",
        name: "Coorg",
        region: "Western Ghats",
        state: "Karnataka",
        tagline: "Coffee country rituals",
        description: "Plantation walks and Kodava cuisine.",
        sort_order: 30,
      },
    ],
    "slug",
  );

  await upsert(
    "experience_categories",
    [
      { slug: "art_craft", label: "Art & Craft", sort_order: 10 },
      { slug: "outdoor_nature", label: "Outdoor & Nature", sort_order: 20 },
      { slug: "culinary", label: "Culinary & Food", sort_order: 30 },
      { slug: "wellness", label: "Wellness & Healing", sort_order: 40 },
      { slug: "rural_farm", label: "Rural & Farm", sort_order: 60 },
      { slug: "cultural_heritage", label: "Cultural & Heritage", sort_order: 70 },
    ],
    "slug",
  );

  await upsert("hosts", [
    {
      id: IDS.host1,
      display_name: "Heritage Clay Studio — Mysuru",
      email: "studio@example.com",
      bio: "Third-generation potters hosting intimate wheel sessions.",
      verified: true,
      approval_status: "approved",
    },
    {
      id: IDS.host2,
      display_name: "Devaraja Organic Farm",
      email: "farm@example.com",
      bio: "Family-run farm experiences minutes from the city.",
      verified: true,
      approval_status: "approved",
    },
    {
      id: IDS.host3,
      display_name: "Silver Oak Sound Sanctuary",
      email: "sound@example.com",
      bio: "Sound therapy and restorative sessions.",
      verified: true,
      approval_status: "approved",
    },
    {
      id: IDS.hostPending,
      display_name: "Chamundi Culinary Collective",
      email: "host@royalpassage.demo",
      bio: "Demo host awaiting listing approval.",
      verified: false,
      approval_status: "approved",
    },
  ]);
}

async function seedExperiences() {
  console.log("Seeding experiences (published + pending)…");
  await upsert("experiences", [
    {
      id: IDS.exp1,
      host_id: IDS.host1,
      slug: "mysuru-wheel-and-clay",
      title: "Wheel & Clay at Heritage Studio",
      tagline: "A morning at the wheel with master potters",
      description:
        "Learn throwing and hand-building in a sunlit studio. Take home two pieces, fired and glazed by the studio.",
      category_slug: "art_craft",
      city_slug: "mysuru",
      city: "Mysuru",
      region: "Karnataka",
      address: "Gokulam, Mysuru",
      duration_minutes: 180,
      experience_format: "slot_based",
      pricing_model: "per_person",
      price_per_person_minor: 240000,
      status: "published",
      hero_image_url: IMG.pottery,
      inclusions: ["Materials", "Two finished pieces", "Refreshments"],
      exclusions: ["Transport"],
      cancellation_policy: "Full refund if cancelled more than 24 hours before the slot.",
      average_rating: 4.95,
      review_count: 48,
      currency_code: "INR",
    },
    {
      id: IDS.exp2,
      host_id: IDS.host2,
      slug: "farm-walk-and-breakfast",
      title: "Sunrise Farm Walk & Breakfast",
      tagline: "Fields, filter coffee, and a slow Karnataka breakfast",
      description: "Walk the rows before heat sets in, then share breakfast under a neem tree.",
      category_slug: "rural_farm",
      city_slug: "mysuru",
      city: "Mysuru",
      region: "Karnataka",
      address: "Hunsur Road outskirts",
      duration_minutes: 150,
      experience_format: "slot_based",
      pricing_model: "per_person",
      price_per_person_minor: 185000,
      status: "published",
      hero_image_url: IMG.farm,
      inclusions: ["Guided walk", "Breakfast", "Farm tour"],
      exclusions: [],
      cancellation_policy: "Full refund up to 24 hours before.",
      average_rating: 4.88,
      review_count: 112,
      currency_code: "INR",
    },
    {
      id: IDS.exp3,
      host_id: IDS.host3,
      slug: "sound-bowl-evening",
      title: "Sound Bowl Evening Reset",
      tagline: "Ninety minutes of resonance and stillness",
      description: "Group sound journey with Himalayan bowls, followed by herbal tea.",
      category_slug: "wellness",
      city_slug: "mysuru",
      city: "Mysuru",
      region: "Karnataka",
      address: "Chamundi Hill foothills",
      duration_minutes: 90,
      experience_format: "slot_based",
      pricing_model: "per_person",
      price_per_person_minor: 165000,
      status: "published",
      hero_image_url: IMG.wellness,
      inclusions: ["Mats", "Blankets", "Tea"],
      exclusions: ["Private transport"],
      cancellation_policy: "Full refund up to 24 hours before.",
      average_rating: 4.91,
      review_count: 64,
      currency_code: "INR",
    },
    {
      id: IDS.exp4,
      host_id: IDS.host2,
      slug: "estate-coffee-cupping",
      title: "Estate-Style Coffee Cupping",
      tagline: "From cherry to cup — a sensory workshop",
      description: "Roast sample beans, learn grind theory, and cup three estate lots.",
      category_slug: "culinary",
      city_slug: "mysuru",
      city: "Nanjangud",
      region: "Karnataka",
      address: "Coffee Collective Nanjangud",
      duration_minutes: 120,
      experience_format: "slot_based",
      pricing_model: "per_person",
      price_per_person_minor: 145000,
      status: "published",
      hero_image_url: IMG.coffee,
      inclusions: ["Cupping sets", "Take-home sample bag"],
      exclusions: [],
      cancellation_policy: "Full refund up to 24 hours before.",
      average_rating: 4.82,
      review_count: 37,
      currency_code: "INR",
    },
    {
      id: IDS.exp5,
      host_id: IDS.host1,
      slug: "palace-stories-walk",
      title: "Palace Stories Walk",
      tagline: "Heritage narrative walk — small groups only",
      description: "Story-led paths with archival imagery and live narration.",
      category_slug: "cultural_heritage",
      city_slug: "mysuru",
      city: "Mysuru",
      region: "Karnataka",
      address: "Old city core",
      duration_minutes: 105,
      experience_format: "slot_based",
      pricing_model: "per_person",
      price_per_person_minor: 95000,
      status: "published",
      hero_image_url: IMG.palace,
      inclusions: ["Guided walk", "Printed route map"],
      exclusions: ["Monument entry tickets"],
      cancellation_policy: "Full refund up to 24 hours before.",
      average_rating: 4.79,
      review_count: 201,
      currency_code: "INR",
    },
    {
      id: IDS.expPending1,
      host_id: IDS.hostPending,
      slug: "demo-forest-forage-pending",
      title: "Forest Forage Morning (Pending Approval)",
      tagline: "Demo listing waiting for admin review",
      description:
        "A curated forage walk on the Chamundi foothills. This listing is intentionally pending so admins can test approve/reject.",
      category_slug: "outdoor_nature",
      city_slug: "mysuru",
      city: "Mysuru",
      region: "Karnataka",
      address: "Chamundi foothills",
      duration_minutes: 150,
      experience_format: "slot_based",
      pricing_model: "per_person",
      price_per_person_minor: 175000,
      status: "pending_review",
      hero_image_url: IMG.nature,
      inclusions: ["Guide", "Refreshments"],
      exclusions: ["Transport"],
      cancellation_policy: "Full refund up to 24 hours before.",
      average_rating: 0,
      review_count: 0,
      currency_code: "INR",
    },
    {
      id: IDS.expPending2,
      host_id: IDS.hostPending,
      slug: "demo-outdoor-kitchen-pending",
      title: "Outdoor Kitchen Feast (Pending Approval)",
      tagline: "Second demo approval queue item",
      description: "Open-fire cooking demo listing for the admin experiences queue.",
      category_slug: "culinary",
      city_slug: "mysuru",
      city: "Mysuru",
      region: "Karnataka",
      address: "Saraswathipuram demo kitchen",
      duration_minutes: 180,
      experience_format: "slot_based",
      pricing_model: "per_person",
      price_per_person_minor: 220000,
      status: "pending_review",
      hero_image_url: IMG.cooking,
      inclusions: ["Ingredients", "Apron"],
      exclusions: [],
      cancellation_policy: "Full refund up to 24 hours before.",
      average_rating: 0,
      review_count: 0,
      currency_code: "INR",
    },
  ]);

  await upsert("experience_slots", [
    {
      id: IDS.slot1,
      experience_id: IDS.exp1,
      slot_date: isoDate(2),
      start_time: "09:30",
      end_time: "12:30",
      capacity: 8,
      seats_sold: 3,
      is_blocked: false,
    },
    {
      id: IDS.slot2,
      experience_id: IDS.exp1,
      slot_date: isoDate(5),
      start_time: "09:30",
      end_time: "12:30",
      capacity: 8,
      seats_sold: 0,
      is_blocked: false,
    },
    {
      id: IDS.slot3,
      experience_id: IDS.exp2,
      slot_date: isoDate(1),
      start_time: "06:30",
      end_time: "09:00",
      capacity: 12,
      seats_sold: 5,
      is_blocked: false,
    },
    {
      id: IDS.slot4,
      experience_id: IDS.exp2,
      slot_date: isoDate(4),
      start_time: "06:30",
      end_time: "09:00",
      capacity: 12,
      seats_sold: 0,
      is_blocked: false,
    },
    {
      id: IDS.slot5,
      experience_id: IDS.exp3,
      slot_date: isoDate(2),
      start_time: "18:00",
      end_time: "19:30",
      capacity: 10,
      seats_sold: 2,
      is_blocked: false,
    },
    {
      id: IDS.slot6,
      experience_id: IDS.exp4,
      slot_date: isoDate(3),
      start_time: "10:00",
      end_time: "12:00",
      capacity: 14,
      seats_sold: 6,
      is_blocked: false,
    },
    {
      id: IDS.slot7,
      experience_id: IDS.exp5,
      slot_date: isoDate(1),
      start_time: "17:00",
      end_time: "18:45",
      capacity: 15,
      seats_sold: 4,
      is_blocked: false,
    },
    {
      id: IDS.slot8,
      experience_id: IDS.exp1,
      slot_date: isoDate(8),
      start_time: "10:00",
      end_time: "13:00",
      capacity: 8,
      seats_sold: 1,
      is_blocked: false,
    },
  ]);

  await upsert("reviews", [
    {
      id: IDS.review1,
      experience_id: IDS.exp1,
      rating: 5,
      comment: "Calm, skilled instructors — the wheel finally made sense.",
      reviewer_display_name: "Aditi",
    },
    {
      id: IDS.review2,
      experience_id: IDS.exp2,
      rating: 5,
      comment: "Breakfast under the neem tree was unforgettable.",
      reviewer_display_name: "Rahul",
    },
    {
      id: IDS.review3,
      experience_id: IDS.exp4,
      rating: 4,
      comment: "Loved the cupping notes — taking beans home was a treat.",
      reviewer_display_name: "Meera",
    },
  ]);
}

async function seedHomestays() {
  console.log("Seeding homestays (published + pending)…");
  await upsert("homestay_owners", [
    {
      id: IDS.hsOwner1,
      full_name: "Royal Heritage Stays",
      email: "heritage@royalpassage.demo",
      phone: "+91 9000000001",
      address: "Mysuru, Karnataka",
      approval_status: "approved",
      verified: true,
    },
    {
      id: IDS.hsOwner2,
      full_name: "Mysuru Villa Collection",
      email: "homestay@royalpassage.demo",
      phone: "+91 9000000002",
      address: "Chamundi Hill Road, Mysuru",
      approval_status: "approved",
      verified: true,
    },
  ]);

  await upsert("homestays", [
    {
      id: IDS.hs1,
      owner_id: IDS.hsOwner1,
      slug: "heritage-haveli-mysuru",
      title: "Heritage Haveli Mysuru",
      tagline: "Wake to palace views and courtyard chai",
      description: "A restored century-old haveli steps from Mysuru Palace.",
      property_type: "Home Stay",
      city_slug: "mysuru",
      city: "Mysuru",
      region: "Karnataka",
      address: "Near Devaraja Market, Mysuru",
      amenities: ["WiFi", "Breakfast", "Garden", "Parking", "AC"],
      house_rules: ["No smoking indoors", "Quiet hours after 10 PM"],
      check_in_time: "14:00",
      check_out_time: "11:00",
      hero_image_url: IMG.stay1,
      gallery_urls: [IMG.stay1, IMG.stay4],
      price_per_night_minor: 450000,
      currency_code: "INR",
      bedrooms: 3,
      bathrooms: 2,
      max_guests: 6,
      rating_avg: 4.8,
      reviews_count: 56,
      status: "published",
    },
    {
      id: IDS.hs2,
      owner_id: IDS.hsOwner2,
      slug: "chamundi-hills-villa",
      title: "Chamundi Hills Villa",
      tagline: "Palace views, gardens, and quiet mornings",
      description: "A serene villa at the Chamundi foothills.",
      property_type: "Resort",
      city_slug: "mysuru",
      city: "Mysuru",
      region: "Karnataka",
      address: "Chamundi Hill Road, Mysuru",
      amenities: ["WiFi", "Kitchen", "Garden", "Parking", "Breakfast", "AC"],
      house_rules: [],
      check_in_time: "15:00",
      check_out_time: "11:00",
      hero_image_url: IMG.stay2,
      gallery_urls: [IMG.stay2],
      price_per_night_minor: 620000,
      currency_code: "INR",
      bedrooms: 2,
      bathrooms: 2,
      max_guests: 4,
      rating_avg: 4.9,
      reviews_count: 41,
      status: "published",
    },
    {
      id: IDS.hs3,
      owner_id: IDS.hsOwner1,
      slug: "royal-passage-guest-house",
      title: "Royal Passage Guest House",
      tagline: "Boutique rooms curated for discerning travellers",
      description: "Premium linens, local art, and concierge support.",
      property_type: "Hotel",
      city_slug: "mysuru",
      city: "Mysuru",
      region: "Karnataka",
      address: "Saraswathipuram, Mysuru",
      amenities: ["WiFi", "AC", "TV", "Security", "Breakfast", "Parking"],
      house_rules: [],
      check_in_time: "13:00",
      check_out_time: "10:00",
      hero_image_url: IMG.stay3,
      gallery_urls: [IMG.stay3],
      price_per_night_minor: 380000,
      currency_code: "INR",
      bedrooms: 4,
      bathrooms: 4,
      max_guests: 8,
      rating_avg: 4.7,
      reviews_count: 29,
      status: "published",
    },
    {
      id: IDS.hsPending,
      owner_id: IDS.hsOwner2,
      slug: "demo-lakeview-cottage-pending",
      title: "Lakeview Cottage (Pending Approval)",
      tagline: "Demo property for admin approve/reject testing",
      description: "Intentionally pending_review so the Homestays admin queue is never empty.",
      property_type: "Home Stay",
      city_slug: "mysuru",
      city: "Mysuru",
      region: "Karnataka",
      address: "Kukkarahalli Lake Road, Mysuru",
      amenities: ["WiFi", "Garden", "Parking"],
      house_rules: [],
      check_in_time: "14:00",
      check_out_time: "11:00",
      hero_image_url: IMG.stay4,
      gallery_urls: [IMG.stay4],
      price_per_night_minor: 320000,
      currency_code: "INR",
      bedrooms: 2,
      bathrooms: 1,
      max_guests: 4,
      rating_avg: 0,
      reviews_count: 0,
      status: "pending_review",
    },
  ]);

  await upsert("homestay_rooms", [
    {
      id: IDS.room1,
      homestay_id: IDS.hs1,
      name: "Courtyard Suite",
      category: "Suite",
      capacity: 2,
      price_per_night_minor: 450000,
      total_units: 2,
      extra_bed_available: true,
      extra_bed_price_per_night_minor: 80000,
      weekend_extra_bed_price_per_night_minor: 80000,
      sort_order: 0,
    },
    {
      id: IDS.room2,
      homestay_id: IDS.hs2,
      name: "Garden View Suite",
      category: "Suite",
      capacity: 2,
      price_per_night_minor: 620000,
      total_units: 3,
      extra_bed_available: true,
      extra_bed_price_per_night_minor: 100000,
      weekend_extra_bed_price_per_night_minor: 100000,
      sort_order: 0,
    },
    {
      id: IDS.room3,
      homestay_id: IDS.hs3,
      name: "Deluxe Double",
      category: "Deluxe",
      capacity: 2,
      price_per_night_minor: 380000,
      total_units: 4,
      extra_bed_available: false,
      extra_bed_price_per_night_minor: 0,
      weekend_extra_bed_price_per_night_minor: 0,
      sort_order: 0,
    },
    {
      id: IDS.roomPending,
      homestay_id: IDS.hsPending,
      name: "Lake Room",
      category: "Standard",
      capacity: 2,
      price_per_night_minor: 320000,
      total_units: 1,
      extra_bed_available: false,
      extra_bed_price_per_night_minor: 0,
      weekend_extra_bed_price_per_night_minor: 0,
      sort_order: 0,
    },
  ]);
}

async function seedVip() {
  console.log("Seeding VIP owners + packages…");
  try {
    await upsert("vip_owners", [
      {
        id: IDS.vipOwner,
        full_name: "Royal Passage Concierge",
        email: "vip@royalpassage.demo",
        phone: "+91 9000000003",
        address: "Mysuru, Karnataka",
        approval_status: "approved",
        verified: true,
      },
    ]);

    await upsert("vip_packages", [
      {
        id: IDS.vip1,
        owner_id: IDS.vipOwner,
        slug: "maharaja-palace-experience",
        title: "Maharaja Palace Experience",
        tagline: "Private palace access, heritage lunch, and evening light & sound",
        description: "A two-day immersion in Mysuru's royal heart.",
        package_type: "Palace Experience",
        city_slug: "mysuru",
        city: "Mysuru",
        region: "Karnataka",
        highlights: [
          "Private palace guide",
          "Heritage lunch",
          "Light & sound show seating",
          "Private transfers",
        ],
        concierge_note: "Concierge confirms show timings with your group.",
        hero_image_url: IMG.vip1,
        gallery_urls: [IMG.vip1],
        price_from_minor: 2850000,
        currency_code: "INR",
        duration_days: 2,
        max_guests: 6,
        rating_avg: 4.9,
        reviews_count: 28,
        status: "published",
      },
      {
        id: IDS.vip2,
        owner_id: IDS.vipOwner,
        slug: "niligiri-wellness-retreat",
        title: "Nilgiri Wellness Retreat",
        tagline: "Sound healing, estate walks, and private chef breakfasts",
        description: "A three-day wellness package for couples and small families.",
        package_type: "Wellness Retreat",
        city_slug: "mysuru",
        city: "Mysuru",
        region: "Karnataka",
        highlights: ["Daily sound sessions", "Estate nature walk", "Private chef breakfast"],
        concierge_note: null,
        hero_image_url: IMG.vip2,
        gallery_urls: [IMG.vip2],
        price_from_minor: 4200000,
        currency_code: "INR",
        duration_days: 3,
        max_guests: 4,
        rating_avg: 4.8,
        reviews_count: 16,
        status: "published",
      },
      {
        id: IDS.vipPending,
        owner_id: IDS.vipOwner,
        slug: "demo-private-celebration-pending",
        title: "Private Celebration Package (Pending)",
        tagline: "Demo VIP package awaiting admin approval",
        description: "Intentionally pending_review for the VIP admin queue.",
        package_type: "Private Celebration",
        city_slug: "mysuru",
        city: "Mysuru",
        region: "Karnataka",
        highlights: ["Venue styling", "Concierge host", "Chef tasting menu"],
        concierge_note: "Demo only.",
        hero_image_url: IMG.palace,
        gallery_urls: [IMG.palace],
        price_from_minor: 5500000,
        currency_code: "INR",
        duration_days: 1,
        max_guests: 20,
        rating_avg: 0,
        reviews_count: 0,
        status: "pending_review",
      },
    ]);
  } catch (err) {
    console.warn(`  VIP seed skipped: ${err instanceof Error ? err.message : err}`);
  }
}

async function seedBannersAndSettings() {
  console.log("Seeding homepage settings + banners…");
  const now = Date.now();
  const starts = new Date(now - 86400000).toISOString();
  const ends = new Date(now + 30 * 86400000).toISOString();

  const { error } = await supabase.from("platform_settings").upsert(
    [
      { key: "commission_percent", value: 10 },
      { key: "default_currency", value: "INR" },
      {
        key: "site_banners",
        value: {
          banners: [
            {
              id: "demo-banner-diwali",
              title: "Festival season experiences",
              body: "Book heritage walks and studio sessions for the festive week.",
              href: "/experiences",
              imageUrl: IMG.banner,
              placement: "home_top",
              startsAt: starts,
              endsAt: ends,
              active: true,
            },
          ],
        },
      },
      {
        key: "homepage_content_version",
        value: now,
      },
    ],
    { onConflict: "key" },
  );
  if (error) throw error;
  console.log("  platform_settings updated");
}

async function seedUsersAndBookings() {
  console.log("Creating demo auth users…");
  const guestId = await ensureAuthUser({
    email: "guest@royalpassage.demo",
    password: DEMO_PASSWORD,
    fullName: "Demo Guest",
    role: "guest",
  });
  const hostUserId = await ensureAuthUser({
    email: "host@royalpassage.demo",
    password: DEMO_PASSWORD,
    fullName: "Demo Experience Host",
    role: "host",
  });
  const homestayUserId = await ensureAuthUser({
    email: "homestay@royalpassage.demo",
    password: DEMO_PASSWORD,
    fullName: "Demo Homestay Owner",
    role: "homestay_owner",
  });
  const vipUserId = await ensureAuthUser({
    email: "vip@royalpassage.demo",
    password: DEMO_PASSWORD,
    fullName: "Demo VIP Owner",
    role: "vip_owner",
  });

  await supabase
    .from("hosts")
    .update({ auth_user_id: hostUserId })
    .eq("id", IDS.hostPending);

  await supabase
    .from("homestay_owners")
    .update({ auth_user_id: homestayUserId })
    .eq("id", IDS.hsOwner2);

  try {
    await supabase.from("vip_owners").update({ auth_user_id: vipUserId }).eq("id", IDS.vipOwner);
    await supabase.from("profiles").update({ vip_owner_id: IDS.vipOwner }).eq("id", vipUserId);
  } catch {
    /* optional */
  }

  try {
    await supabase
      .from("profiles")
      .update({ host_id: IDS.hostPending })
      .eq("id", hostUserId);
  } catch {
    /* host_id column may differ */
  }

  try {
    await supabase
      .from("profiles")
      .update({ homestay_owner_id: IDS.hsOwner2 })
      .eq("id", homestayUserId);
  } catch {
    /* optional */
  }

  console.log("Seeding bookings…");
  await upsert("bookings", [
    {
      id: IDS.booking1,
      slot_id: IDS.slot1,
      experience_id: IDS.exp1,
      guest_id: guestId,
      guest_email: "guest@royalpassage.demo",
      guest_name: "Demo Guest",
      guest_phone: "+91 9888800001",
      customer_user_id: guestId,
      guest_count: 2,
      participant_count: 2,
      status: "pending_payment",
      booking_status: "pending",
      payment_method: "cod",
      payment_status: "pending",
      subtotal_minor: 480000,
      total_amount: 480000,
      platform_fee_minor: 48000,
      host_payout_minor: 432000,
      currency_code: "INR",
      notes: "Demo pending booking for admin + host testing",
    },
    {
      id: IDS.booking2,
      slot_id: IDS.slot3,
      experience_id: IDS.exp2,
      guest_id: guestId,
      guest_email: "guest@royalpassage.demo",
      guest_name: "Demo Guest",
      guest_phone: "+91 9888800001",
      customer_user_id: guestId,
      guest_count: 3,
      participant_count: 3,
      status: "confirmed",
      booking_status: "confirmed",
      payment_method: "cod",
      payment_status: "pending",
      subtotal_minor: 555000,
      total_amount: 555000,
      platform_fee_minor: 55500,
      host_payout_minor: 499500,
      currency_code: "INR",
      notes: "Demo confirmed booking",
      confirmed_at: isoDateTime(-1),
    },
    {
      id: IDS.booking3,
      slot_id: IDS.slot6,
      experience_id: IDS.exp4,
      guest_id: guestId,
      guest_email: "guest@royalpassage.demo",
      guest_name: "Demo Guest",
      guest_phone: "+91 9888800001",
      customer_user_id: guestId,
      guest_count: 1,
      participant_count: 1,
      status: "completed",
      booking_status: "completed",
      payment_method: "cod",
      payment_status: "paid",
      subtotal_minor: 145000,
      total_amount: 145000,
      platform_fee_minor: 14500,
      host_payout_minor: 130500,
      currency_code: "INR",
      notes: "Demo completed booking",
      confirmed_at: isoDateTime(-10),
      completed_at: isoDateTime(-3),
    },
  ]);

  await upsert("homestay_bookings", [
    {
      id: IDS.hsBooking1,
      homestay_id: IDS.hs1,
      room_id: IDS.room1,
      guest_id: guestId,
      check_in: isoDate(7),
      check_out: isoDate(9),
      guest_count: 2,
      room_count: 1,
      extra_bed_count: 0,
      subtotal_minor: 900000,
      platform_fee_minor: 90000,
      host_payout_minor: 810000,
      total_amount: 900000,
      currency_code: "INR",
      booking_status: "pending",
      payment_status: "pending",
      payment_method: "cod",
      notes: "Demo pending stay for admin/owner testing",
    },
    {
      id: IDS.hsBooking2,
      homestay_id: IDS.hs2,
      room_id: IDS.room2,
      guest_id: guestId,
      check_in: isoDate(14),
      check_out: isoDate(16),
      guest_count: 2,
      room_count: 1,
      extra_bed_count: 0,
      subtotal_minor: 1240000,
      platform_fee_minor: 124000,
      host_payout_minor: 1116000,
      total_amount: 1240000,
      currency_code: "INR",
      booking_status: "confirmed",
      payment_status: "pending",
      payment_method: "cod",
      notes: "Demo confirmed stay",
    },
  ]);
}

async function main() {
  console.log("Seeding demo data into", url);
  await seedCatalogBasics();
  await seedExperiences();
  await seedHomestays();
  await seedVip();
  await seedBannersAndSettings();
  await seedUsersAndBookings();

  console.log("\nDone. Demo logins (password Demo@12345):");
  console.log("  guest@royalpassage.demo");
  console.log("  host@royalpassage.demo");
  console.log("  homestay@royalpassage.demo");
  console.log("  vip@royalpassage.demo");
  console.log("Admin (if set up): Admin@gmail.com / Admin@123");
  console.log("\nAdmin queues should show pending experience + homestay (+ VIP) approvals.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
