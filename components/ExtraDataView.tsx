"use client";

interface Props {
  raw: string; // decrypted JSON string atau plain string
}

export default function ExtraDataView({ raw }: Props) {
  let parsed: Record<string, string> | null = null;

  try {
    const obj = JSON.parse(raw);
    if (typeof obj === "object" && obj !== null && !Array.isArray(obj)) {
      parsed = obj as Record<string, string>;
    }
  } catch {
    // bukan JSON — tampilkan as-is
  }

  if (parsed) {
    return (
      <div className="mt-2 rounded-lg border border-zinc-700 overflow-hidden text-xs">
        {Object.entries(parsed).map(([key, val], i) => (
          <div
            key={key}
            className={`flex gap-2 px-3 py-1.5 ${i % 2 === 0 ? "bg-zinc-800/60" : "bg-zinc-800/30"}`}
          >
            <span className="text-zinc-400 font-mono min-w-[80px] flex-shrink-0">{key}</span>
            <span className="text-zinc-200 font-mono break-all">{String(val)}</span>
          </div>
        ))}
      </div>
    );
  }

  // plain string fallback
  return (
    <p className="mt-2 text-xs text-zinc-300 font-mono bg-zinc-800/50 rounded-lg px-3 py-1.5 break-all">
      {raw}
    </p>
  );
}
