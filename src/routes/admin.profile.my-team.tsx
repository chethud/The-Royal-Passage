import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CreatePlatformUserForm } from "@/components/admin/CreatePlatformUserForm";
import { ManagedUsersPanel } from "@/components/admin/ManagedUsersPanel";
import { useAuthUser } from "@/lib/auth-user";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/admin/profile/my-team")({
  head: () => ({
    meta: [{ title: "My team — The Royal Passage" }],
  }),
  component: AdminProfileMyTeamPage,
});

function AdminProfileMyTeamPage() {
  const { user } = useAuthUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!user) return;
    void getSupabaseBrowser()
      .auth.getSession()
      .then(({ data }) => {
        setAccessToken(data.session?.access_token ?? null);
      });
  }, [user]);

  if (!user || !accessToken) {
    return <PageLoadingGate />;
  }

  return (
    <div className="space-y-8">
      <CreatePlatformUserForm
        audience="team"
        accessToken={accessToken}
        onCreated={() => setRefreshKey((value) => value + 1)}
      />
      <ManagedUsersPanel accessToken={accessToken} refreshKey={refreshKey} />
    </div>
  );
}
