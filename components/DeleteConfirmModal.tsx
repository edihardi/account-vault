"use client";

import { useTransition } from "react";

interface Props {
  label: string;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
  danger?: boolean;
  confirmText?: string;
  description?: string;
}

export default function DeleteConfirmModal({
  label, onConfirm, onClose, danger = false, confirmText, description,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-card border border-border rounded-xl p-6 shadow-2xl animate-bounce-in">
        <h2 className="font-semibold mb-2 syntax-function">
          {danger ? "⚠️ Hapus Permanen?" : "🗑️ Hapus?"}
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          {description ? (
            <>
              <span className="syntax-string font-mono">{label}</span>{" "}
              — {description}
            </>
          ) : (
            <>
              <span className="syntax-string font-mono">{label}</span>{" "}
              {defaultDesc}
            </>
          )}
        </p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-muted hover:bg-muted/80 text-foreground/70 rounded-lg text-sm transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={pending}
            className="flex-1 py-2 bg-destructive hover:opacity-80 disabled:opacity-50 text-destructive-foreground font-medium rounded-lg text-sm transition-opacity"
          >
            {pending ? "Menghapus..." : btnText}
          </button>
        </div>
      </div>
    </div>
  );
}
