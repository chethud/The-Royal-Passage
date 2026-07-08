import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordExperience } from "@/components/auth/ResetPasswordExperience";

type ResetPasswordSearch = {
  redirect?: string;
};

export const Route = createFileRoute("/reset-password")({
  validateSearch: (s: Record<string, unknown>): ResetPasswordSearch => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Reset password — The Royal Passage" },
      {
        name: "description",
        content: "Set a new password for your Royal Passage account.",
      },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  return <ResetPasswordExperience />;
}
