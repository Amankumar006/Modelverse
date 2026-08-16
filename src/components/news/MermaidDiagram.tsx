"use client";

import { useEffect, useState, useId } from "react";
import CodeBlock from "@/components/ui/CodeBlock";

interface MermaidDiagramProps {
  code: string;
}

export default function MermaidDiagram({ code }: MermaidDiagramProps) {
  const [svgHtml, setSvgHtml] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const rawId = useId();
  const diagramId = `mermaid-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useEffect(() => {
    let isMounted = true;

    async function renderDiagram() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
          fontFamily: "var(--font-sans, inherit)",
          themeVariables: {
            darkMode: true,
            background: "#121316",
            primaryColor: "#22252a",
            primaryTextColor: "#ffffff",
            primaryBorderColor: "#3b4252",
            lineColor: "#64b5f6",
            secondaryColor: "#1b1d22",
            tertiaryColor: "#16181d",
          },
        });

        const { svg } = await mermaid.render(diagramId, code.trim());
        if (isMounted) {
          setSvgHtml(svg);
          setHasError(false);
        }
      } catch (err) {
        console.warn("Mermaid rendering failed on client:", err);
        if (isMounted) {
          setHasError(true);
        }
      }
    }

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [code, diagramId]);

  if (hasError) {
    return (
      <div className="my-8">
        <CodeBlock language="mermaid" code={code} />
      </div>
    );
  }

  if (!svgHtml) {
    return (
      <div className="my-8 p-8 flex items-center justify-center rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10">
        <span className="text-xs font-mono text-[var(--muted)] animate-pulse">Rendering architecture diagram...</span>
      </div>
    );
  }

  return (
    <div className="my-8 p-4 sm:p-6 overflow-x-auto rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/15 shadow-[var(--shadow-card)] flex flex-col items-center">
      <div
        className="w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto"
        dangerouslySetInnerHTML={{ __html: svgHtml }}
      />
      <div className="mt-3 text-[11px] font-mono text-[var(--muted)]/60 text-center select-none">
        Architectural Flowchart
      </div>
    </div>
  );
}
