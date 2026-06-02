import { Link, useRouter } from "@tanstack/react-router";
import { LogOut, Menu, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import logoUrl from "@/assets/logo/logo.png";
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
import { useAuthUser } from "@/lib/auth-user";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

type NavItem = { label: string; to: string };

const navItems: NavItem[] = [
  { label: "Experiences", to: "/experiences" },
  { label: "Curated Journeys", to: "/experiences" },
  { label: "About Us", to: "/hosts" },
  { label: "Journal", to: "/journal" },
  { label: "Gallery", to: "/experiences" },
  { label: "Contact", to: "/contact" },
];

export function Header() {
  const [elevated, setElevated] = useState(false);
  const { displayName, user } = useAuthUser();
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

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
          to="/"
          className="flex shrink-0 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember/60"
          aria-label="The Royal Passage — Home"
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
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to as "/experiences"}
              className="rounded-sm px-1 py-1 text-ink/80 transition-colors hover:text-ember focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60"
              activeProps={{ className: "text-ember" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/experiences"
            className="hidden items-center rounded-sm bg-ember px-3.5 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:inline-flex md:px-4 md:py-2.5 md:text-[0.66rem] lg:px-5 lg:text-[0.7rem] lg:tracking-[0.18em]"
          >
            Book an Experience
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={displayName ? `Account menu for ${displayName}` : "Account menu"}
                  className="hidden h-10 w-10 items-center justify-center rounded-full border border-[oklch(0.88_0.08_86_/_0.35)] text-ink transition-colors hover:border-ember/60 hover:text-ember sm:inline-flex"
                >
                  <UserRound className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem asChild>
                  <Link to="/sign-in" className="cursor-pointer">
                    <UserRound className="h-4 w-4" />
                    {displayName ?? "Profile"}
                  </Link>
                </DropdownMenuItem>
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

          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-[oklch(0.88_0.08_86_/_0.32)] text-ink transition-colors hover:border-ember/60 hover:text-ember"
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
                {navItems.map((item) => (
                  <SheetClose asChild key={item.label}>
                    <Link
                      to={item.to as "/experiences"}
                      className="rounded-sm px-3 py-2.5 text-sm uppercase tracking-[0.16em] text-ink/85 hover:bg-white/5 hover:text-ember"
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}

                <div className="my-4 h-px bg-border/60" />

                <SheetClose asChild>
                  <Link
                    to="/experiences"
                    className="inline-flex items-center justify-center rounded-sm bg-ember px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground shadow-[var(--shadow-gold)]"
                  >
                    Book an Experience
                  </Link>
                </SheetClose>

                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      void handleLogout();
                    }}
                    disabled={loggingOut}
                    className="mt-2 inline-flex items-center gap-2 rounded-sm px-3 py-2.5 text-left text-sm text-destructive hover:bg-white/5 disabled:opacity-70"
                  >
                    <LogOut className="h-4 w-4" />
                    {loggingOut ? "Logging out..." : "Logout"}
                  </button>
                ) : (
                  <SheetClose asChild>
                    <Link
                      to="/sign-in"
                      className="mt-2 rounded-sm px-3 py-2.5 text-sm text-ink/80 hover:bg-white/5 hover:text-ember"
                    >
                      Sign in
                    </Link>
                  </SheetClose>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
