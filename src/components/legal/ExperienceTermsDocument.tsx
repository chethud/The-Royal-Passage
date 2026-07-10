import experienceTermsMarkdown from "@/content/experience-terms.md?raw";
import { renderLegalMarkdown } from "@/lib/legal/render-legal-markdown";

export function ExperienceTermsDocument() {
  return (
    <article className="space-y-4">
      {renderLegalMarkdown(experienceTermsMarkdown)}
    </article>
  );
}
