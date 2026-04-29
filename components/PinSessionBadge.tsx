"use client";

interface Props {
  secondsLeft: number;
  onClear: () => void;
}

export default function PinSessionBadge({ secondsLeft, onClear }: Props) {
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;

  // Warna berubah ke kuning saat < 60 detik
  const urgent = secondsLeft < 60;

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] md:text-xs border animate-fade-in ${
      urgent
        ? "bg-amber-950/40 border-amber-800/50 text-amber-400 animate-glow-pulse"
        : "bg-emerald-950/40 border-emerald-800/50 text-emerald-400"
    }`}>
      <span>🔓</span>
      <span className="font-mono tabular-nums">{timeStr}</span>
      <button
        onClick={onClear}
        className="opacity-60 hover:opacity-100 transition-opacity text-current leading-none"
        title="Kunci sekarang"
      >
        ×
      </button>
    </div>
  );
}
