import { createFileRoute } from "@tanstack/react-router";
import { RoyalAuthExperience } from "@/components/auth/RoyalAuthExperience";

type SignInSearch = {
  redirect?: string;
};

export const Route = createFileRoute("/sign-in")({
  validateSearch: (s: Record<string, unknown>): SignInSearch => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — The Royal Passage" },
      { name: "description", content: "Sign in with your email and password. Your role is assigned automatically." },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  return <RoyalAuthExperience initialMode="signin" />;
}
