import experienceTermsMarkdown from "@/content/experience-terms.md?raw";
import { renderLegalMarkdown } from "@/lib/legal/render-legal-markdown";

export function ExperienceTermsDocument() {
  return (
    <article className="legal-document w-full max-w-none space-y-5 text-left">
      {renderLegalMarkdown(experienceTermsMarkdown)}
    </article>
  );
}
