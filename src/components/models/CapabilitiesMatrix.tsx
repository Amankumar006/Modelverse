import React from "react";
import {
  Brain,
  Wrench,
  Eye,
  FileCode2,
  Globe,
  Zap,
  Sliders,
  Sparkles,
  Mic,
  Volume2,
  Monitor,
  Video,
  Layers,
  CheckCircle2,
  MinusCircle,
} from "lucide-react";

interface CapabilitiesMatrixProps {
  capabilities?: Record<string, boolean>;
  modelName: string;
}

interface CapabilityDefinition {
  key: string;
  title: string;
  category: "Core Intelligence" | "Multimodal" | "Developer & System";
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const CAPABILITY_DEFINITIONS: CapabilityDefinition[] = [
  {
    key: "reasoning",
    title: "Deep Reasoning & CoT",
    category: "Core Intelligence",
    description: "Multi-step chain-of-thought and verifiable problem solving",
    icon: Brain,
  },
  {
    key: "tool_calling",
    title: "Tool & Function Calling",
    category: "Developer & System",
    description: "Invokes external APIs, custom tools, and function definitions",
    icon: Wrench,
  },
  {
    key: "vision_input",
    title: "Vision & Image Input",
    category: "Multimodal",
    description: "Native high-resolution visual document, chart, and photo parsing",
    icon: Eye,
  },
  {
    key: "structured_outputs",
    title: "Strict JSON Schema",
    category: "Developer & System",
    description: "Guaranteed JSON schema output compliance and typed payloads",
    icon: FileCode2,
  },
  {
    key: "web_search",
    title: "Web Grounding & Search",
    category: "Core Intelligence",
    description: "Live internet query retrieval and citation verification",
    icon: Globe,
  },
  {
    key: "prompt_caching",
    title: "Prompt Prefix Caching",
    category: "Developer & System",
    description: "Low-latency prompt caching for repeated context prefixes",
    icon: Zap,
  },
  {
    key: "fine_tuning",
    title: "Fine-Tuning & LoRA",
    category: "Developer & System",
    description: "Custom adapter weights, LoRA, and domain fine-tuning support",
    icon: Sliders,
  },
  {
    key: "image_generation",
    title: "Image Synthesis",
    category: "Multimodal",
    description: "Direct raster diffusion / generative visual image rendering",
    icon: Sparkles,
  },
  {
    key: "audio_input",
    title: "Audio & Speech Input",
    category: "Multimodal",
    description: "Direct speech, voice note, and raw audio understanding",
    icon: Mic,
  },
  {
    key: "audio_output",
    title: "Voice & Audio Synthesis",
    category: "Multimodal",
    description: "Real-time streaming text-to-speech and expressive voice output",
    icon: Volume2,
  },
  {
    key: "computer_use",
    title: "Computer & OS Control",
    category: "Core Intelligence",
    description: "Direct desktop GUI control, mouse actions, and OS interaction",
    icon: Monitor,
  },
  {
    key: "video_input",
    title: "Video Stream Processing",
    category: "Multimodal",
    description: "Continuous frame sequence and video timeline ingestion",
    icon: Video,
  },
  {
    key: "batch",
    title: "Batch API Processing",
    category: "Developer & System",
    description: "Asynchronous 50% discount batch queue throughput",
    icon: Layers,
  },
];

export default function CapabilitiesMatrix({
  capabilities = {},
  modelName,
}: CapabilitiesMatrixProps) {
  const supportedCount = Object.values(capabilities).filter(Boolean).length;
  const totalCount = CAPABILITY_DEFINITIONS.length;

  return (
    <section className="space-y-4 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] p-6 border border-[var(--muted)]/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--muted)]/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[var(--text)] tracking-tight">
              Technical Capabilities Matrix
            </h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/20">
              <CheckCircle2 size={12} />
              {supportedCount} / {totalCount} Supported
            </span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1">
            Structured feature flags substantiated by official model cards and provider APIs for {modelName}.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
        {CAPABILITY_DEFINITIONS.map((def) => {
          const isSupported = Boolean(capabilities[def.key]);
          const Icon = def.icon;

          return (
            <div
              key={def.key}
              className={`flex items-start gap-3 p-3 rounded-[12px] border transition-all duration-200 ${
                isSupported
                  ? "bg-[var(--accent-soft)]/10 border-[var(--accent)]/30 shadow-sm"
                  : "bg-[var(--bg)]/40 border-[var(--muted)]/10 opacity-60"
              }`}
            >
              <div
                className={`p-2 rounded-[8px] shrink-0 ${
                  isSupported
                    ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "bg-[var(--muted)]/10 text-[var(--muted)]"
                }`}
              >
                <Icon size={16} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h4
                    className={`text-xs font-semibold truncate ${
                      isSupported ? "text-[var(--text)]" : "text-[var(--muted)]"
                    }`}
                  >
                    {def.title}
                  </h4>
                  {isSupported ? (
                    <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5 shrink-0">
                      <CheckCircle2 size={11} /> YES
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-[var(--muted)]/70 flex items-center gap-0.5 shrink-0">
                      <MinusCircle size={11} /> NO
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[var(--muted)] leading-tight mt-0.5 line-clamp-2">
                  {def.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
