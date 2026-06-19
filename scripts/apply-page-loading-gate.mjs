import fs from "node:fs";
import path from "node:path";

const root = path.resolve("src/routes");
const marker = 'return <div className="min-h-[50vh] pt-[var(--header-height)]" />;';
const replacement = "return <PageLoadingGate />;";
const importLine = 'import { PageLoadingGate } from "@/components/ui/PageLoadingGate";\n';

for (const file of fs.readdirSync(root)) {
  if (!file.endsWith(".tsx")) continue;
  const filePath = path.join(root, file);
  let content = fs.readFileSync(filePath, "utf8");
  if (!content.includes(marker)) continue;
  content = content.replace(marker, replacement);
  if (!content.includes('from "@/components/ui/PageLoadingGate"')) {
    const lines = content.split("\n");
    let lastImport = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("import ")) lastImport = i;
    }
    if (lastImport >= 0) {
      lines.splice(lastImport + 1, 0, importLine.trimEnd());
      content = lines.join("\n");
    }
  }
  fs.writeFileSync(filePath, content);
  console.log("updated", file);
}
