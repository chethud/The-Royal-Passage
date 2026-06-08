/** Private dashboards should not be indexed by search engines. */
export const NOINDEX_META = [{ name: "robots", content: "noindex, nofollow" }] as const;

export function canonicalLink(path: string, siteUrl: string) {
  const href = path.startsWith("http") ? path : `${siteUrl.replace(/\/$/, "")}${path}`;
  return { rel: "canonical" as const, href };
}
