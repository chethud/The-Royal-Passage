type DashboardPanelSkeletonProps = {
  rows?: number;
};

/** In-panel loading placeholder for dashboard ivory surfaces. */
export function DashboardPanelSkeleton({ rows = 3 }: DashboardPanelSkeletonProps) {
  return (
    <div className="stack-4" aria-busy="true" aria-label="Loading content">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="luxury-shimmer dashboard-skeleton dashboard-skeleton--row" />
      ))}
    </div>
  );
}
