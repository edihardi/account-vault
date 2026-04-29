"use client";

import React, { useState, useCallback, useTransition, useRef } from "react";
import { deleteEmailAction, revealEmailPasswordAction } from "@/app/actions/emails";
import EmailFormModal from "./EmailFormModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import AccountFormModal from "./AccountFormModal";
import StatusBadge from "./StatusBadge";
import SocialAccountRow from "./SocialAccountRow";
import PinModal from "./PinModal";
import PinSessionBadge from "./PinSessionBadge";
import { usePinSession } from "@/lib/hooks/usePinSession";

interface SocialAccount {
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

interface EmailRow {
  id: string;
  emailAddress: string;
  provider: string;
  status: string;
  notes: string | null;
  proxy: string | null;
  socialAccounts: SocialAccount[];
  _count: { socialAccounts: number };
}

interface RevealedEmail {
  password: string;
  recoveryEmail: string | null;
}

interface Props {
  emails: EmailRow[];
}

export default function EmailList({ emails }: Props) {
  const { pinActive, secondsLeft, markPinVerified, clearPin } = usePinSession();

  const [editEmail, setEditEmail] = useState<EmailRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmailRow | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addAccountFor, setAddAccountFor] = useState<EmailRow | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // PIN modal state — ref untuk callback, state hanya untuk show/hide modal
  const pendingCallbackRef = useRef<(() => void) | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);

  // Revealed email passwords: emailId → RevealedEmail
  const [revealedEmails, setRevealedEmails] = useState<Record<string, RevealedEmail>>({});
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const [revealPending, startRevealTransition] = useTransition();

  const handleCloseEdit = useCallback(() => setEditEmail(null), []);
  const handleCloseAdd = useCallback(() => setShowAdd(false), []);
  const handleCloseDelete = useCallback(() => setDeleteTarget(null), []);
  const handleCloseAddAccount = useCallback(() => setAddAccountFor(null), []);

  function toggleExpand(id: string) {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

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
    setRevealedEmails({});
  }

  function fetchEmailPassword(emailId: string) {
    startRevealTransition(async () => {
      const result = await revealEmailPasswordAction(emailId);
      if ("error" in result) {
        if (result.error === "PIN_REQUIRED") {
          handlePinNeeded(() => fetchEmailPassword(emailId));
        }
        return;
      }
      setRevealedEmails(prev => ({ ...prev, [emailId]: result }));
    });
  }

  async function copyToClipboard(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2000);
  }

  const emailOptions = emails.map(e => ({
    id: e.id,
    emailAddress: e.emailAddress,
    provider: e.provider,
  }));

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-foreground font-semibold">Email Accounts</h2>
        <div className="flex items-center gap-2">
          {pinActive && (
            <PinSessionBadge secondsLeft={secondsLeft} onClear={handleClearPin} />
          )}
          <button
            onClick={() => setShowAdd(true)}
            className="px-3 py-1.5 bg-primary hover:opacity-90 text-primary-foreground text-sm rounded-lg transition-opacity"
          >
            + Tambah Email
          </button>
        </div>
      </div>

      {emails.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg mb-2">Belum ada email</p>
          <p className="text-sm">Klik tombol Tambah Email untuk mulai</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="bg-card text-muted-foreground text-xs uppercase tracking-wide border-b border-border">
                <th className="w-8 px-4 py-3" />
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {emails.map(email => {
                const isExpanded = expandedIds.has(email.id);
                const revealed = revealedEmails[email.id];

                return (
                  <React.Fragment key={email.id}>
                    {/* Baris Email Induk */}
                    <tr
                      className="bg-background border-t border-border hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 w-8">
                        <button
                          onClick={() => toggleExpand(email.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors text-xs"
                        >
                          {isExpanded ? "▼" : "▶"}
                        </button>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2">
                          <span className="text-base mt-0.5">📧</span>
                          <div className="min-w-0">
                            <div className="text-foreground font-mono text-xs font-medium">
                              {email.emailAddress}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-muted-foreground text-xs">{email.provider}</span>
                              {email.proxy && (
                                <span className="text-xs text-muted-foreground/60 font-mono">
                                  proxy: {email.proxy.split(":")[0]}:***
                                </span>
                              )}
                              <span className="text-xs text-muted-foreground/60">
                                {email._count.socialAccounts} akun
                              </span>
                            </div>

                            {/* Email password reveal */}
                            <div className="mt-1.5 flex items-center gap-2">
                              {revealed ? (
                                <div className="flex items-center gap-2 group">
                                  <span className="text-xs font-mono text-foreground/80">
                                    {revealed.password}
                                  </span>
                                  <button
                                    onClick={() => copyToClipboard(revealed.password, `pw-${email.id}`)}
                                    className="text-xs text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-all"
                                  >
                                    {copiedLabel === `pw-${email.id}` ? "✓" : "copy"}
                                  </button>
                                  {revealed.recoveryEmail && (
                                    <span className="text-xs text-muted-foreground/60">
                                      recovery: {revealed.recoveryEmail}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <button
                                  onClick={() => fetchEmailPassword(email.id)}
                                  disabled={revealPending}
                                  className="text-xs text-muted-foreground hover:text-primary disabled:opacity-50 transition-colors flex items-center gap-1"
                                >
                                  <span>🔒</span>
                                  <span>Lihat password</span>
                                </button>
                              )}
                            </div>

                            {email.notes && (
                              <div className="text-muted-foreground/60 text-xs mt-0.5 italic truncate max-w-xs">
                                {email.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={email.status} />
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => setAddAccountFor(email)}
                            className="text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded hover:bg-muted"
                          >
                            + Akun
                          </button>
                          <button
                            onClick={() => setEditEmail(email)}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(email)}
                            className="text-xs text-destructive hover:opacity-80 transition-colors px-2 py-1 rounded hover:bg-muted"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Baris Akun Sosmed (nested) */}
                    {isExpanded && (
                      email.socialAccounts.length > 0 ? (
                        email.socialAccounts.map(acc => (
                          <SocialAccountRow
                            key={acc.id}
                            account={acc}
                            emails={emailOptions}
                            pinActive={pinActive}
                            onPinNeeded={handlePinNeeded}
                          />
                        ))
                      ) : (
                        <tr key={`${email.id}-empty`} className="bg-muted/10 border-t border-border/50">
                          <td colSpan={4} className="pl-16 py-3 text-xs text-muted-foreground/60">
                            Belum ada akun sosmed.{" "}
                            <button
                              onClick={() => setAddAccountFor(email)}
                              className="text-primary hover:opacity-80 underline"
                            >
                              Tambah sekarang
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAdd && <EmailFormModal onClose={handleCloseAdd} />}
      {editEmail && <EmailFormModal email={editEmail} onClose={handleCloseEdit} />}
      {deleteTarget && (
        <DeleteConfirmModal
          label={deleteTarget.emailAddress}
          onConfirm={() => deleteEmailAction(deleteTarget.id)}
          onClose={handleCloseDelete}
        />
      )}
      {addAccountFor && (
        <AccountFormModal
          emails={emailOptions}
          defaultEmailId={addAccountFor.id}
          onClose={handleCloseAddAccount}
        />
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
