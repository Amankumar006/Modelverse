/**
 * JsonLd — renders a <script type="application/ld+json"> block.
 * Server component — never injects via client-side JS.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
