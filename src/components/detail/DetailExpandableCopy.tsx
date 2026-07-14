import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { detailSectionLabelClass } from "@/components/detail/DetailPageLayout";
import { cn } from "@/lib/utils";

type DetailExpandableCopyProps = {
  label: string;
  children: string;
  /** Match this height to the main gallery photo on desktop. */
  className?: string;
};

/**
 * About / long copy beside the gallery — clipped to the photo height with Read more.
 */
export function DetailExpandableCopy({ label, children, className = "" }: DetailExpandableCopyProps) {
  const textId = useId();
  const copyRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = copyRef.current;
    if (!el) return;

    const measure = () => {
      if (expanded) return;
      setOverflows(el.scrollHeight > el.clientHeight + 2);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [children, expanded]);

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col",
        !expanded && "max-h-[22rem] md:max-h-none md:h-[min(78vh,720px)]",
        expanded && "md:min-h-[min(78vh,720px)]",
        className,
      )}
    >
      <h2 className={detailSectionLabelClass}>{label}</h2>
      <div className="relative mt-3 min-h-0 flex-1">
        <p
          id={textId}
          ref={copyRef}
          className={cn(
            "text-sm leading-relaxed text-[#D6C8B5]/90 whitespace-pre-line sm:text-[0.9375rem]",
            !expanded && "h-full overflow-hidden",
            !expanded &&
              overflows &&
              "[mask-image:linear-gradient(180deg,#000_70%,transparent)]",
          )}
        >
          {children}
        </p>
      </div>
      {overflows || expanded ? (
        <button
          type="button"
          className="mt-3 self-start text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#D4AF6A] transition-colors hover:text-[#F7F1E8]"
          aria-expanded={expanded}
          aria-controls={textId}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      ) : null}
    </div>
  );
}

export function DetailGalleryAboutRow({
  gallery,
  about,
}: {
  gallery: ReactNode;
  about: ReactNode;
}) {
  return (
    <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:items-stretch md:gap-8 lg:gap-10 sm:mt-8">
      <div className="w-full min-w-0">{gallery}</div>
      <div className="w-full min-w-0 md:min-h-0">{about}</div>
    </div>
  );
}
