import Script from "next/script";
import { useId } from "react";

/**
 * JsonLd — renders a <script type="application/ld+json"> block.
 * Server component — never injects via client-side JS.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  const id = useId();
  return (
    <Script
      id={`json-ld-${id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
