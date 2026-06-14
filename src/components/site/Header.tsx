import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { LogOut, Menu, ShoppingCart, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import logoUrl from "@/assets/logo/logo.png";
import { ADMIN_NAV_ITEMS } from "@/components/admin/admin-nav";
import { HOST_NAV_ITEMS } from "@/components/host/host-nav";
import { useExperienceCart } from "@/hooks/use-experience-cart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useAuthUser } from "@/lib/auth-user";
import { isHostNavItemActive } from "@/lib/host-nav-active";
import { dashboardPathForRole, isGuestAccount, type UserRole } from "@/lib/roles";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

type NavItem = { label: string; to: string };

const publicNavItems: NavItem[] = [
  { label: "About Us", to: "/hosts" },
  { label: "Journal", to: "/journal" },
];

function navItemsForUser(role: UserRole | null | undefined, signedIn: boolean): NavItem[] {
  if (!signedIn || !role) return publicNavItems;
  if (role === "admin") {
    return ADMIN_NAV_ITEMS.map((item) => ({ label: item.label, to: item.to }));
  }
  if (role === "host") {
    return HOST_NAV_ITEMS.map((item) => ({ label: item.label, to: item.to }));
  }
  return publicNavItems;
}

const navLinkClass =
  "header-nav-link rounded-sm px-1 py-1 text-ink/80 transition-colors hover:text-ember focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60";

const sheetLinkClass =
  "rounded-sm px-3 py-2.5 text-sm uppercase tracking-[0.16em] text-ink/85 hover:bg-white/5 hover:text-ember";

function isHeaderNavItemActive(
  role: UserRole | null | undefined,
  pathname: string,
  to: string,
): boolean {
  if (role === "host") return isHostNavItemActive(pathname, to);
  if (role === "admin") {
    if (to === "/admin") return pathname === "/admin";
    return pathname === to || pathname.startsWith(`${to}/`);
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

function ProfileNavLink({ role, className }: { role: UserRole; className: string }) {
  if (role === "guest") {
    return (
      <Link to="/dashboard/profile" className={className}>
        <UserRound className="h-4 w-4" />
        Profile
      </Link>
    );
  }
  if (role === "host") {
    return (
      <Link to="/host/profile" className={className}>
        <UserRound className="h-4 w-4" />
        Profile
      </Link>
    );
  }
  if (role === "admin") {
    return (
      <Link to="/admin/profile" className={className}>
        <UserRound className="h-4 w-4" />
        Profile
      </Link>
    );
  }
  return (
    <Link to="/account/profile" className={className}>
      <UserRound className="h-4 w-4" />
      Profile
    </Link>
  );
}

export function Header() {
  const [elevated, setElevated] = useState(false);
  const { displayName, user, role } = useAuthUser();
  const dashboardPath = role ? dashboardPathForRole(role) : "/sign-in";
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navItems = navItemsForUser(role, Boolean(user));
  const isGuest = role === "guest";
  const showGuestShopping = !user || isGuestAccount(role);
  const { count: cartCount } = useExperienceCart();
  const showBookExperience = !user || isGuest;
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
      void router.navigate({ to: "/" });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header
      data-elevated={elevated ? "true" : "false"}
      className="site-header fixed inset-x-0 top-0 z-50 w-full transition-[background-color,backdrop-filter,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
    >
      <div className="container-page flex h-[var(--header-height)] items-center justify-between gap-3 sm:gap-6">
        <Link
          to={user ? dashboardPath : "/"}
          className="flex shrink-0 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember/60"
          aria-label={user && !isGuest ? "Go to dashboard" : "The Royal Passage — Home"}
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
              </Link>
            );
          })}

          {showBookExperience ? (
            <Link
              to="/experiences"
              className={navLinkClass}
              activeProps={{ className: "text-ember" }}
            >
              Book an Experience
            </Link>
          ) : null}
          {showGuestShopping ? (
            user && isGuest ? (
              <Link
                to="/dashboard/cart"
                className={`${navLinkClass} inline-flex items-center gap-1.5`}
                activeProps={{ className: "text-ember" }}
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                Cart
                {cartCount > 0 ? (
                  <span className="rounded-full bg-ember px-1.5 py-0.5 text-[0.6rem] font-semibold text-primary-foreground">
                    {cartCount}
                  </span>
                ) : null}
              </Link>
            ) : (
              <Link
                to="/sign-in"
                search={{ redirect: "/dashboard/cart" }}
                className={`${navLinkClass} inline-flex items-center gap-1.5`}
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                Cart
                {cartCount > 0 ? (
                  <span className="rounded-full bg-ember px-1.5 py-0.5 text-[0.6rem] font-semibold text-primary-foreground">
                    {cartCount}
                  </span>
                ) : null}
              </Link>
            )
          ) : null}
          {showSignIn ? (
            <Link to="/sign-in" className={navLinkClass} activeProps={{ className: "text-ember" }}>
              Sign in
            </Link>
          ) : null}
          {showAccountMenu ? (
            <>
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className={navLinkClass}>
                    {displayName ?? "Account"}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  {isGuest ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/" className="cursor-pointer">
                          <UserRound className="h-4 w-4" />
                          Home
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard/history" className="cursor-pointer">
                          <UserRound className="h-4 w-4" />
                          History
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard/cart" className="cursor-pointer">
                          <UserRound className="h-4 w-4" />
                          Cart
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link to={dashboardPath} className="cursor-pointer">
                        <UserRound className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    {role ? (
                      <ProfileNavLink role={role} className="cursor-pointer" />
                    ) : (
                      <Link to="/sign-in" className="cursor-pointer">
                        <UserRound className="h-4 w-4" />
                        Profile
                      </Link>
                    )}
                  </DropdownMenuItem>
                  {isGuest ? (
                    <DropdownMenuItem asChild>
                      <Link to="/experiences" className="cursor-pointer">
                        Browse experiences
                      </Link>
                    </DropdownMenuItem>
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
            </>
          ) : null}
        </nav>

        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              className={`${navLinkClass} inline-flex md:hidden`}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[88vw] border-[oklch(0.72_0.09_78_/_0.22)] bg-[oklch(0.14_0.05_22)] text-foreground sm:max-w-md"
          >
            <SheetHeader>
              <SheetTitle className="font-display text-xl">The Royal Passage</SheetTitle>
              <SheetDescription className="sr-only">Site navigation menu</SheetDescription>
            </SheetHeader>
            <div className="mt-8 flex flex-col gap-1">
              {navItems.map((item) => {
                const active = isHeaderNavItemActive(role, pathname, item.to);
                return (
                  <SheetClose asChild key={`${item.to}-${item.label}`}>
                    <Link
                      to={item.to as "/experiences"}
                      className={`${sheetLinkClass}${active ? " text-ember header-nav-link--active" : ""}`}
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                );
              })}

              {showBookExperience ? (
                <SheetClose asChild>
                  <Link to="/experiences" className={sheetLinkClass}>
                    Book an Experience
                  </Link>
                </SheetClose>
              ) : null}
              {showGuestShopping ? (
                <SheetClose asChild>
                  {user && isGuest ? (
                    <Link to="/dashboard/cart" className={sheetLinkClass}>
                      Cart{cartCount > 0 ? ` (${cartCount})` : ""}
                    </Link>
                  ) : (
                    <Link to="/sign-in" search={{ redirect: "/dashboard/cart" }} className={sheetLinkClass}>
                      Cart{cartCount > 0 ? ` (${cartCount})` : ""}
                    </Link>
                  )}
                </SheetClose>
              ) : null}
              {showSignIn ? (
                <SheetClose asChild>
                  <Link to="/sign-in" className={sheetLinkClass}>
                    Sign in
                  </Link>
                </SheetClose>
              ) : null}
              {showAccountMenu ? (
                <>
                  {isGuest ? (
                    <>
                      <SheetClose asChild>
                        <Link to="/" className={sheetLinkClass}>
                          Home
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/dashboard/history" className={sheetLinkClass}>
                          History
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/dashboard/cart" className={sheetLinkClass}>
                          Cart
                        </Link>
                      </SheetClose>
                    </>
                  ) : (
                    <SheetClose asChild>
                      <Link to={dashboardPath} className={sheetLinkClass}>
                        {displayName ?? "Account"}
                      </Link>
                    </SheetClose>
                  )}
                  <SheetClose asChild>
                    {role ? (
                      <ProfileNavLink role={role} className={sheetLinkClass} />
                    ) : (
                      <Link to="/sign-in" className={sheetLinkClass}>
                        Profile
                      </Link>
                    )}
                  </SheetClose>
                  {isGuest ? (
                    <SheetClose asChild>
                      <Link to="/experiences" className={sheetLinkClass}>
                        Browse experiences
                      </Link>
                    </SheetClose>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      void handleLogout();
                    }}
                    disabled={loggingOut}
                    className="inline-flex items-center gap-2 rounded-sm px-3 py-2.5 text-left text-sm text-destructive hover:bg-white/5 disabled:opacity-70"
                  >
                    <LogOut className="h-4 w-4" />
                    {loggingOut ? "Logging out..." : "Logout"}
                  </button>
                </>
              ) : null}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
