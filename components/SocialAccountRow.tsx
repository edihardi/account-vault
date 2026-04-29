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
}

const PLATFORM_ICONS: Record<string, string> = {
  discord: "🎮", "x (twitter)": "𝕏", telegram: "✈️",
  instagram: "📸", tiktok: "🎵", facebook: "📘",
  reddit: "🤖", github: "🐙", steam: "🕹️",
  youtube: "▶️", twitch: "💜", spotify: "🎧",
};

function getPlatformIcon(p: string) {
  return PLATFORM_ICONS[p.toLowerCase()] ?? "🔑";
}

export default function SocialAccountRow({ account, emails, pinActive, onPinNeeded }: Props) {
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
              <span className="text-xs font-medium text-foreground">{account.platform}</span>
              {account.username && (
                <span className="text-xs text-muted-foreground ml-1.5">@{account.username}</span>
              )}
              {account.phone && (
                <span className="text-xs text-muted-foreground ml-1.5 font-mono">{account.phone}</span>
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
              className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted"
            >
              Edit
            </button>
            <button
              onClick={() => setShowDelete(true)}
              className="text-xs text-destructive hover:opacity-80 transition-colors px-2 py-1 rounded hover:bg-muted"
            >
              Hapus
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
