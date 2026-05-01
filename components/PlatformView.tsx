"use client";

import { useState, useRef, useTransition, useEffect, useCallback } from "react";
import { usePinSession } from "@/lib/hooks/usePinSession";
import { revealCredentialsAction } from "@/app/actions/accounts";
import PinModal from "./PinModal";
import PinSessionBadge from "./PinSessionBadge";
import StatusBadge from "./StatusBadge";
import Pagination from "./Pagination";

const PAGE_SIZE = 10;

interface SocialAccount {
  id: string;
  platform: string;
  username: string | null;
  phone: string | null;
  status: string;
  notes: string | null;
  emailAlias: string | null;
  emailId: string;
  password: string | null;
  token: string | null;
  totpSeed: string | null;
  extraData: string | null;
}

interface EmailRow {
  id: string;
  emailAddress: string;
  provider: string;
  status: string;
  notes: string | null;
  proxy: string | null;
  socialAccounts: SocialAccount[];
}

interface FlatAccount {
  account: SocialAccount;
  emailAddress: string;
}

interface RevealedData {
  password: string | null;
  token: string | null;
}

interface Props {
  emails: EmailRow[];
  platform: string;
}

export default function PlatformView({ emails, platform }: Props) {
  const { pinActive, secondsLeft, markPinVerified, clearPin } = usePinSession();

  const pendingCallbackRef = useRef<(() => void) | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [revealedMap, setRevealedMap] = useState<Record<string, RevealedData>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Auto-hide saat PIN expire
  useEffect(() => {
    if (!pinActive) setRevealedMap({});
  }, [pinActive]);

  // Flatten: kumpulkan semua akun dari platform yang difilter
  const flatAccounts: FlatAccount[] = [];
  for (const email of emails) {
    for (const acc of email.socialAccounts) {
      if (acc.platform.toLowerCase() === platform) {
        flatAccounts.push({ account: acc, emailAddress: email.emailAddress });
      }
    }
  }

  const totalPages = Math.max(1, Math.ceil(flatAccounts.length / PAGE_SIZE));
  const paginated = flatAccounts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [platform]);

  function handlePinNeeded(cb: () => void) {
    pendingCallbackRef.current = cb;
    setShowPinModal(true);
  }

  function handlePinSuccess() {
    markPinVerified();
    setShowPinModal(false);
    const cb = pendingCallbackRef.current;
    pendingCallbackRef.current = null;
    cb?.();
  }

  function handleClearPin() {
    clearPin();
    setRevealedMap({});
  }

  const handleRevealDone = useCallback((accountId: string, data: RevealedData) => {
    setRevealedMap(prev => ({ ...prev, [accountId]: data }));
  }, []);

  async function copyToClipboard(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <>
      {/* Header platform view */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <p className="text-xs text-muted-foreground">
          {flatAccounts.length} akun ditemukan untuk platform ini
        </p>
        {pinActive && (
          <PinSessionBadge secondsLeft={secondsLeft} onClear={handleClearPin} />
        )}
      </div>

      {flatAccounts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Tidak ada akun untuk platform ini.
        </div>
      ) : (
        <>
          <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
            {paginated.map(({ account, emailAddress }, i) => {
              const revealed = revealedMap[account.id];
              return (
                <PlatformAccountRow
                  key={account.id}
                  index={i}
                  account={account}
                  emailAddress={emailAddress}
                  revealed={revealed ?? null}
                  copied={copied}
                  pinActive={pinActive}
                  onPinNeeded={handlePinNeeded}
                  onRevealed={handleRevealDone}
                  onCopy={copyToClipboard}
                />
              );
            })}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {showPinModal && (
        <PinModal
          onSuccess={handlePinSuccess}
          onClose={() => { setShowPinModal(false); pendingCallbackRef.current = null; }}
        />
      )}
    </>
  );
}

// ─── Sub-component per baris ─────────────────────────────────────────────────

interface RowProps {
  index: number;
  account: SocialAccount;
  emailAddress: string;
  revealed: RevealedData | null;
  copied: string | null;
  pinActive: boolean;
  onPinNeeded: (cb: () => void) => void;
  onRevealed: (id: string, data: RevealedData) => void;
  onCopy: (value: string, label: string) => void;
}

function PlatformAccountRow({
  index, account, emailAddress, revealed, copied,
  pinActive, onPinNeeded, onRevealed, onCopy,
}: RowProps) {
  const [isPending, startTransition] = useTransition();
  const [pwVisible, setPwVisible] = useState(false);

  // Auto-hide password saat PIN expire
  useEffect(() => {
    if (!pinActive) setPwVisible(false);
  }, [pinActive]);

  function fetchReveal() {
    startTransition(async () => {
      const result = await revealCredentialsAction(account.id);
      if ("error" in result) {
        if (result.error === "PIN_REQUIRED") {
          onPinNeeded(() => fetchReveal());
        }
        return;
      }
      onRevealed(account.id, { password: result.password, token: result.token });
    });
  }

  const hasPassword = !!(account.password);
  const displayName = account.username ?? account.phone ?? "—";
  const altAddress = account.emailAlias;

  return (
    <div className="px-4 py-3 bg-background hover:bg-muted/20 transition-colors animate-fade-up" style={{ animationDelay: `${index * 55}ms` }}>
      {/* Baris atas: username + status */}
      <div className="flex items-center justify-between gap-2 mb-0.5">
        <span className="text-sm font-medium syntax-variable font-mono truncate">
          {displayName}
        </span>
        <StatusBadge status={account.status} />
      </div>

      {/* Email */}
      <p className="text-xs syntax-string font-mono truncate mb-1.5">
        {altAddress ?? emailAddress}
      </p>

      {/* Password */}
      {revealed ? (
        revealed.password ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-foreground/70 flex-1 truncate">
              {pwVisible ? revealed.password : "••••••••••••"}
            </span>
            <button
              onClick={() => setPwVisible(v => !v)}
              className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-muted flex-shrink-0"
            >
              {pwVisible ? "hide" : "show"}
            </button>
            <button
              onClick={() => onCopy(revealed.password!, `pw-${account.id}`)}
              className="text-xs text-muted-foreground/60 hover:text-primary transition-colors px-1.5 py-0.5 rounded hover:bg-muted flex-shrink-0"
            >
              {copied === `pw-${account.id}` ? "✓" : "copy"}
            </button>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/40">Tidak ada password</span>
        )
      ) : hasPassword ? (
        <button
          onClick={fetchReveal}
          disabled={isPending}
          className="text-xs text-muted-foreground hover:text-primary disabled:opacity-50 transition-colors flex items-center gap-1"
        >
          <span>🔒</span>
          <span>{isPending ? "..." : "Lihat password"}</span>
        </button>
      ) : (
        <span className="text-xs text-muted-foreground/40">Tidak ada password</span>
      )}
    </div>
  );
}
