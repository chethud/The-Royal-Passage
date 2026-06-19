import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { LogOut, Menu, Pencil, ScrollText, Star, UserRound, Users } from "lucide-react";
import { useEffect, useState } from "react";
import logoUrl from "@/assets/logo/logo.png";
import { CartIcon } from "@/components/cart/CartIcon";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ProfileNavIcon } from "@/components/account/ProfileNavIcon";
import {
  adminNavItemsForModule,
  isAdminNavItemActive,
  resolveAdminModule,
} from "@/components/admin/admin-nav";
import { HOST_NAV_ITEMS } from "@/components/host/host-nav";
import { HOMESTAY_OWNER_NAV_ITEMS } from "@/components/homestay-owner/homestay-owner-nav";
import { useExperienceCart } from "@/hooks/use-experience-cart";
import { useNavBadges } from "@/hooks/use-nav-badges";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { dashboardPathForRole, isAdminRole, isGuestAccount, profilePathForRole, type UserRole } from "@/lib/roles";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

import {
  isHomestayPublicSection,
  isPublicNavItemActive,
  publicNavItemsForSection,
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
  if (!signedIn || !role) return publicNavItemsForSection(pathname);
  if (role === "admin") {
    return adminNavItemsForModule(resolveAdminModule(pathname));
  }
  if (role === "host") {
    return HOST_NAV_ITEMS.map((item) => ({ label: item.label, to: item.to }));
  }
  if (role === "homestay_owner") {
    return HOMESTAY_OWNER_NAV_ITEMS.map((item) => ({ label: item.label, to: item.to }));
  }
  return publicNavItemsForSection(pathname);
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
  const logoPath =
    user && role && role !== "guest"
      ? dashboardPath
      : isHomestaySection
        ? "/homestays"
        : "/";
  const isGuest = role === "guest";
  const isAdmin = isAdminRole(role);
  const isHost = role === "host";
  const showStaffNotifications = Boolean(user) && (isAdmin || isHost);
  const navBadges = useNavBadges();
  const showGuestCart = Boolean(user) && isGuestAccount(role) && !isHomestaySection;
  const { count: cartCount } = useExperienceCart();
  const showPublicBookingCtas = !user || isGuest;
  const showSignIn = !user;
  const showAccountMenu = Boolean(user);

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await getSupabaseBrowser().auth.signOut();
      await router.invalidate();
      void router.navigate({ to: isHomestaySection ? "/homestays" : "/" });
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
      <div className="container-page flex h-[var(--header-height)] items-center justify-between gap-3 sm:gap-6">
        <Link
          to={logoPath}
          className="flex shrink-0 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember/60"
          aria-label={
            isHomestaySection && (!user || role === "guest")
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
            decoding="async"
            fetchPriority="high"
            className="h-12 w-auto object-contain object-left drop-shadow-[0_0_30px_oklch(0.75_0.12_86_/_0.5)] sm:h-14 md:h-20 lg:h-24"
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

          {showPublicBookingCtas ? (
            isHomestaySection ? (
              <>
                <Link
                  to="/homestays/browse"
                  className={navLinkClass}
                  activeProps={{ className: "text-ember" }}
                >
                  Book a Homestay
                </Link>
                <Link to="/" className={navLinkClass} activeProps={{ className: "text-ember" }}>
                  Experiences
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/experiences"
                  className={navLinkClass}
                  activeProps={{ className: "text-ember" }}
                >
                  Book an Experience
                </Link>
                <Link
                  to="/homestays"
                  className={navLinkClass}
                  activeProps={{ className: "text-ember" }}
                >
                  Homestays
                </Link>
              </>
            )
          ) : null}
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={`${navLinkClass} group inline-flex p-0.5`}
                    aria-label={displayName ? `${displayName} account menu` : "Account menu"}
                  >
                    <ProfileNavIcon size={40} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-[100] w-52">
                  {isGuest ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to={isHomestaySection ? "/homestays" : "/"} className="cursor-pointer">
                          <UserRound className="h-4 w-4" />
                          Home
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard/history" className="cursor-pointer">
                          <UserRound className="h-4 w-4" />
                          {isHomestaySection ? "My stays" : "History"}
                        </Link>
                      </DropdownMenuItem>
                      {!isHomestaySection ? (
                        <DropdownMenuItem asChild>
                          <Link to="/dashboard/cart" className="cursor-pointer">
                            <UserRound className="h-4 w-4" />
                            Cart
                          </Link>
                        </DropdownMenuItem>
                      ) : null}
                    </>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link to={dashboardPath} className="cursor-pointer">
                        <UserRound className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isAdmin ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/homepage-edit" className="cursor-pointer">
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/hosts" className="cursor-pointer">
                          <Users className="h-4 w-4" />
                          Host accounts
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/reviews" className="cursor-pointer">
                          <Star className="h-4 w-4" />
                          Reviews
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/activity" className="cursor-pointer">
                          <ScrollText className="h-4 w-4" />
                          Activity log
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : null}
                  <DropdownMenuItem onSelect={goToProfile} className="cursor-pointer">
                    <UserRound className="h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  {isGuest ? (
                    <>
                      {!isHomestaySection ? (
                        <DropdownMenuItem asChild>
                          <Link to="/experiences" className="cursor-pointer">
                            Browse experiences
                          </Link>
                        </DropdownMenuItem>
                      ) : null}
                      {isHomestaySection ? (
                        <DropdownMenuItem asChild>
                          <Link to="/homestays/browse" className="cursor-pointer">
                            Browse homestays
                          </Link>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem asChild>
                          <Link to="/homestays" className="cursor-pointer">
                            Browse homestays
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {!isHomestaySection ? (
                        <DropdownMenuItem asChild>
                          <Link to="/homestays" className="cursor-pointer">
                            Homestays home
                          </Link>
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem asChild>
                          <Link to="/" className="cursor-pointer">
                            Experiences home
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => {
                      void handleLogout();
                    }}
                    disabled={loggingOut}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    {loggingOut ? "Logging out..." : "Logout"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          ) : null}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2 md:hidden">
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

                {showPublicBookingCtas || showSignIn ? (
                  <>
                    <MobileNavDivider />
                    {showPublicBookingCtas ? (
                      <>
                        <MobileNavSectionLabel>Book</MobileNavSectionLabel>
                        {isHomestaySection ? (
                          <>
                            <MobileNavLink to="/homestays/browse">Book a Homestay</MobileNavLink>
                            <MobileNavLink to="/">Experiences</MobileNavLink>
                          </>
                        ) : (
                          <>
                            <MobileNavLink to="/experiences">Book an Experience</MobileNavLink>
                            <MobileNavLink to="/homestays">Homestays</MobileNavLink>
                          </>
                        )}
                      </>
                    ) : null}
                    {showSignIn ? <MobileNavLink to="/sign-in">Sign in</MobileNavLink> : null}
                  </>
                ) : null}

                {showAccountMenu ? (
                  <>
                    <MobileNavDivider />
                    <MobileNavSectionLabel>Account</MobileNavSectionLabel>
                    {isGuest ? (
                      <>
                        <MobileNavLink to={isHomestaySection ? "/homestays" : "/"}>Home</MobileNavLink>
                        <MobileNavLink to="/dashboard/history">
                          {isHomestaySection ? "My stays" : "History"}
                        </MobileNavLink>
                        {!isHomestaySection && !showGuestCart ? (
                          <MobileNavLink to="/dashboard/cart">Cart</MobileNavLink>
                        ) : null}
                      </>
                    ) : (
                      <MobileNavLink to={dashboardPath}>Dashboard</MobileNavLink>
                    )}
                    {isAdmin ? (
                      <>
                        <MobileNavLink to="/admin/homepage-edit">Edit</MobileNavLink>
                        <MobileNavLink to="/admin/hosts">Host accounts</MobileNavLink>
                        <MobileNavLink to="/admin/reviews">Reviews</MobileNavLink>
                        <MobileNavLink to="/admin/activity">Activity log</MobileNavLink>
                      </>
                    ) : null}
                    <MobileNavLink to={profilePathForRole(role)}>Profile</MobileNavLink>
                    {isGuest ? (
                      <>
                        {!isHomestaySection ? (
                          <MobileNavLink to="/experiences">Browse experiences</MobileNavLink>
                        ) : null}
                        <MobileNavLink to={isHomestaySection ? "/homestays/browse" : "/homestays"}>
                          Browse homestays
                        </MobileNavLink>
                        <MobileNavLink to={isHomestaySection ? "/" : "/homestays"}>
                          {isHomestaySection ? "Experiences home" : "Homestays home"}
                        </MobileNavLink>
                      </>
                    ) : null}
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
