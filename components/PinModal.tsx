"use client";

import { useActionState, useEffect, useRef } from "react";
import { verifyPinAction } from "@/app/actions/auth";

interface PinModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export default function PinModal({ onSuccess, onClose }: PinModalProps) {
  const [state, action, pending] = useActionState(verifyPinAction, null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (state && "success" in state) {
      onSuccess();
    }
  }, [state, onSuccess]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-xs bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl">
        <h2 className="text-white font-semibold text-center mb-1">Masukkan PIN</h2>
        <p className="text-zinc-400 text-sm text-center mb-5">
          Diperlukan untuk melihat kredensial
        </p>

        <form action={action} className="space-y-4">
          <input
            ref={inputRef}
            name="pin"
            type="password"
            inputMode="numeric"
            maxLength={6}
            required
            placeholder="••••••"
            className="w-full px-3 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 tracking-widest text-center text-xl"
          />

          {state && "error" in state && (
            <p className="text-sm text-red-400 text-center">{state.error}</p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors"
            >
              {pending ? "..." : "Verifikasi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
