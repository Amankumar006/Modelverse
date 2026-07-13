export default function ModalityTag({ modality }: { modality: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white/[0.06] text-white/60 border border-white/[0.08]">
      {modality}
    </span>
  );
}
