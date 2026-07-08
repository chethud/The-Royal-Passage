import { createFileRoute } from "@tanstack/react-router";
import { RoyalAuthExperience } from "@/components/auth/RoyalAuthExperience";

type ForgotPasswordSearch = {
  redirect?: string;
};

export const Route = createFileRoute("/forgot-password")({
  validateSearch: (s: Record<string, unknown>): ForgotPasswordSearch => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Forgot password — The Royal Passage" },
      {
        name: "description",
        content: "Reset your Royal Passage account password via email.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  return <RoyalAuthExperience initialMode="forgot" />;
}
