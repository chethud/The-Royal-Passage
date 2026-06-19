import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";

/** Full-page auth gate loading — preserves header/footer without changing route logic. */
export function PageLoadingGate() {
  return (
    <div className="min-h-screen pt-[var(--header-height)] text-foreground">
      <Header />
      <section className="container-page page-section">
        <div className="mx-auto max-w-3xl stack-6" aria-busy="true" aria-label="Loading page">
          <div className="luxury-shimmer dashboard-skeleton dashboard-skeleton--badge" />
          <div className="luxury-shimmer dashboard-skeleton dashboard-skeleton--title" />
          <div className="luxury-shimmer dashboard-skeleton dashboard-skeleton--subtitle" />
          <div className="luxury-shimmer dashboard-skeleton dashboard-skeleton--panel" />
        </div>
      </section>
      <Footer />
    </div>
  );
}
