import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import { AuthProvider } from "@/lib/auth-user";
import { VipMembershipPrompt } from "@/components/vip/VipMembershipPrompt";
import { Toaster } from "@/components/ui/sonner";
import logoUrl from "@/assets/logo/logo.png?url";
import appCss from "../styles.css?url";

/** Slimmed family set — display=swap avoids invisible text while fonts load. */
const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;500;600;700&display=swap";

/** Above-the-fold paint without waiting on the full stylesheet. */
const CRITICAL_CSS = `
html{background:#2a0808;color:#f7f1e8}
body{margin:0;min-height:100%;background:#2a0808;color:#f7f1e8;font-family:"Cinzel",Georgia,"Times New Roman",serif}
`.replace(/\s+/g, " ").trim();

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="glass-strong max-w-md rounded-md px-10 py-12 text-center">
        <p className="eyebrow mb-4 text-ember/90">The Royal Passage</p>
        <h1 className="font-display text-7xl font-semibold tracking-wide text-foreground">404</h1>
        <h2 className="mt-4 font-display text-xl text-foreground">Page not found</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-sm bg-ember px-6 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "The Royal Passage — Mysuru" },
      {
        name: "description",
        content:
          "Curated premium experiences in Mysuru & beyond — gold-standard hosting, glass-clear booking.",
      },
      { name: "theme-color", content: "#4a0404" },
      { property: "og:title", content: "The Royal Passage — Mysuru" },
      {
        property: "og:description",
        content: "Curated premium experiences — burgundy & gold.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@RoyalPassage" },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.png?v=2",
        type: "image/png",
      },
      {
        rel: "shortcut icon",
        href: "/favicon.png?v=2",
        type: "image/png",
      },
      {
        rel: "apple-touch-icon",
        href: "/apple-touch-icon.png?v=2",
      },
      {
        rel: "preload",
        href: logoUrl,
        as: "image",
        type: "image/png",
        fetchPriority: "high",
      },
      {
        rel: "preload",
        href: appCss,
        as: "style",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: GOOGLE_FONTS_HREF,
        as: "style",
      },
    ],
    styles: [
      {
        children: CRITICAL_CSS,
      },
    ],
    scripts: [
      {
        children: `(function(){var h=${JSON.stringify(GOOGLE_FONTS_HREF)};var l=document.createElement("link");l.rel="stylesheet";l.href=h;l.media="print";l.onload=function(){this.media="all";this.onload=null};document.head.appendChild(l)})();`,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <noscript>
          <link rel="stylesheet" href={GOOGLE_FONTS_HREF} />
        </noscript>
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <Toaster richColors closeButton position="top-center" />
      <VipMembershipPrompt />
      <Outlet />
    </AuthProvider>
  );
}
