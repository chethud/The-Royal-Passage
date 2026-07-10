import experienceTermsMarkdown from "@/content/experience-terms.md?raw";
import { renderLegalMarkdown } from "@/lib/legal/render-legal-markdown";

export const EXPERIENCE_TERMS_PATH = "/legal/experience-terms";

export function ExperienceTermsDocument() {
  return (
    <article className="space-y-4">
      {renderLegalMarkdown(experienceTermsMarkdown)}
    </article>
  );
}
