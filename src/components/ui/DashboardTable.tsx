import { Link } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";

export type DashboardTableWidth = "sm" | "md" | "lg" | "xl" | "2xl" | "none";

const tableMinWidth: Record<DashboardTableWidth, string> = {
  sm: "min-w-[640px]",
  md: "min-w-[720px]",
  lg: "min-w-[800px]",
  xl: "min-w-[900px]",
  "2xl": "min-w-[1100px]",
  none: "",
};

export function dashboardFilterBtnClass(active: boolean) {
  return active ? "luxury-btn-sm luxury-btn-primary" : "luxury-btn-sm dashboard-chrome-btn";
}

/** @deprecated Prefer dashboardFilterBtnClass — kept for older call sites. */
export function dashboardRoyalFilterBtnClass(active: boolean) {
  return dashboardFilterBtnClass(active);
}

export function hostBookingsFilterBtnClass(active: boolean) {
  return `host-bookings-filter-btn ${active ? "is-active" : ""}`;
}

export function DashboardFilterCountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      className="pointer-events-none absolute -right-1.5 -top-1.5 z-[1] inline-flex min-h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full bg-[color:var(--antique-gold)] px-1 text-[0.58rem] font-bold leading-none text-[color:var(--royal-plum)] shadow-[var(--shadow-soft)]"
      aria-label={`${count} guests`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function DashboardTableSection({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`space-y-2.5 sm:space-y-3 ${className}`.trim()}>{children}</section>;
}

export function DashboardTableFilters({
  children,
  orientation = "horizontal",
}: {
  children: ReactNode;
  orientation?: "horizontal" | "vertical";
}) {
  return (
    <div
      className={
        orientation === "vertical"
          ? "flex w-full flex-col items-stretch gap-1.5 sm:gap-2 [&>button]:relative [&>button]:w-full [&>button]:justify-center"
          : "flex flex-wrap gap-1.5 sm:gap-2 [&>button]:relative"
      }
    >
      {children}
    </div>
  );
}

export function DashboardInsetPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[var(--radius-md)] border border-[color:rgba(58,8,15,0.12)] bg-[color:rgba(252,249,243,0.72)] p-3 sm:p-4 ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export function RoyalSplitChamber({
  children,
  title,
  className = "",
  tone = "burgundy",
}: {
  children: ReactNode;
  title?: string;
  className?: string;
  tone?: "burgundy" | "cream";
}) {
  return (
    <div
      className={`royal-split-chamber ${tone === "cream" ? "royal-split-chamber--cream" : ""} p-4 sm:p-5 ${className}`.trim()}
    >
      {title ? <h2 className="royal-split-chamber__title">{title}</h2> : null}
      {children}
    </div>
  );
}

export function DashboardTableEmpty({ children }: { children: ReactNode }) {
  return <p className="luxury-panel-body py-4 text-sm">{children}</p>;
}

export function DashboardTableScroll({
  children,
  scroll = true,
}: {
  children: ReactNode;
  scroll?: boolean;
}) {
  if (!scroll) {
    return <div className="w-full">{children}</div>;
  }
  return (
    <div className="-mx-1 overflow-x-auto overscroll-x-contain px-1 sm:mx-0 sm:px-0">
      {children}
    </div>
  );
}

export function DashboardTable({
  children,
  minWidth = "xl",
  layout = "auto",
  className = "",
}: {
  children: ReactNode;
  minWidth?: DashboardTableWidth;
  layout?: "auto" | "fixed";
  className?: string;
}) {
  const minWidthClass = minWidth === "none" ? "" : tableMinWidth[minWidth];
  const layoutClass = layout === "fixed" ? "table-fixed" : "";
  return (
    <table
      className={`w-full ${minWidthClass} ${layoutClass} text-left text-sm text-[color:var(--royal-charcoal)] ${className}`.trim()}
    >
      {children}
    </table>
  );
}

export function DashboardTableHead({ children }: { children: ReactNode }) {
  return <thead>{children}</thead>;
}

export function DashboardTableHeadRow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <tr
      className={`border-b border-[color:rgba(198,161,91,0.28)] text-xs uppercase tracking-[0.12em] luxury-panel-divider luxury-panel-label ${className}`.trim()}
    >
      {children}
    </tr>
  );
}

export function DashboardTableHeadCell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th className={`px-2.5 py-2 font-sans font-semibold text-[color:var(--royal-burgundy)] ${className}`.trim()}>
      {children}
    </th>
  );
}

export function DashboardTableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function DashboardTableRow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <tr className={`border-b border-[color:rgba(58,8,15,0.1)] last:border-0 ${className}`.trim()}>
      {children}
    </tr>
  );
}

type DashboardTableCellVariant = "default" | "heading" | "money" | "meta";

const cellVariantClass: Record<DashboardTableCellVariant, string> = {
  default: "luxury-panel-body",
  heading: "luxury-panel-heading",
  money: "luxury-panel-heading font-display text-lg",
  meta: "luxury-panel-body text-xs",
};

export function DashboardTableCell({
  children,
  variant = "default",
  className = "",
}: {
  children: ReactNode;
  variant?: DashboardTableCellVariant;
  className?: string;
}) {
  return (
    <td className={`px-2.5 py-2.5 align-top ${cellVariantClass[variant]} ${className}`.trim()}>
      {children}
    </td>
  );
}

type DashboardTableLinkCellProps = {
  to: ComponentProps<typeof Link>["to"];
  params?: ComponentProps<typeof Link>["params"];
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
};

export function DashboardTableLinkCell({
  to,
  params,
  title,
  subtitle,
  className = "",
}: DashboardTableLinkCellProps) {
  return (
    <DashboardTableCell className={`min-w-0 overflow-hidden ${className}`.trim()}>
      <Link
        to={to}
        params={params}
        className="luxury-panel-link block min-w-0 hover:underline"
      >
        <div className="luxury-panel-heading truncate">{title}</div>
        {subtitle ? <div className="luxury-panel-body truncate text-xs">{subtitle}</div> : null}
      </Link>
    </DashboardTableCell>
  );
}
