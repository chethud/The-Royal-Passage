import type { ComponentType } from "react";
import { Link } from "@tanstack/react-router";
import {
  History,
  Image,
  LayoutDashboard,
  LogOut,
  Map,
  Pencil,
  PlusCircle,
  Star,
  UserCircle,
  UserCog,
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
import {
  ROLE_LABELS,
  canEditMysoreTrail,
  hasEditorAccess,
  workspaceLinksForRoles,
  type RoleWorkspaceLink,
  type UserRole,
} from "@/lib/roles";

type AccountDropdownMenuProps = {
  displayName: string | null;
  email: string | null | undefined;
  role: UserRole | null;
  roles: UserRole[];
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
  search,
  onSelect,
  disabled,
  variant = "default",
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  description?: string;
  to?: string;
  search?: Record<string, unknown>;
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
        <Link to={to} search={search ?? {}} className="header-account-menu__item">
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
  roles,
  isGuest,
  isAdmin,
  isVipSection,
  isHomestaySection,
  dashboardPath,
  loggingOut,
  onProfile,
  onLogout,
}: AccountDropdownMenuProps) {
  const historyLabel = isVipSection ? "My bookings" : isHomestaySection ? "My stays" : "History";
  const historyDescription = isVipSection
    ? "VIP package reservations"
    : isHomestaySection
      ? "Homestay reservations"
      : "Experience bookings";
  const workspaces: RoleWorkspaceLink[] = workspaceLinksForRoles(roles, role).filter(
    (workspace) => workspace.role !== "host" && workspace.role !== "homestay_owner",
  );
  const canEditHomepage = hasEditorAccess(roles, role);
  const canEditTrail = canEditMysoreTrail(role, roles);
  const isHost = role === "host" || roles.includes("host");
  const isHomestayOwner = role === "homestay_owner" || roles.includes("homestay_owner");
  const roleLabels =
    roles.length > 0
      ? roles.map((value) => ROLE_LABELS[value]).join(" · ")
      : role
        ? ROLE_LABELS[role]
        : "Account";

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
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        collisionPadding={16}
        className="header-account-menu z-[100] flex w-[min(22rem,calc(100vw-1.25rem))] max-h-[min(85dvh,var(--radix-dropdown-menu-content-available-height))] max-w-[calc(100vw-1.25rem)] flex-col overflow-hidden p-0"
      >
        <div className="header-account-menu__header">
          <span className="header-account-menu__avatar" aria-hidden>
            {accountInitials(displayName, email)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="header-account-menu__name truncate">{displayName?.trim() || "Royal guest"}</p>
            {email ? <p className="header-account-menu__email truncate">{email}</p> : null}
            <p className="header-account-menu__role">{roleLabels}</p>
          </div>
        </div>

        <div className="header-account-menu__body">
          {isGuest ? (
            <>
              <DropdownMenuLabel className="header-account-menu__section">Navigate</DropdownMenuLabel>
              <AccountMenuItem
                icon={History}
                label={historyLabel}
                description={historyDescription}
                to="/dashboard/history"
              />
            </>
          ) : workspaces.length > 0 ? (
            <>
              <DropdownMenuLabel className="header-account-menu__section">
                {workspaces.length > 1 ? "Your workspaces" : "Navigate"}
              </DropdownMenuLabel>
              {workspaces.map((workspace) => (
                <AccountMenuItem
                  key={workspace.role}
                  icon={workspace.role === "editor" ? Pencil : LayoutDashboard}
                  label={workspace.label}
                  description={workspace.description}
                  to={workspace.to}
                />
              ))}
            </>
          ) : !isHost && !isHomestayOwner ? (
            <>
              <DropdownMenuLabel className="header-account-menu__section">Navigate</DropdownMenuLabel>
              <AccountMenuItem
                icon={LayoutDashboard}
                label="Dashboard"
                description="Your workspace overview"
                to={dashboardPath}
              />
            </>
          ) : null}

          {isAdmin ? (
            <>
              <DropdownMenuSeparator className="header-account-menu__divider" />
              <DropdownMenuLabel className="header-account-menu__section">Administration</DropdownMenuLabel>
              <AccountMenuItem icon={Star} label="Reviews" description="Moderate guest reviews" to="/admin/reviews" />
              <AccountMenuItem
                icon={Pencil}
                label="Edit homepage"
                description="Hero, showcase & video sections"
                to="/admin/homepage-edit"
              />
              <AccountMenuItem
                icon={Map}
                label="Mysore Trail"
                description="Edit & publish the public itinerary"
                to="/admin/mysore-trail"
              />
            </>
          ) : canEditHomepage || canEditTrail ? (
            <>
              <DropdownMenuSeparator className="header-account-menu__divider" />
              <DropdownMenuLabel className="header-account-menu__section">Editor</DropdownMenuLabel>
              {canEditHomepage ? (
                <>
                  <AccountMenuItem
                    icon={Pencil}
                    label="Edit homepage"
                    description="Headings, journal & heritage video"
                    to="/admin/homepage-edit"
                  />
                  <AccountMenuItem
                    icon={Image}
                    label="Homepage photos"
                    description="Hero, showcase, journal & featured stays"
                    to="/admin/profile/homepage-photos"
                  />
                </>
              ) : null}
              {canEditTrail ? (
                <AccountMenuItem
                  icon={Map}
                  label="Mysore Trail"
                  description="Edit & publish the public itinerary"
                  to="/admin/mysore-trail"
                />
              ) : null}
            </>
          ) : null}

          {isHost ? (
            <>
              <DropdownMenuSeparator className="header-account-menu__divider" />
              <DropdownMenuLabel className="header-account-menu__section">Host</DropdownMenuLabel>
              <AccountMenuItem
                icon={PlusCircle}
                label="Add experience"
                description="Create a new listing"
                to="/host/experiences/new"
              />
              <AccountMenuItem
                icon={Users}
                label="Escalation details"
                description="Add at least 2 host escalation contacts"
                to="/account/escalation"
                search={{ scope: "host" }}
              />
            </>
          ) : null}

          {isHomestayOwner ? (
            <>
              <DropdownMenuSeparator className="header-account-menu__divider" />
              <DropdownMenuLabel className="header-account-menu__section">Homestay</DropdownMenuLabel>
              <AccountMenuItem
                icon={PlusCircle}
                label="Add property"
                description="List a new stay"
                to="/homestay/properties/new"
              />
              <AccountMenuItem
                icon={Users}
                label="Escalation details"
                description="Add at least 2 homestay escalation contacts"
                to="/account/escalation"
                search={{ scope: "homestay_owner" }}
              />
            </>
          ) : null}

          {roles.includes("vip_owner") || role === "vip_owner" ? (
            <>
              <DropdownMenuSeparator className="header-account-menu__divider" />
              <DropdownMenuLabel className="header-account-menu__section">VIP</DropdownMenuLabel>
              <AccountMenuItem
                icon={Users}
                label="Escalation details"
                description="Add at least 2 VIP escalation contacts"
                to="/account/escalation"
                search={{ scope: "vip_owner" }}
              />
            </>
          ) : null}

          <DropdownMenuSeparator className="header-account-menu__divider" />
          <DropdownMenuLabel className="header-account-menu__section">Account</DropdownMenuLabel>
          {isAdmin ? (
            <>
              <AccountMenuItem
                icon={UserCircle}
                label="Admin"
                description="Your admin profile & settings"
                to="/admin/profile"
              />
              <AccountMenuItem
                icon={Users}
                label="Users"
                description="Create Experiences, Homestay & VIP logins"
                to="/admin/profile/users"
              />
              <AccountMenuItem
                icon={UserCog}
                label="My team"
                description="Create dashboard logins for Admin, Editor, Experiences, Homestay & VIP"
                to="/admin/profile/my-team"
              />
              <AccountMenuItem
                icon={Image}
                label="Homepage photos"
                description="Manage homepage imagery"
                to="/admin/profile/homepage-photos"
              />
              <AccountMenuItem
                icon={Users}
                label="Escalation"
                description="View Host, Homestay & VIP escalation contacts"
                to="/admin/profile/escalation"
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
