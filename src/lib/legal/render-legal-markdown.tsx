import type { ReactNode } from "react";

function inlineMarkdown(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      return (
        <a key={index} href={href} className="text-ember underline-offset-4 hover:underline">
          {label}
        </a>
      );
    }
    return part;
  });
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/^\d+\.\s*/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function legalSectionId(text: string): string {
  const sectionMatch = text.match(/^([A-Z])(\d+)\./i);
  if (sectionMatch) return `section-${sectionMatch[1].toLowerCase()}${sectionMatch[2]}`;
  const letterMatch = text.match(/^([A-Z])\.\s/i);
  if (letterMatch) return `section-${letterMatch[1].toLowerCase()}`;
  return slugifyHeading(text);
}

export function renderLegalMarkdown(markdown: string): ReactNode[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const nodes: ReactNode[] = [];
  let index = 0;
  let h1Count = 0;
  let inTableOfContents = false;
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let tocItems: string[] = [];
  let tableRows: string[][] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const text = paragraph.join(" ").trim();
    if (text) {
      nodes.push(
        <p
          key={`p-${index++}`}
          className="text-left text-sm leading-relaxed text-muted-foreground sm:text-base"
        >
          {inlineMarkdown(text)}
        </p>,
      );
    }
    paragraph = [];
  };

  const flushToc = () => {
    if (!tocItems.length) return;
    nodes.push(
      <div
        key={`toc-${index++}`}
        className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3"
      >
        {tocItems.map((item, itemIndex) => {
          const id = legalSectionId(item);
          return (
            <a
              key={itemIndex}
              href={`#${id}`}
              onClick={(event) => {
                event.preventDefault();
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                window.history.replaceState(null, "", `#${id}`);
              }}
              className="text-left text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-ember hover:underline"
            >
              {inlineMarkdown(item)}
            </a>
          );
        })}
      </div>,
    );
    tocItems = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    nodes.push(
      <ul
        key={`ul-${index++}`}
        className="list-disc space-y-2 pl-5 text-left text-sm text-muted-foreground sm:text-base"
      >
        {listItems.map((item, itemIndex) => (
          <li key={itemIndex}>{inlineMarkdown(item)}</li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  const flushTable = () => {
    if (tableRows.length < 2) {
      tableRows = [];
      return;
    }
    const [header, ...body] = tableRows;
    nodes.push(
      <div
        key={`table-${index++}`}
        className="w-full overflow-x-auto rounded-sm border border-[oklch(0.88_0.08_86_/_0.2)]"
      >
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-[oklch(0.88_0.08_86_/_0.08)]">
            <tr>
              {header.map((cell, cellIndex) => (
                <th key={cellIndex} className="px-4 py-3 font-medium text-ink">
                  {inlineMarkdown(cell.trim())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t border-[oklch(0.88_0.08_86_/_0.15)]">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3 text-muted-foreground">
                    {inlineMarkdown(cell.trim())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
    );
    tableRows = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("|")) {
      flushParagraph();
      flushList();
      flushToc();
      const cells = trimmed
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim());
      if (cells.every((cell) => /^-+$/.test(cell.replace(/:/g, "")))) {
        continue;
      }
      tableRows.push(cells);
      continue;
    }

    if (tableRows.length) {
      flushTable();
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      flushToc();
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushParagraph();
      flushList();
      flushToc();
      h1Count += 1;
      const title = trimmed.slice(2);
      if (title.trim().toLowerCase() === "table of contents") {
        inTableOfContents = true;
      }
      const h1Class =
        h1Count === 1
          ? "text-left font-display text-xs tracking-[0.28em] uppercase text-ember sm:text-sm"
          : h1Count === 2
            ? "text-left font-display text-3xl tracking-tight text-ink sm:text-4xl lg:text-[2.75rem]"
            : "scroll-mt-28 pt-2 text-left font-display text-2xl tracking-tight text-ink sm:text-3xl";
      nodes.push(
        <h1 key={`h1-${index++}`} className={h1Class}>
          {inlineMarkdown(title)}
        </h1>,
      );
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      flushToc();
      const title = trimmed.slice(3);
      const id = inTableOfContents ? undefined : legalSectionId(title);
      nodes.push(
        <h2
          key={`h2-${index++}`}
          {...(id ? { id } : {})}
          className="scroll-mt-28 border-t border-[oklch(0.88_0.08_86_/_0.12)] pt-8 text-left font-display text-xl tracking-tight text-ink first:border-t-0 first:pt-0 sm:text-2xl"
        >
          {inlineMarkdown(title)}
        </h2>,
      );
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      flushToc();
      const title = trimmed.slice(4);
      const id = inTableOfContents ? undefined : slugifyHeading(title);
      nodes.push(
        <h3
          key={`h3-${index++}`}
          {...(id ? { id } : {})}
          className="scroll-mt-28 pt-4 text-left font-display text-lg tracking-tight text-ink sm:text-xl"
        >
          {inlineMarkdown(title)}
        </h3>,
      );
      continue;
    }

    if (trimmed === "---") {
      flushParagraph();
      flushList();
      flushToc();
      if (inTableOfContents) {
        inTableOfContents = false;
      }
      nodes.push(<hr key={`hr-${index++}`} className="border-[oklch(0.88_0.08_86_/_0.2)]" />);
      continue;
    }

    if (/^[A-Z](\d+\.)?\s/.test(trimmed)) {
      flushParagraph();
      flushList();
      tocItems.push(trimmed);
      continue;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      flushParagraph();
      flushToc();
      listItems.push(trimmed.slice(2));
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      flushParagraph();
      flushList();
      flushToc();
      listItems.push(trimmed.replace(/^\d+\.\s*/, ""));
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  flushToc();
  flushTable();

  return nodes;
}
