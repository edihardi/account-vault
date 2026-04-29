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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xs bg-card border border-border rounded-xl p-6 shadow-2xl animate-bounce-in">
        <div className="text-center mb-1">
          <span className="text-3xl animate-float inline-block">🔒</span>
        </div>
        <h2 className="font-semibold text-center mb-1 syntax-function">Masukkan PIN</h2>
        <p className="text-muted-foreground text-sm text-center mb-5">
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
            className="w-full px-3 py-3 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary tracking-widest text-center text-xl transition-colors"
          />

          {state && "error" in state && (
            <p className="text-sm text-destructive text-center animate-fade-in">{state.error}</p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-muted hover:bg-muted/80 text-foreground/70 rounded-lg text-sm transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 py-2.5 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground font-medium rounded-lg text-sm transition-opacity"
            >
              {pending ? "..." : "Verifikasi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
