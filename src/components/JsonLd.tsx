/**
 * JsonLd — renders a <script type="application/ld+json"> block.
 * Standard Next.js / React structured data component.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
