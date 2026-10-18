// client/src/components/SectionHeader.tsx
//
// Consistent section heading: title + the red underline accent from the
// design concept, with an optional subtitle. Used by the gremien/baracke/
// sport section components so every block looks intentional and uniform.
//
// Optional: an `icon` in a red round badge left of the title, and
// `inverted` for use on a red band (white title, bar and badge).

import type { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  /** Heading element to render (default h2). */
  as?: "h1" | "h2" | "h3";
  /** Icon shown in a round badge left of the title. */
  icon?: LucideIcon;
  /** White text/accents for a red background (Band `red`). */
  inverted?: boolean;
}

export default function SectionHeader({
  title,
  subtitle,
  as: Tag = "h2",
  icon: Icon,
  inverted,
}: SectionHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3">
        {Icon && (
          <span
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
              inverted ? "bg-white text-asta-red" : "bg-asta-red text-white"
            }`}
            aria-hidden="true"
          >
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div>
          <Tag
            className={`text-2xl md:text-3xl font-bold ${inverted ? "text-white" : ""}`}
          >
            {title}
          </Tag>
          <div
            className={`mt-2 h-1 w-12 rounded ${inverted ? "bg-white" : "bg-asta-red"}`}
          />
        </div>
      </div>
      {subtitle && (
        <p
          className={`mt-3 max-w-prose ${inverted ? "text-white/90" : "text-gray-600"}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
