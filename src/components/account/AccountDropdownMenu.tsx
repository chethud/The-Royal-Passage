import type { ComponentType } from "react";
import { Link } from "@tanstack/react-router";
import {
  History,
  Home,
  Image,
  LayoutDashboard,
  LogOut,
  UserCircle,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfileNavIcon } from "@/components/account/ProfileNavIcon";
import { ROLE_LABELS, type UserRole } from "@/lib/roles";

type AccountDropdownMenuProps = {
  displayName: string | null;
  email: string | null | undefined;
  role: UserRole | null;
  isGuest: boolean;
  isAdmin: boolean;
  isVipSection: boolean;
  isHomestaySection: boolean;
  dashboardPath: string;
  loggingOut: boolean;
  onProfile: () => void;
  onLogout: () => void;
};

function accountInitials(displayName: string | null, email: string | null | undefined): string {
  const source = displayName?.trim() || email?.trim() || "Guest";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function AccountMenuItem({
  icon: Icon,
  label,
  description,
  to,
  onSelect,
  disabled,
  variant = "default",
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  description?: string;
  to?: string;
  onSelect?: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
}) {
  const content = (
    <>
      <span
        className={`header-account-menu__icon${variant === "danger" ? " header-account-menu__icon--danger" : ""}`}
      >
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="header-account-menu__item-label">{label}</span>
        {description ? <span className="header-account-menu__item-desc">{description}</span> : null}
      </span>
    </>
  );

  if (to) {
    return (
      <DropdownMenuItem asChild disabled={disabled}>
        <Link to={to} className="header-account-menu__item">
          {content}
        </Link>
      </DropdownMenuItem>
    );
  }

  return (
    <DropdownMenuItem
      onSelect={onSelect}
      disabled={disabled}
      className={`header-account-menu__item${variant === "danger" ? " header-account-menu__item--danger" : ""}`}
    >
      {content}
    </DropdownMenuItem>
  );
}

export function AccountDropdownMenu({
  displayName,
  email,
  role,
  isGuest,
  isAdmin,
  isVipSection,
  isHomestaySection,
  dashboardPath,
  loggingOut,
  onProfile,
  onLogout,
}: AccountDropdownMenuProps) {
  const homePath = isVipSection ? "/vips" : isHomestaySection ? "/homestays" : "/";
  const historyLabel = isVipSection ? "My bookings" : isHomestaySection ? "My stays" : "History";
  const historyDescription = isVipSection
    ? "VIP package reservations"
    : isHomestaySection
      ? "Homestay reservations"
      : "Experience bookings";
  const roleLabel = role ? ROLE_LABELS[role] : "Account";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="header-nav-link group inline-flex p-0.5"
          aria-label={displayName ? `${displayName} account menu` : "Account menu"}
        >
          <ProfileNavIcon size={40} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="header-account-menu z-[100] w-64 p-0">
        <div className="header-account-menu__header">
          <span className="header-account-menu__avatar" aria-hidden>
            {accountInitials(displayName, email)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="header-account-menu__name truncate">{displayName?.trim() || "Royal guest"}</p>
            {email ? <p className="header-account-menu__email truncate">{email}</p> : null}
            <p className="header-account-menu__role">{roleLabel}</p>
          </div>
        </div>

        <div className="header-account-menu__body">
          <DropdownMenuLabel className="header-account-menu__section">Navigate</DropdownMenuLabel>

          {isAdmin ? (
            <AccountMenuItem
              icon={LayoutDashboard}
              label="Dashboard"
              description="Your workspace overview"
              to={dashboardPath}
            />
          ) : isGuest ? (
            <>
              <AccountMenuItem
                icon={Home}
                label="Home"
                description="Return to the main passage"
                to={homePath}
              />
              <AccountMenuItem
                icon={History}
                label={historyLabel}
                description={historyDescription}
                to="/dashboard/history"
              />
            </>
          ) : (
            <AccountMenuItem
              icon={LayoutDashboard}
              label="Dashboard"
              description="Your workspace overview"
              to={dashboardPath}
            />
          )}

          <DropdownMenuSeparator className="header-account-menu__divider" />
          <DropdownMenuLabel className="header-account-menu__section">Account</DropdownMenuLabel>
          {isAdmin ? (
            <>
              <AccountMenuItem
                icon={UserCircle}
                label="Profile"
                description="Identity passport & details"
                to="/admin/profile"
              />
              <AccountMenuItem
                icon={Users}
                label="Users"
                description="Create and manage platform users"
                to="/admin/profile/users"
              />
              <AccountMenuItem
                icon={Image}
                label="Homepage photos"
                description="Manage homepage imagery"
                to="/admin/profile/homepage-photos"
              />
            </>
          ) : (
            <AccountMenuItem
              icon={UserCircle}
              label="Profile"
              description="Identity passport & details"
              onSelect={onProfile}
            />
          )}
        </div>

        <div className="header-account-menu__footer">
          <AccountMenuItem
            icon={LogOut}
            label={loggingOut ? "Logging out…" : "Sign out"}
            onSelect={onLogout}
            disabled={loggingOut}
            variant="danger"
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
