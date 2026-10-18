// client/src/components/RichText.tsx
//
// Renders stored rich-text HTML (produced by the admin RichTextEditor) on the
// public pages. The HTML is sanitized server-side on every write, so it is
// safe to render with dangerouslySetInnerHTML here. Tailwind Typography's
// `prose` classes give headings/lists/links sensible spacing; brand-red links
// match the rest of the site. Headings (h2/h3 from the editor toolbar) and
// list bullets are brand red so structured texts get some colour.

interface RichTextProps {
  /** Sanitized HTML string from the server. */
  html: string;
  /** Extra classes for the wrapper (e.g. width, spacing, `prose-sm`). */
  className?: string;
}

export default function RichText({ html, className }: RichTextProps) {
  return (
    <div
      className={`prose prose-neutral max-w-none text-gray-700 prose-a:text-asta-red prose-headings:text-gray-900 prose-h2:text-asta-red prose-h3:text-asta-red prose-strong:text-gray-900 [--tw-prose-bullets:var(--color-asta-red)] [--tw-prose-counters:var(--color-asta-red)] ${
        className ?? ""
      }`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
