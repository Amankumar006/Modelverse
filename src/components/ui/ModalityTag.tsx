export default function ModalityTag({ modality }: { modality: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#0b0f19]/5 border border-white/10 text-white/70">
      {modality}
    </span>
  );
}
