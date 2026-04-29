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
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
    setExpandedId(prev => prev === id ? null : id);
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
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-foreground font-semibold hidden md:block mr-auto">Email Accounts</h2>

        <div className="flex items-center gap-2 md:ml-auto">
          {pinActive && (
            <PinSessionBadge secondsLeft={secondsLeft} onClear={handleClearPin} />
          )}
          <button
            onClick={() => setShowAdd(true)}
            className="flex-shrink-0 px-3 py-1.5 bg-primary hover:opacity-90 text-primary-foreground text-xs md:text-sm rounded-lg transition-opacity"
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
        <>
          {/* ── Mobile card view (< md) ───────────────────────────────────── */}
          <div className="md:hidden space-y-2">
            {emails.map((email, i) => {
              const isExpanded = expandedId === email.id;
              const revealed = revealedEmails[email.id];
              return (
                <div key={email.id} className="rounded-xl border border-border overflow-hidden bg-card/40 animate-fade-up" style={{ animationDelay: `${i * 55}ms` }}>
                  {/* Email card header */}
                  <button
                    onClick={() => toggleExpand(email.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left"
                  >
                    <span className="text-sm flex-shrink-0 animate-float">📧</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-mono font-medium syntax-string truncate">
                        {email.emailAddress}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] syntax-type">{email.provider}</span>
                        <span className="text-[10px] syntax-number">
                          {email._count.socialAccounts} akun
                        </span>
                        <StatusBadge status={email.status} />
                      </div>
                    </div>
                    <span className="text-muted-foreground text-[10px] flex-shrink-0">
                      {isExpanded ? "▼" : "▶"}
                    </span>
                  </button>

                  {/* Expanded: password + sosmed */}
                  {isExpanded && (
                    <div className="border-t border-border/50">
                      {/* Email password */}
                      <div className="px-3 py-2 bg-background/30 flex items-center gap-2">
                        {revealed ? (
                          <>
                            <span className="text-[10px] text-muted-foreground w-8 flex-shrink-0">pass</span>
                            <span className="text-[10px] font-mono text-foreground/80 flex-1 break-all">{revealed.password}</span>
                            <button
                              onClick={() => copyToClipboard(revealed.password, `pw-${email.id}`)}
                              className="text-[10px] text-muted-foreground hover:text-primary px-1"
                            >
                              {copiedLabel === `pw-${email.id}` ? "✓" : "copy"}
                            </button>
                            {revealed.recoveryEmail && (
                              <span className="text-[10px] text-muted-foreground/50 truncate max-w-[80px]">
                                rec: {revealed.recoveryEmail}
                              </span>
                            )}
                          </>
                        ) : (
                          <button
                            onClick={() => fetchEmailPassword(email.id)}
                            disabled={revealPending}
                            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary disabled:opacity-50"
                          >
                            <span>🔒</span><span>Lihat password</span>
                          </button>
                        )}
                        {/* Action buttons */}
                        <div className="flex items-center gap-0.5 ml-auto flex-shrink-0">
                          <button
                            onClick={() => setAddAccountFor(email)}
                            className="p-1.5 text-muted-foreground hover:text-primary rounded"
                            title="Tambah Akun"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                          </button>
                          <button
                            onClick={() => setEditEmail(email)}
                            className="p-1.5 text-muted-foreground hover:text-foreground rounded"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button
                            onClick={() => setDeleteTarget(email)}
                            className="p-1.5 text-destructive rounded"
                            title="Hapus"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                          </button>
                        </div>
                      </div>

                      {/* Social accounts */}
                      {email.socialAccounts.length > 0 ? (
                        email.socialAccounts.map(acc => (
                          <SocialAccountRow
                            key={acc.id}
                            account={acc}
                            emails={emailOptions}
                            pinActive={pinActive}
                            onPinNeeded={handlePinNeeded}
                            variant="card"
                          />
                        ))
                      ) : (
                        <div className="px-3 py-2 text-[10px] text-muted-foreground/60">
                          Belum ada akun.{" "}
                          <button onClick={() => setAddAccountFor(email)} className="text-primary underline">
                            Tambah
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Desktop table view (md+) ──────────────────────────────────── */}
          <div className="hidden md:block rounded-xl border border-border overflow-hidden">
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
                {emails.map((email, i) => {
                  const isExpanded = expandedId === email.id;
                  const revealed = revealedEmails[email.id];

                  return (
                    <React.Fragment key={email.id}>
                      {/* Baris Email Induk */}
                      <tr className="bg-background border-t border-border hover:bg-muted/30 transition-colors animate-fade-up" style={{ animationDelay: `${i * 55}ms` }}>
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
                            <span className="text-base mt-0.5 animate-float">📧</span>
                            <div className="min-w-0">
                              <div className="font-mono text-xs font-medium syntax-string">
                                {email.emailAddress}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className="text-xs syntax-type">{email.provider}</span>
                                {email.proxy && (
                                  <span className="text-xs syntax-comment font-mono">
                                    proxy: {email.proxy.split(":")[0]}:***
                                  </span>
                                )}
                                <span className="text-xs syntax-number">
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
                              className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded hover:bg-muted"
                              title="Tambah Akun"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                            </button>
                            <button
                              onClick={() => setEditEmail(email)}
                              className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded hover:bg-muted"
                              title="Edit"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button
                              onClick={() => setDeleteTarget(email)}
                              className="text-destructive hover:opacity-80 transition-colors p-1.5 rounded hover:bg-muted"
                              title="Hapus"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
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
        </>
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
