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

export function renderLegalMarkdown(markdown: string): ReactNode[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const nodes: ReactNode[] = [];
  let index = 0;
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let tableRows: string[][] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const text = paragraph.join(" ").trim();
    if (text) {
      nodes.push(
        <p key={`p-${index++}`} className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          {inlineMarkdown(text)}
        </p>,
      );
    }
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    nodes.push(
      <ul key={`ul-${index++}`} className="list-disc space-y-2 pl-5 text-sm text-muted-foreground sm:text-base">
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
      <div key={`table-${index++}`} className="overflow-x-auto rounded-sm border border-[oklch(0.88_0.08_86_/_0.2)]">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[oklch(0.88_0.08_86_/_0.08)]">
            <tr>
              {header.map((cell, cellIndex) => (
                <th key={cellIndex} className="px-3 py-2 font-medium text-ink">
                  {inlineMarkdown(cell.trim())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t border-[oklch(0.88_0.08_86_/_0.15)]">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-3 py-2 text-muted-foreground">
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
      continue;
    }

    if (trimmed.startsWith("# ")) {
      flushParagraph();
      flushList();
      nodes.push(
        <h1 key={`h1-${index++}`} className="font-display text-3xl tracking-tight text-ink sm:text-4xl">
          {inlineMarkdown(trimmed.slice(2))}
        </h1>,
      );
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph();
      flushList();
      const title = trimmed.slice(3);
      const id = slugifyHeading(title);
      nodes.push(
        <h2
          key={`h2-${index++}`}
          id={id}
          className="scroll-mt-28 pt-6 font-display text-xl tracking-tight text-ink first:pt-0 sm:text-2xl"
        >
          {inlineMarkdown(title)}
        </h2>,
      );
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      const title = trimmed.slice(4);
      const id = slugifyHeading(title);
      nodes.push(
        <h3
          key={`h3-${index++}`}
          id={id}
          className="scroll-mt-28 pt-4 font-display text-lg tracking-tight text-ink sm:text-xl"
        >
          {inlineMarkdown(title)}
        </h3>,
      );
      continue;
    }

    if (trimmed === "---") {
      flushParagraph();
      flushList();
      nodes.push(<hr key={`hr-${index++}`} className="border-[oklch(0.88_0.08_86_/_0.2)]" />);
      continue;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      flushParagraph();
      listItems.push(trimmed.slice(2));
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      flushParagraph();
      flushList();
      listItems.push(trimmed.replace(/^\d+\.\s*/, ""));
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  flushTable();

  return nodes;
}
