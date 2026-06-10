import { createFileRoute } from "@tanstack/react-router";
import { RoyalAuthExperience } from "@/components/auth/RoyalAuthExperience";

type SignUpSearch = {
  redirect?: string;
};

export const Route = createFileRoute("/sign-up")({
  validateSearch: (s: Record<string, unknown>): SignUpSearch => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Create account — The Royal Passage" },
      { name: "description", content: "Request your royal passage. Create a guest account to book heritage experiences." },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  return <RoyalAuthExperience initialMode="signup" />;
}
