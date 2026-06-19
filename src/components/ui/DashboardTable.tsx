import { Link } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";

export type DashboardTableWidth = "sm" | "md" | "lg" | "xl" | "2xl";

const tableMinWidth: Record<DashboardTableWidth, string> = {
  sm: "min-w-[640px]",
  md: "min-w-[720px]",
  lg: "min-w-[800px]",
  xl: "min-w-[900px]",
  "2xl": "min-w-[1100px]",
};

export function dashboardFilterBtnClass(active: boolean) {
  return active ? "luxury-btn-sm luxury-btn-primary" : "luxury-btn-sm luxury-btn-panel-outline";
}

export function DashboardTableSection({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`space-y-4 sm:space-y-5 ${className}`.trim()}>{children}</section>;
}

export function DashboardTableFilters({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

export function DashboardTableEmpty({ children }: { children: ReactNode }) {
  return <p className="luxury-panel-body py-8 text-sm">{children}</p>;
}

export function DashboardTableScroll({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto">{children}</div>;
}

export function DashboardTable({
  children,
  minWidth = "xl",
  className = "",
}: {
  children: ReactNode;
  minWidth?: DashboardTableWidth;
  className?: string;
}) {
  return (
    <table
      className={`w-full ${tableMinWidth[minWidth]} text-left text-sm ${className}`.trim()}
    >
      {children}
    </table>
  );
}

export function DashboardTableHead({ children }: { children: ReactNode }) {
  return <thead>{children}</thead>;
}

export function DashboardTableHeadRow({ children }: { children: ReactNode }) {
  return (
    <tr className="border-b text-xs uppercase tracking-[0.14em] luxury-panel-divider luxury-panel-label">
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
  return <th className={`px-3 py-2.5 font-normal ${className}`.trim()}>{children}</th>;
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
    <tr className={`border-b border-[rgb(74_0_0/0.12)] last:border-0 ${className}`.trim()}>
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
    <td className={`px-3 py-3 align-top ${cellVariantClass[variant]} ${className}`.trim()}>
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
    <DashboardTableCell className={className}>
      <Link
        to={to}
        params={params}
        className="luxury-panel-link block hover:underline"
      >
        <div className="luxury-panel-heading">{title}</div>
        {subtitle ? <div className="luxury-panel-body text-xs">{subtitle}</div> : null}
      </Link>
    </DashboardTableCell>
  );
}
