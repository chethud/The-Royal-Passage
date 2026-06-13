export function ExperienceCardSkeleton() {
  return (
    <div className="flex min-h-[360px] flex-col overflow-hidden rounded-lg border border-[#C8A25A]/12">
      <div className="luxury-shimmer min-h-0 flex-[7] w-full" />
      <div className="flex min-h-0 flex-[3] flex-col justify-between p-3.5">
        <div className="space-y-2">
          <div className="luxury-shimmer h-2.5 w-16 rounded" />
          <div className="luxury-shimmer h-5 w-4/5 rounded" />
        </div>
        <div className="luxury-shimmer h-8 w-28 rounded" />
      </div>
    </div>
  );
}
