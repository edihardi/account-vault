"use client";

import { useState, useEffect, useCallback } from "react";
import * as OTPAuth from "otpauth";

interface Props {
  seed: string; // decrypted TOTP secret (base32)
}

const PERIOD = 30; // detik per window TOTP

export default function TotpDisplay({ seed }: Props) {
  const [code, setCode] = useState<string>("------");
  const [secondsLeft, setSecondsLeft] = useState(PERIOD);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  const generate = useCallback(() => {
    try {
      const totp = new OTPAuth.TOTP({
        secret: OTPAuth.Secret.fromBase32(seed.toUpperCase().replace(/\s/g, "")),
        digits: 6,
        period: PERIOD,
        algorithm: "SHA1",
      });
      return totp.generate();
    } catch {
      setError(true);
      return "------";
    }
  }, [seed]);

  useEffect(() => {
    const tick = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = PERIOD - (now % PERIOD);
      setSecondsLeft(remaining);

      // Generate ulang saat window berganti
      if (remaining === PERIOD || remaining === 0) {
        setCode(generate());
      }
    };

    // Generate langsung saat mount
    setCode(generate());
    tick();

    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [generate]);

  async function handleCopy() {
    if (code === "------") return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (error) {
    return (
      <p className="text-xs text-destructive">
        TOTP seed tidak valid — pastikan format base32 benar.
      </p>
    );
  }

  // Progress ring
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const progress = (secondsLeft / PERIOD) * circumference;
  const urgent = secondsLeft <= 5;

  // Format kode: pisah jadi 2 grup 3 digit
  const formatted = code !== "------"
    ? `${code.slice(0, 3)} ${code.slice(3)}`
    : "--- ---";

  return (
    <div className="flex items-center gap-3 bg-muted/30 border border-border rounded-lg px-3 py-2">
      {/* Countdown ring */}
      <div className="relative flex-shrink-0" title={`${secondsLeft}s`}>
        <svg width="28" height="28" className="-rotate-90">
          {/* Track */}
          <circle
            cx="14" cy="14" r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-border"
          />
          {/* Progress */}
          <circle
            cx="14" cy="14" r={radius}
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={`${circumference - progress}`}
            className={`transition-all duration-1000 ${
              urgent ? "stroke-destructive" : "stroke-primary"
            }`}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-[8px] font-bold tabular-nums ${
          urgent ? "text-destructive" : "text-muted-foreground"
        }`}>
          {secondsLeft}
        </span>
      </div>

      {/* Kode TOTP */}
      <span className={`font-mono text-xl font-bold tracking-widest tabular-nums ${
        urgent ? "text-destructive" : "text-foreground"
      }`}>
        {formatted}
      </span>

      {/* Tombol copy */}
      <button
        onClick={handleCopy}
        className="ml-auto text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded hover:bg-muted"
      >
        {copied ? "✓ copied" : "copy"}
      </button>
    </div>
  );
}
