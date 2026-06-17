import { z } from "zod";

export const HOST_EXPERIENCE_SECTIONS = ["details", "sessions"] as const;
export type HostExperienceSection = (typeof HOST_EXPERIENCE_SECTIONS)[number];

export function parseHostExperienceSectionSearch(search: Record<string, unknown>): {
  section: HostExperienceSection;
} {
  const parsed = z
    .object({
      section: z.enum(HOST_EXPERIENCE_SECTIONS).optional(),
    })
    .parse(search);
  return { section: parsed.section ?? "details" };
}

export const HOST_EXPERIENCE_SECTION_LABELS: Record<HostExperienceSection, string> = {
  details: "Listing details",
  sessions: "Session timings",
};
