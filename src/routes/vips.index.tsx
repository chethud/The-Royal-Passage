import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { VipsHomeHero } from "@/components/vips/VipsHomeHero";
import { VipsShowcase } from "@/components/site/VipsShowcase";
import { useAuthUser } from "@/lib/auth-user";
import { isApprovedVipMember } from "@/lib/api/vip-membership";
import { getVipsForUi } from "@/lib/vip-fns";
import { canonicalLink } from "@/lib/seo-helpers";
import { SITE_URL } from "@/lib/seo";
import { isGuestAccount } from "@/lib/roles";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

export const Route = createFileRoute("/vips/")({
  loader: async () => getVipsForUi(),
  head: () => ({
    meta: [
      { title: "Royal VIP Packages — The Royal Passage" },
      {
        name: "description",
        content:
          "Curated Royal VIP packages in Mysuru — palace experiences, heritage circuits, and wellness retreats. Custom packages designed by our concierge.",
      },
      { property: "og:title", content: "Royal VIP Packages — The Royal Passage" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/vips` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [canonicalLink("/vips", SITE_URL)],
  }),
  component: VipsHomePage,
});

function VipsHomePage() {
  const navigate = useNavigate();
  const { user, role, loading, vipMembershipStatus } = useAuthUser();
  const { vips } = Route.useLoaderData();

  useEffect(() => {
    if (loading || !user) return;
    if (!isGuestAccount(role)) return;
    if (isApprovedVipMember(vipMembershipStatus)) {
      void navigate({ to: "/member/vip" });
      return;
    }
    void navigate({ to: "/experiences" });
  }, [loading, navigate, role, user, vipMembershipStatus]);

  if (loading) {
    return <PageLoadingGate />;
  }

  if (user && isGuestAccount(role)) {
    return <PageLoadingGate />;
  }

  return (
    <div className="overflow-x-hidden bg-background text-foreground">
      <Header />
      <VipsHomeHero />
      <VipsShowcase vips={vips} />
      <Footer />
    </div>
  );
}
