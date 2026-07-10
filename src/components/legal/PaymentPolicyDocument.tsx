import { useEffect } from "react";
import paymentPolicyMarkdown from "@/content/payment-policy.md?raw";
import { renderLegalMarkdown } from "@/lib/legal/render-legal-markdown";

export function PaymentPolicyDocument() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const target = document.querySelector(hash);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <article className="legal-document w-full max-w-none space-y-5 text-left">
      {renderLegalMarkdown(paymentPolicyMarkdown)}
    </article>
  );
}
