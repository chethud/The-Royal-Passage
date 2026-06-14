import type { LucideIcon } from "lucide-react";
import {
  Landmark,
  Leaf,
  Moon,
  Mountain,
  Palette,
  Sparkles,
  Trees,
  UtensilsCrossed,
  Wheat,
} from "lucide-react";

/** Maps experience category labels to a premium filter/card icon. */
export function categoryIconForLabel(label: string): LucideIcon {
  const key = label.toLowerCase();
  if (key.includes("art") || key.includes("craft")) return Palette;
  if (
    key.includes("culinary") ||
    key.includes("food") ||
    key.includes("dining") ||
    key.includes("tasting")
  ) {
    return UtensilsCrossed;
  }
  if (key.includes("wellness") || key.includes("healing")) return Leaf;
  if (key.includes("outdoor") || key.includes("nature") || key.includes("voyage")) return Trees;
  if (key.includes("heritage") || key.includes("cultural")) return Landmark;
  if (key.includes("rural") || key.includes("farm")) return Wheat;
  if (key.includes("luxury") || key.includes("premium") || key.includes("drive")) return Sparkles;
  if (key.includes("detox") || key.includes("slow")) return Moon;
  if (key.includes("mountain")) return Mountain;
  return Landmark;
}

/** Shorter labels for narrow filter rows where needed. */
export function shortCategoryLabel(label: string): string {
  if (label === "All categories") return "All";
  if (label.length <= 18) return label;
  return label.replace(" & ", " · ");
}
