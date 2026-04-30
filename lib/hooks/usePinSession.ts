"use client";

import { useState, useEffect, useCallback } from "react";

const PIN_TTL_MS = 1 * 60 * 1000; // 1 menit

/**
 * Tracks client-side PIN session state.
 * - `pinActive`: apakah PIN masih valid
 * - `secondsLeft`: sisa waktu dalam detik
 * - `markPinVerified`: panggil setelah PIN sukses diverifikasi server
 * - `clearPin`: reset manual
 */
export function usePinSession() {
  const [verifiedAt, setVerifiedAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const markPinVerified = useCallback(() => {
    setVerifiedAt(Date.now());
    setSecondsLeft(Math.ceil(PIN_TTL_MS / 1000));
  }, []);

  const clearPin = useCallback(() => {
    setVerifiedAt(null);
    setSecondsLeft(0);
  }, []);

  useEffect(() => {
    if (verifiedAt === null) return;

    const tick = () => {
      const elapsed = Date.now() - verifiedAt;
      const remaining = PIN_TTL_MS - elapsed;
      if (remaining <= 0) {
        setVerifiedAt(null);
        setSecondsLeft(0);
      } else {
        setSecondsLeft(Math.ceil(remaining / 1000));
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [verifiedAt]);

  return {
    pinActive: verifiedAt !== null && secondsLeft > 0,
    secondsLeft,
    markPinVerified,
    clearPin,
  };
}
