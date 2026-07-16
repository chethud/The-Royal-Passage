import { createFileRoute } from "@tanstack/react-router";
import { AdminEscalationDirectory } from "@/components/admin/AdminEscalationDirectory";

export const Route = createFileRoute("/admin/profile/escalation")({
  component: AdminProfileEscalationPage,
});

function AdminProfileEscalationPage() {
  return <AdminEscalationDirectory />;
}
