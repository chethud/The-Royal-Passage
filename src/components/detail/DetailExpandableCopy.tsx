import { useEffect, useId, useRef, useState } from "react";
import { detailSectionLabelClass } from "@/components/detail/DetailPageLayout";
import { cn } from "@/lib/utils";

type DetailExpandableCopyProps = {
  label: string;
  children: string;
  className?: string;
};

/** Long stay/description copy with Read more when the text overflows. */
export function DetailExpandableCopy({ label, children, className = "" }: DetailExpandableCopyProps) {
  const textId = useId();
  const copyRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = copyRef.current;
    if (!el) return;

    const measure = () => {
      if (expanded) {
        setOverflows(true);
        return;
      }
      setOverflows(el.scrollHeight > el.clientHeight + 2);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [children, expanded]);

  return (
    <div className={cn("flex flex-col", className)}>
      <h2 className={detailSectionLabelClass}>{label}</h2>
      <div className="relative mt-1.5">
        <p
          id={textId}
          ref={copyRef}
          className={cn(
            "text-sm leading-snug text-[#D6C8B5]/90 whitespace-pre-line sm:text-[0.9375rem] sm:leading-relaxed",
            !expanded && "line-clamp-6",
            !expanded &&
              overflows &&
              "[mask-image:linear-gradient(180deg,#000_78%,transparent)]",
          )}
        >
          {children}
        </p>
      </div>
      {overflows || expanded ? (
        <button
          type="button"
          className="mt-1.5 self-start text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#D4AF6A] transition-colors hover:text-[#F7F1E8]"
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
