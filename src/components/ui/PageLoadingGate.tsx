import { BrandLogoLoader } from "@/components/site/home-intro";

/** Full-page auth gate loading — brand logo splash while session/route resolves. */
export function PageLoadingGate() {
  return <BrandLogoLoader label="Loading page" />;
}
