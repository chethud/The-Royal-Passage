import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

type ClickableStatCardProps = {
  label: string;
  value: string;
  hint?: string;
  to?: string;
  search?: Record<string, string | undefined>;
  surface?: "light" | "dark";
};

export function ClickableStatCard({
  label,
  value,
  hint,
  to,
  search,
  surface = "dark",
}: ClickableStatCardProps) {
  const isLight = surface === "light";

  const body = isLight ? (
    <>
      <p className="dashboard-stat-card__label">{label}</p>
      <p className="dashboard-stat-card__value">{value}</p>
      {hint ? <p className="dashboard-stat-card__hint">{hint}</p> : null}
      {to ? <p className="dashboard-stat-card__cta">View details →</p> : null}
    </>
  ) : (
    <>
      <div className="eyebrow text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl text-[color:var(--soft-champagne)]">{value}</div>
      {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
      {to ? (
        <p className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-[color:var(--antique-gold)]/85">
          View details →
        </p>
      ) : null}
    </>
  );

  const className = isLight
    ? "dashboard-panel-card dashboard-stat-card"
    : "glass-strong block rounded-[var(--radius-lg)] border border-[color:rgba(198,161,91,0.15)] p-5 transition-colors hover:border-[color:rgba(198,161,91,0.4)] hover:bg-[color:rgba(198,161,91,0.04)]";

  if (to) {
    return (
      <Link to={to} search={search} className={className}>
        {body}
      </Link>
    );
  }

  return <article className={className}>{body}</article>;
}

export function StatCardSection({
  title,
  description,
  children,
  surface = "dark",
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  surface?: "light" | "dark";
}) {
  const isLight = surface === "light";

  return (
    <section>
      <h2 className={`font-display text-2xl tracking-[0.02em] ${isLight ? "luxury-panel-heading" : ""}`}>
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-1.5 max-w-2xl text-sm leading-relaxed ${
            isLight ? "text-[rgb(42_0_0/0.62)] normal-case tracking-normal" : "text-muted-foreground"
          }`}
        >
          {description}
        </p>
      ) : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}
