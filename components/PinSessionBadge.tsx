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
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border ${
      urgent
        ? "bg-amber-950/40 border-amber-800/50 text-amber-400"
        : "bg-emerald-950/40 border-emerald-800/50 text-emerald-400"
    }`}>
      <span className="font-medium">🔓 PIN aktif</span>
      <span className="font-mono tabular-nums">{timeStr}</span>
      <button
        onClick={onClear}
        className="ml-1 opacity-60 hover:opacity-100 transition-opacity text-current"
        title="Kunci sekarang"
      >
        ×
      </button>
    </div>
  );
}
