type VercelRequest = { headers: Record<string, string | string[] | undefined> };
type VercelResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => VercelResponse;
  end: (body: string) => void;
};

const CITY_SLUGS = ["mysuru", "bengaluru", "coorg", "chikmagalur", "hampi", "ooty"];
const PRODUCTION_API_BASE_URL = "https://the-royal-passage.onrender.com";

function resolveSiteUrl(): string {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "https://the-royal-passage.vercel.app";
}

function resolveApiBaseUrl(): string {
  const fromEnv = process.env.VITE_API_BASE_URL ?? process.env.API_BASE_URL;
  if (fromEnv?.trim()) return fromEnv.trim().replace(/\/$/, "");
  return PRODUCTION_API_BASE_URL;
}

async function fetchExperienceSlugs(): Promise<string[]> {
  const apiBase = resolveApiBaseUrl();
  try {
    const response = await fetch(
      `${apiBase}/royalpassage.v1.RoyalPassageService/GetCatalog`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      },
    );
    if (!response.ok) return [];
    const data = (await response.json()) as { experiences?: { slug: string }[] };
    return (data.experiences ?? []).map((row) => row.slug);
  } catch {
    return [];
  }
}

function buildSitemapXml(entries: { loc: string }[]) {
  const body = entries.map((entry) => `  <url><loc>${entry.loc}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}

export default async function sitemapHandler(_req: VercelRequest, res: VercelResponse) {
  const siteUrl = resolveSiteUrl();
  const staticPaths = ["/", "/experiences", "/cities", "/contact", "/journal"];
  const experienceSlugs = await fetchExperienceSlugs();

  const entries = [
    ...staticPaths.map((path) => ({ loc: `${siteUrl}${path}` })),
    ...CITY_SLUGS.map((slug) => ({ loc: `${siteUrl}/cities/${slug}` })),
    ...experienceSlugs.map((slug) => ({ loc: `${siteUrl}/experiences/${slug}` })),
  ];

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
  res.status(200).end(buildSitemapXml(entries));
}
