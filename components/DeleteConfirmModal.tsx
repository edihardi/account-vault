"use client";

import { useTransition } from "react";

interface Props {
  label: string;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
  /** Gunakan wording "hapus permanen" alih-alih "pindah ke trash" */
  danger?: boolean;
  /** Custom teks tombol konfirmasi */
  confirmText?: string;
  /** Custom deskripsi di bawah label */
  description?: string;
}

export default function DeleteConfirmModal({
  label,
  onConfirm,
  onClose,
  danger = false,
  confirmText,
  description,
}: Props) {
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await onConfirm();
      onClose();
    });
  }

  const defaultDesc = danger
    ? "Item ini akan dihapus permanen. Tidak dapat dipulihkan."
    : "akan dipindahkan ke Trash. Data bisa dipulihkan nanti.";

  const btnText = confirmText ?? (danger ? "Hapus Permanen" : "Ya, Hapus");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl">
        <h2 className="text-white font-semibold mb-2">
          {danger ? "Hapus Permanen?" : "Hapus?"}
        </h2>
        <p className="text-zinc-400 text-sm mb-6">
          {description ? (
            <>
              <span className="text-white font-mono">{label}</span>{" "}
              — {description}
            </>
          ) : (
            <>
              <span className="text-white font-mono">{label}</span>{" "}
              {defaultDesc}
            </>
          )}
        </p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={pending}
            className="flex-1 py-2 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors"
          >
            {pending ? "Menghapus..." : btnText}
          </button>
        </div>
      </div>
    </div>
  );
}
