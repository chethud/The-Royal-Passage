-- Sprint 6: Multi-city reference table + experience city_slug link

create table if not exists public.cities (
  slug text primary key,
  name text not null,
  region text,
  state text not null default 'Karnataka',
  country_code text not null default 'IN',
  tagline text,
  description text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.experiences
  add column if not exists city_slug text references public.cities (slug);

create index if not exists idx_experiences_city_slug on public.experiences (city_slug);

insert into public.cities (slug, name, region, state, tagline, description, sort_order) values
  (
    'mysuru',
    'Mysuru',
    'Southern Karnataka',
    'Karnataka',
    'Palaces, pottery, and slow living',
    'The Royal Passage home base — heritage walks, artisan studios, farm mornings, and culinary immersions.',
    10
  ),
  (
    'bengaluru',
    'Bengaluru',
    'Urban Karnataka',
    'Karnataka',
    'Creative city escapes',
    'Weekend workshops, farm-to-table sessions, and curated urban experiences beyond the traffic.',
    20
  ),
  (
    'coorg',
    'Coorg',
    'Western Ghats',
    'Karnataka',
    'Coffee country rituals',
    'Plantation walks, Kodava cuisine, and misty valley experiences in the Scotland of India.',
    30
  ),
  (
    'chikmagalur',
    'Chikmagalur',
    'Malnad hills',
    'Karnataka',
    'Coffee trails and cloud forests',
    'Bean-to-cup journeys, waterfall hikes, and homestay-hosted cultural evenings.',
    40
  ),
  (
    'hampi',
    'Hampi',
    'Vijayanagara heritage',
    'Karnataka',
    'Ruins at golden hour',
    'Archaeological walks, boulder sunsets, and riverside storytelling with local historians.',
    50
  ),
  (
    'ooty',
    'Ooty',
    'Nilgiri hills',
    'Tamil Nadu',
    'Mist, tea, and mountain calm',
    'Tea estate visits, botanical walks, and slow Nilgiri experiences for mindful travellers.',
    60
  )
on conflict (slug) do update set
  name = excluded.name,
  region = excluded.region,
  state = excluded.state,
  tagline = excluded.tagline,
  description = excluded.description,
  sort_order = excluded.sort_order;

update public.experiences
set city_slug = 'mysuru'
where city_slug is null
  and lower(city) in ('mysuru', 'mysore');

alter table public.cities enable row level security;

drop policy if exists "cities_select_active" on public.cities;
create policy "cities_select_active"
  on public.cities for select to anon, authenticated
  using (is_active = true);
