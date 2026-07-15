export default function ModalityTag({ modality }: { modality: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-black/[0.04] text-black/60 border border-black/[0.08]">
      {modality}
    </span>
  );
}
