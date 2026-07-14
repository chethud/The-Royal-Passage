import type { ShowcaseExperienceOption } from "@/lib/showcase-from-experience";

type ShowcaseExperiencePickerProps = {
  experiences: ShowcaseExperienceOption[];
  currentHref: string;
  disabled?: boolean;
  onSelect: (experience: ShowcaseExperienceOption) => void;
};

export function ShowcaseExperiencePicker({
  experiences,
  currentHref,
  disabled = false,
  onSelect,
}: ShowcaseExperiencePickerProps) {
  const selectedSlug = currentHref.match(/^\/experiences\/([^/?#]+)/)?.[1] ?? "";
  const selectedId =
    experiences.find((exp) => exp.slug === selectedSlug)?.id ?? "";

  if (experiences.length === 0) {
    return (
      <p className="text-[0.68rem] text-ink/60">
        No published host experiences available yet.
      </p>
    );
  }

  const sorted = [...experiences].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <label className="block space-y-1">
      <span className="text-[0.62rem] uppercase tracking-[0.14em] text-ink/70">
        Host experience
      </span>
      <select
        value={selectedId}
        disabled={disabled}
        onChange={(event) => {
          const next = experiences.find((exp) => exp.id === event.target.value);
          if (next) onSelect(next);
        }}
        className="w-full rounded-sm border border-[oklch(0.88_0.08_86_/_0.25)] bg-background/80 px-2 py-1.5 text-xs text-ink disabled:opacity-50"
      >
        <option value="">Choose a hosted experience…</option>
        {sorted.map((exp) => (
          <option key={exp.id} value={exp.id}>
            {exp.title}
            {exp.hostName ? ` — ${exp.hostName}` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
