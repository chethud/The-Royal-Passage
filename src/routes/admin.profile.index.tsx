import { createFileRoute } from "@tanstack/react-router";
import { AccountProfileSection } from "@/components/account/AccountProfileSection";

export const Route = createFileRoute("/admin/profile/")({
  component: AdminProfileAccountPage,
});

function AdminProfileAccountPage() {
  return <AccountProfileSection />;
}
