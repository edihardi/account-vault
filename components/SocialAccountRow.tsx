"use client";

import { useState, useCallback, useTransition, useEffect } from "react";
import { deleteAccountAction, revealCredentialsAction } from "@/app/actions/accounts";
import StatusBadge from "./StatusBadge";
import AccountFormModal from "./AccountFormModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import ExtraDataView from "./ExtraDataView";
import TotpDisplay from "./TotpDisplay";

interface EmailOption {
  id: string;
  emailAddress: string;
  provider: string;
}

interface AccountRow {
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

interface RevealedData {
  password: string | null;
  token: string | null;
  totpSeed: string | null;
  extraData: string | null;
}

interface Props {
  account: AccountRow;
  emails: EmailOption[];
  pinActive: boolean;
  onPinNeeded: (callbackAfterPin: () => void) => void;
  variant?: "table" | "card";
}

const PLATFORM_ICONS: Record<string, string> = {
  discord: "🎮", "x (twitter)": "𝕏", telegram: "✈️",
  instagram: "📸", tiktok: "🎵", facebook: "📘",
  reddit: "🤖", github: "🐙", steam: "🕹️",
  youtube: "▶️", twitch: "💜", spotify: "🎧",
  bybit: "🪙", stockbit: "📈",
};

function getPlatformIcon(p: string) {
  return PLATFORM_ICONS[p.toLowerCase()] ?? "🔑";
}

export default function SocialAccountRow({ account, emails, pinActive, onPinNeeded, variant = "table" }: Props) {
  const altAddress = account.emailAlias;
  const [expanded, setExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [revealed, setRevealed] = useState<RevealedData | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCloseEdit = useCallback(() => setShowEdit(false), []);
  const handleCloseDelete = useCallback(() => setShowDelete(false), []);

  // Auto-hide saat PIN session expire
  useEffect(() => {
    if (!pinActive && revealed) {
      setRevealed(null);
    }
  }, [pinActive, revealed]);

  function fetchReveal() {
    startTransition(async () => {
      const result = await revealCredentialsAction(account.id);
      if ("error" in result) {
        if (result.error === "PIN_REQUIRED") {
          onPinNeeded(() => fetchReveal());
        }
        return;
      }
      setRevealed(result);
      if (!expanded) setExpanded(true);
    });
  }

  async function copyToClipboard(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  const hasCredentials = !!(account.password || account.token || account.totpSeed || account.extraData);

  // ── Card variant (mobile) ──────────────────────────────────────────────────
  if (variant === "card") {
    return (
      <>
        <div className="flex items-center gap-2 pl-5 pr-3 py-2 border-t border-border/30 bg-card/30">
          <span className="text-sm flex-shrink-0">{getPlatformIcon(account.platform)}</span>
          <div className="flex-1 min-w-0">
            <div>
              <span className="text-[11px] font-medium syntax-keyword">{account.platform}</span>
              {account.username && (
                <span className="text-[11px] syntax-variable ml-1.5">@{account.username}</span>
              )}
            </div>
            {altAddress && (
              <div className="text-[10px] font-mono text-muted-foreground/40">{altAddress}</div>
            )}
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {hasCredentials && (
              <button
                onClick={fetchReveal}
                disabled={isPending}
                className="text-[11px] p-1.5 text-muted-foreground hover:text-primary disabled:opacity-50 rounded"
              >
                {isPending ? "…" : revealed ? "🔓" : "🔒"}
              </button>
            )}
            <button
              onClick={() => setShowEdit(true)}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded"
              title="Edit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="p-1.5 text-destructive rounded"
              title="Hapus"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          </div>
        </div>

        {/* Credential detail (card) */}
        {expanded && revealed && (
          <div className="pl-10 pr-3 pb-2.5 pt-1 bg-background/20 border-t border-border/20 space-y-1.5">
            {revealed.password && (
              <MobileCredField label="pass" value={revealed.password} copied={copied} onCopy={copyToClipboard} />
            )}
            {revealed.token && (
              <MobileCredField label="token" value={revealed.token} copied={copied} onCopy={copyToClipboard} />
            )}
            {revealed.totpSeed && <TotpDisplay seed={revealed.totpSeed} />}
            {revealed.extraData && <ExtraDataView raw={revealed.extraData} />}
            {!revealed.password && !revealed.token && !revealed.totpSeed && !revealed.extraData && (
              <p className="text-[10px] text-muted-foreground/60">Tidak ada credential tersimpan.</p>
            )}
          </div>
        )}

        {showEdit && <AccountFormModal emails={emails} account={account} onClose={handleCloseEdit} />}
        {showDelete && (
          <DeleteConfirmModal
            label={`${account.platform} — ${account.username ?? account.phone}`}
            onConfirm={() => deleteAccountAction(account.id)}
            onClose={handleCloseDelete}
          />
        )}
      </>
    );
  }

  // ── Table variant (desktop) ────────────────────────────────────────────────
  return (
    <>
      {/* Baris utama */}
      <tr className="bg-card/40 hover:bg-muted/20 transition-colors border-t border-border/50">
        <td className="pl-10 pr-2 py-2.5">
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-muted-foreground hover:text-foreground transition-colors text-xs w-4"
          >
            {expanded ? "▼" : "▶"}
          </button>
        </td>
        <td className="px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span>{getPlatformIcon(account.platform)}</span>
            <div>
              <div>
                <span className="text-xs font-medium syntax-keyword">{account.platform}</span>
                {account.username && (
                  <span className="text-xs syntax-variable ml-1.5">@{account.username}</span>
                )}
              </div>
              {altAddress && (
                <div className="text-[10px] font-mono text-muted-foreground/40">{altAddress}</div>
              )}
            </div>
          </div>
        </td>
        <td className="px-4 py-2.5">
          <StatusBadge status={account.status} />
        </td>
        <td className="px-4 py-2.5">
          <div className="flex gap-1 items-center justify-end">
            {hasCredentials && (
              <button
                onClick={fetchReveal}
                disabled={isPending}
                className="text-xs text-muted-foreground hover:text-primary disabled:opacity-50 transition-colors px-2 py-1 rounded hover:bg-muted"
                title={revealed ? "Sudah terbuka" : "Reveal credential"}
              >
                {isPending ? "..." : revealed ? "🔓" : "🔒"}
              </button>
            )}
            <button
              onClick={() => setShowEdit(true)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded hover:bg-muted"
              title="Edit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="text-destructive hover:opacity-80 transition-colors p-1.5 rounded hover:bg-muted"
              title="Hapus"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          </div>
        </td>
      </tr>

      {/* Detail expanded */}
      {expanded && (
        <tr className="bg-background/30">
          <td colSpan={4} className="pl-16 pr-6 pb-3 pt-1">
            <div className="space-y-2">
              {revealed ? (
                <div className="space-y-2">
                  {revealed.password && (
                    <CredentialField label="Password" value={revealed.password}
                      copied={copied} onCopy={copyToClipboard} />
                  )}
                  {revealed.token && (
                    <CredentialField label="Token" value={revealed.token}
                      copied={copied} onCopy={copyToClipboard} />
                  )}
                  {revealed.totpSeed && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">TOTP / 2FA</p>
                      <TotpDisplay seed={revealed.totpSeed} />
                    </div>
                  )}
                  {revealed.extraData && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Extra Data</p>
                      <ExtraDataView raw={revealed.extraData} />
                    </div>
                  )}
                  {!revealed.password && !revealed.token && !revealed.totpSeed && !revealed.extraData && (
                    <p className="text-xs text-muted-foreground/60">Tidak ada credential tersimpan.</p>
                  )}
                </div>
              ) : hasCredentials ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground/60">Credential tersembunyi.</span>
                  <button onClick={fetchReveal} disabled={isPending}
                    className="text-xs text-primary hover:opacity-80 underline disabled:opacity-50">
                    {isPending ? "Loading..." : "Klik untuk reveal"}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground/60">Tidak ada credential tersimpan.</p>
              )}
              {account.notes && (
                <p className="text-xs text-muted-foreground/60 italic border-t border-border/50 pt-2 mt-2">
                  {account.notes}
                </p>
              )}
            </div>
          </td>
        </tr>
      )}

      {showEdit && (
        <AccountFormModal emails={emails} account={account} onClose={handleCloseEdit} />
      )}
      {showDelete && (
        <DeleteConfirmModal
          label={`${account.platform} — ${account.username ?? account.phone}`}
          onConfirm={() => deleteAccountAction(account.id)}
          onClose={handleCloseDelete}
        />
      )}
    </>
  );
}

function CredentialField({ label, value, copied, onCopy }: {
  label: string; value: string;
  copied: string | null; onCopy: (v: string, l: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex items-center gap-2 group">
      <span className="text-xs text-muted-foreground w-16 flex-shrink-0">{label}</span>
      <span className="text-xs font-mono text-foreground/80 flex-1 break-all">
        {visible ? value : "••••••••••••"}
      </span>
      <button onClick={() => setVisible(v => !v)}
        className="text-xs text-muted-foreground/60 hover:text-foreground opacity-0 group-hover:opacity-100 transition-all px-1">
        {visible ? "hide" : "show"}
      </button>
      <button onClick={() => onCopy(value, label)}
        className="text-xs text-muted-foreground/60 hover:text-primary opacity-0 group-hover:opacity-100 transition-all px-1">
        {copied === label ? "✓" : "copy"}
      </button>
    </div>
  );
}

function MobileCredField({ label, value, copied, onCopy }: {
  label: string; value: string;
  copied: string | null; onCopy: (v: string, l: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground w-10 flex-shrink-0">{label}</span>
      <span className="text-[10px] font-mono text-foreground/80 flex-1 break-all">
        {visible ? value : "••••••••••••"}
      </span>
      <button onClick={() => setVisible(v => !v)}
        className="text-[10px] text-muted-foreground/60 hover:text-foreground transition-colors px-1">
        {visible ? "hide" : "show"}
      </button>
      <button onClick={() => onCopy(value, label)}
        className="text-[10px] text-muted-foreground/60 hover:text-primary transition-colors px-1">
        {copied === label ? "✓" : "copy"}
      </button>
    </div>
  );
}
