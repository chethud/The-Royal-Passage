import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { VipsBrowseHero } from "@/components/vips/VipsBrowseHero";
import { VipCard } from "@/components/vips/VipCard";
import { useAuthUser } from "@/lib/auth-user";
import { isApprovedVipMember } from "@/lib/api/vip-membership";
import { getVipsForUi } from "@/lib/vip-fns";
import { dashboardPathForRole, isGuestAccount } from "@/lib/roles";
import { NOINDEX_META } from "@/lib/seo-helpers";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/member/vip/packages")({
  loader: async () => getVipsForUi(),
  head: () => ({
    meta: [{ title: "VIP packages — The Royal Passage" }, ...NOINDEX_META],
  }),
  component: MemberVipPackagesPage,
});

function MemberVipPackagesPage() {
  const navigate = useNavigate();
  const { user, role, loading, vipMembershipStatus } = useAuthUser();
  const { vips } = Route.useLoaderData();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/sign-in" });
      return;
    }
    if (!isGuestAccount(role)) {
      void navigate({ to: dashboardPathForRole(role) });
      return;
    }
    if (!isApprovedVipMember(vipMembershipStatus)) {
      void navigate({ to: "/experiences" });
    }
  }, [loading, navigate, role, user, vipMembershipStatus]);

  if (loading || !user || !isGuestAccount(role) || !isApprovedVipMember(vipMembershipStatus)) {
    return <PageLoadingGate />;
  }

  return (
    <div className="overflow-x-hidden bg-background pt-[var(--header-height)] text-foreground">
      <Header />
      <VipsBrowseHero />
      <section className="container-page pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {vips.map((vip) => (
            <VipCard key={vip.slug} vip={vip} />
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
