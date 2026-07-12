import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { LogOut, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import logoUrl from "@/assets/logo/logo.png";
import { CartIcon } from "@/components/cart/CartIcon";
import { AccountDropdownMenu } from "@/components/account/AccountDropdownMenu";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import {
  adminNavItemsForModule,
  isAdminNavItemActive,
  resolveAdminModule,
} from "@/components/admin/admin-nav";
import { HOST_NAV_ITEMS } from "@/components/host/host-nav";
import { HOMESTAY_OWNER_NAV_ITEMS } from "@/components/homestay-owner/homestay-owner-nav";
import { VIP_OWNER_NAV_ITEMS } from "@/components/vip-owner/vip-owner-nav";
import { GUEST_SIGNED_IN_NAV_ITEMS } from "@/lib/vip-member-nav";
import { useExperienceCart } from "@/hooks/use-experience-cart";
import { useNavBadges } from "@/hooks/use-nav-badges";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuthUser } from "@/lib/auth-user";
import { isHostNavItemActive } from "@/lib/host-nav-active";
import { isHomestayOwnerNavItemActive } from "@/lib/homestay-owner-nav-active";
import { isVipOwnerNavItemActive } from "@/lib/vip-owner-nav-active";
import { dashboardPathForRole, isAdminRole, isGuestAccount, profilePathForRole, type UserRole } from "@/lib/roles";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

import {
  isHomestayPublicSection,
  isPublicNavItemActive,
  isVipPublicSection,
  marketplaceHomePath,
  publicGuestNavItems,
} from "@/lib/public-site-nav";
import {
  headerMobileActionClass,
  headerMobileSheetClass,
  headerMobileTriggerClass,
  MobileNavDivider,
  MobileNavLink,
  MobileNavSectionLabel,
} from "@/components/site/header-mobile-nav";

type NavItem = { label: string; to: string };

function navItemsForUser(
  role: UserRole | null | undefined,
  signedIn: boolean,
  pathname: string,
): NavItem[] {
  if (!signedIn || !role) return publicGuestNavItems();
  if (role === "admin") {
    return adminNavItemsForModule(resolveAdminModule(pathname));
  }
  if (role === "host") {
    return HOST_NAV_ITEMS.map((item) => ({ label: item.label, to: item.to }));
  }
  if (role === "homestay_owner") {
    return HOMESTAY_OWNER_NAV_ITEMS.map((item) => ({ label: item.label, to: item.to }));
  }
  if (role === "vip_owner") {
    return VIP_OWNER_NAV_ITEMS.map((item) => ({ label: item.label, to: item.to }));
  }
  if (role === "guest") {
    return GUEST_SIGNED_IN_NAV_ITEMS.map((item) => ({ label: item.label, to: item.to }));
  }
  return publicGuestNavItems();
}

const navLinkClass =
  "header-nav-link rounded-sm px-1 py-1 text-ink/80 transition-colors hover:text-ember focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60";

function NavCountBadge({ count }: { count?: number }) {
  if (!count || count <= 0) return null;
  return (
    <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-ember px-1 text-[0.55rem] font-bold leading-none text-primary-foreground">
      {count > 9 ? "9+" : count}
    </span>
  );
}

function isHeaderNavItemActive(
  role: UserRole | null | undefined,
  pathname: string,
  to: string,
): boolean {
  if (role === "host") return isHostNavItemActive(pathname, to);
  if (role === "homestay_owner") return isHomestayOwnerNavItemActive(pathname, to);
  if (role === "vip_owner") return isVipOwnerNavItemActive(pathname, to);
  if (role === "admin") {
    return isAdminNavItemActive(pathname, to);
  }
  if (!role || role === "guest") {
    return isPublicNavItemActive(pathname, to);
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function Header() {
  const [elevated, setElevated] = useState(false);
  const { displayName, user, role } = useAuthUser();
  const dashboardPath = role ? dashboardPathForRole(role) : "/sign-in";
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navItems = navItemsForUser(role, Boolean(user), pathname);
  const isHomestaySection = isHomestayPublicSection(pathname);
  const isVipSection = isVipPublicSection(pathname);
  const isMarketplaceSection = isHomestaySection || isVipSection;
  const logoPath =
    user && role && role !== "guest"
      ? dashboardPath
      : isMarketplaceSection
        ? marketplaceHomePath(pathname)
        : "/";
  const isGuest = role === "guest";
  const isAdmin = isAdminRole(role);
  const isHost = role === "host";
  const showStaffNotifications = Boolean(user) && (isAdmin || isHost);
  const navBadges = useNavBadges();
  const showGuestCart = Boolean(user) && isGuestAccount(role) && !isMarketplaceSection;
  const { count: cartCount } = useExperienceCart();
  const showSignIn = !user;
  const showAccountMenu = Boolean(user);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setElevated(window.scrollY > 20);
      });
    };
    // Defer first read so it does not compete with LCP layout.
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      setElevated(window.scrollY > 20);
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await getSupabaseBrowser().auth.signOut();
      await router.invalidate();
      void router.navigate({ to: marketplaceHomePath(pathname) });
    } finally {
      setLoggingOut(false);
    }
  };

  const goToProfile = () => {
    void router.navigate({ to: profilePathForRole(role) });
  };

  return (
    <header
      data-elevated={elevated ? "true" : "false"}
      className="site-header fixed inset-x-0 top-0 z-50 w-full transition-[background-color,backdrop-filter,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
    >
      <div className="mx-auto flex h-[var(--header-height)] max-w-[1280px] items-center justify-between gap-2 pl-3 pr-3 sm:gap-4 sm:pl-2 sm:pr-4 md:gap-6 md:pl-3 md:pr-10">
        <Link
          to={logoPath}
          className="flex min-h-11 min-w-0 shrink items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember/60"
          aria-label={
            isVipSection && (!user || role === "guest")
              ? "The Royal Passage — VIP home"
              : isHomestaySection && (!user || role === "guest")
                ? "The Royal Passage — Homestays home"
                : user && role !== "guest"
                  ? "Go to dashboard"
                  : "The Royal Passage — Home"
          }
        >
          <img
            src={logoUrl}
            alt="The Royal Passage"
            width={320}
            height={110}
            decoding="sync"
            loading="eager"
            fetchPriority="high"
            className="h-15 w-auto max-h-[calc(var(--header-height)-0.35rem)] max-w-[min(62vw,13.5rem)] object-contain object-left drop-shadow-[0_0_24px_oklch(0.75_0.12_86_/_0.45)] sm:h-16 sm:max-w-[min(50vw,14rem)] md:h-[6.75rem] md:max-w-none lg:h-[7.35rem]"
          />
        </Link>

        <nav className="hidden items-center gap-5 text-[0.72rem] font-medium uppercase tracking-[0.14em] md:flex lg:gap-7 lg:text-[0.76rem] lg:tracking-[0.16em]">
          {navItems.map((item) => {
            const active = isHeaderNavItemActive(role, pathname, item.to);
            return (
              <Link
                key={`${item.to}-${item.label}`}
                to={item.to as "/experiences"}
                className={`${navLinkClass}${active ? " text-ember header-nav-link--active" : ""}`}
              >
                {item.label}
                <NavCountBadge count={navBadges[item.to]} />
              </Link>
            );
          })}

          {showGuestCart ? (
            <Link
              to="/dashboard/cart"
              className={`${navLinkClass} inline-flex items-center gap-1`}
              activeProps={{ className: "text-ember" }}
              aria-label={cartCount > 0 ? `Cart (${cartCount} items)` : "Cart"}
            >
              <CartIcon size={46} />
              {cartCount > 0 ? (
                <span className="rounded-full bg-ember px-1.5 py-0.5 text-[0.6rem] font-semibold text-primary-foreground">
                  {cartCount}
                </span>
              ) : null}
            </Link>
          ) : null}
          {showStaffNotifications ? <NotificationBell /> : null}
          {showSignIn ? (
            <Link to="/sign-in" className={navLinkClass} activeProps={{ className: "text-ember" }}>
              Sign in
            </Link>
          ) : null}
          {showAccountMenu ? (
            <AccountDropdownMenu
              displayName={displayName}
              email={user?.email}
              role={role}
              isGuest={isGuest}
              isAdmin={isAdmin}
              isVipSection={isVipSection}
              isHomestaySection={isHomestaySection}
              dashboardPath={dashboardPath}
              loggingOut={loggingOut}
              onProfile={goToProfile}
              onLogout={() => {
                void handleLogout();
              }}
            />
          ) : null}
        </nav>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1 md:hidden">
          {showGuestCart ? (
            <Link
              to="/dashboard/cart"
              className={`${headerMobileActionClass} relative gap-1`}
              aria-label={cartCount > 0 ? `Cart (${cartCount} items)` : "Cart"}
            >
              <CartIcon size={40} />
              {cartCount > 0 ? (
                <span className="absolute right-1 top-1 rounded-full bg-ember px-1.5 py-0.5 text-[0.55rem] font-semibold leading-none text-primary-foreground">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              ) : null}
            </Link>
          ) : null}
          {showStaffNotifications ? <NotificationBell /> : null}
          <Sheet>
            <SheetTrigger asChild>
              <button type="button" className={headerMobileTriggerClass} aria-label="Open menu">
                <Menu className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className={headerMobileSheetClass}>
              <SheetHeader className="space-y-1 text-left">
                <SheetTitle className="font-display text-xl tracking-wide">The Royal Passage</SheetTitle>
                {displayName ? (
                  <p className="text-sm text-muted-foreground">{displayName}</p>
                ) : null}
                <SheetDescription className="sr-only">Site navigation menu</SheetDescription>
              </SheetHeader>

              <nav className="header-mobile-nav mt-6" aria-label="Mobile navigation">
                {navItems.map((item) => {
                  const active = isHeaderNavItemActive(role, pathname, item.to);
                  return (
                    <MobileNavLink
                      key={`${item.to}-${item.label}`}
                      to={item.to}
                      active={active}
                    >
                      {item.label}
                      <NavCountBadge count={navBadges[item.to]} />
                    </MobileNavLink>
                  );
                })}

                {showSignIn ? (
                  <>
                    <MobileNavDivider />
                    <MobileNavLink to="/sign-in">Sign in</MobileNavLink>
                  </>
                ) : null}

                {showAccountMenu ? (
                  <>
                    <MobileNavDivider />
                    <MobileNavSectionLabel>Account</MobileNavSectionLabel>
                    {isAdmin ? (
                      <>
                        <MobileNavLink to={dashboardPath}>Dashboard</MobileNavLink>
                        <MobileNavSectionLabel>Administration</MobileNavSectionLabel>
                        <MobileNavLink to="/admin/reviews">Reviews</MobileNavLink>
                        <MobileNavLink to="/admin/activity">Activity log</MobileNavLink>
                        <MobileNavLink to="/admin/homepage-edit">Edit homepage</MobileNavLink>
                        <MobileNavLink to="/admin/profile">Account</MobileNavLink>
                        <MobileNavLink to="/admin/profile/users">Users</MobileNavLink>
                        <MobileNavLink to="/admin/profile/homepage-photos">Homepage photos</MobileNavLink>
                      </>
                    ) : isGuest ? (
                      <>
                        <MobileNavLink to="/dashboard/history">
                          {isVipSection ? "My bookings" : isHomestaySection ? "My stays" : "History"}
                        </MobileNavLink>
                        <MobileNavLink to={profilePathForRole(role)}>Profile</MobileNavLink>
                      </>
                    ) : (
                      <>
                        <MobileNavLink to={dashboardPath}>Dashboard</MobileNavLink>
                        <MobileNavLink to={profilePathForRole(role)}>Profile</MobileNavLink>
                      </>
                    )}
                    <MobileNavLink
                      onClick={() => {
                        void handleLogout();
                      }}
                      disabled={loggingOut}
                      className="header-mobile-nav-link--danger gap-2"
                    >
                      <LogOut className="h-4 w-4" strokeWidth={1.75} />
                      {loggingOut ? "Logging out..." : "Logout"}
                    </MobileNavLink>
                  </>
                ) : null}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
