/**
 * JsonLd — renders a <script type="application/ld+json"> block.
 * Standard Next.js / React structured data component.
 *
 * The payload often contains AI-generated copy (model descriptions, article
 * headlines). JSON.stringify output is escaped so a `</script>` sequence (or
 * a U+2028/U+2029 line separator, which JS treats as a terminator) inside any
 * string value cannot break out of the script element into live DOM.
 * The uXXXX escapes are valid JSON, so parsers see identical data.
 *
 * The separator regexes are built from code points instead of written as
 * escapes so this file stays plain ASCII end to end.
 */
const LINE_SEPARATOR = new RegExp(String.fromCharCode(0x2028), "g");
const PARAGRAPH_SEPARATOR = new RegExp(String.fromCharCode(0x2029), "g");

export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data)
          .replace(/</g, "\\u003c")
          .replace(/>/g, "\\u003e")
          .replace(LINE_SEPARATOR, "\\u2028")
          .replace(PARAGRAPH_SEPARATOR, "\\u2029"),
      }}
    />
  );
}
