"use client";

import { useActionState, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { createAccountAction, updateAccountAction } from "@/app/actions/accounts";

const PLATFORM_SUGGESTIONS = [
  "Discord", "X (Twitter)", "Telegram", "Instagram", "TikTok",
  "Facebook", "Reddit", "LinkedIn", "YouTube", "Snapchat",
  "Pinterest", "Twitch", "GitHub", "Steam", "Spotify",
];

const STATUSES = ["ACTIVE", "INACTIVE", "BANNED", "SUSPENDED"];

interface EmailOption {
  id: string;
  emailAddress: string;
  provider: string;
}

interface AccountData {
  id: string;
  platform: string;
  username: string | null;
  phone: string | null;
  status: string;
  notes: string | null;
  emailId: string;
}

interface Props {
  emails: EmailOption[];
  account?: AccountData;
  defaultEmailId?: string;
  onClose: () => void;
}

const inputCls = "w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors";
const labelCls = "block text-xs mb-1 font-medium";

export default function AccountFormModal({ emails, account, defaultEmailId, onClose }: Props) {
  const action = account ? updateAccountAction : createAccountAction;
  const [state, formAction, pending] = useActionState(action, null);

  const [platform, setPlatform] = useState(account?.platform ?? "");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = platform.length > 0
    ? PLATFORM_SUGGESTIONS.filter(p => p.toLowerCase().includes(platform.toLowerCase()))
    : PLATFORM_SUGGESTIONS;

  useEffect(() => {
    if (state && "success" in state) onClose();
  }, [state, onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl max-h-[90vh] flex flex-col animate-bounce-in">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h2 className="font-semibold syntax-function">
            {account ? "Edit Akun" : "Tambah Akun Sosmed"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
        </div>

        {/* Form — scrollable */}
        <form action={formAction} className="p-6 space-y-4 overflow-y-auto">
          {account && <input type="hidden" name="id" value={account.id} />}

          {/* Email Induk */}
          <div>
            <label className={`${labelCls} syntax-string`}>Email Induk *</label>
            {account ? (
              <input type="hidden" name="emailId" value={account.emailId} />
            ) : (
              <select
                name="emailId"
                required
                defaultValue={defaultEmailId ?? ""}
                className={inputCls}
              >
                <option value="" disabled>Pilih email induk...</option>
                {emails.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.emailAddress} ({e.provider})
                  </option>
                ))}
              </select>
            )}
            {account && (
              <p className="text-xs syntax-string">
                {emails.find(e => e.id === account.emailId)?.emailAddress ?? account.emailId}
              </p>
            )}
          </div>

          {/* Platform dengan autocomplete */}
          <div className="relative">
            <label className={`${labelCls} syntax-keyword`}>Platform *</label>
            <input
              name="platform"
              type="text"
              required
              value={platform}
              onChange={e => { setPlatform(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Discord, Instagram, TikTok..."
              className={inputCls}
            />
            {showSuggestions && filtered.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-lg overflow-hidden shadow-xl max-h-48 overflow-y-auto">
                {filtered.map(p => (
                  <li key={p}>
                    <button
                      type="button"
                      onMouseDown={() => { setPlatform(p); setShowSuggestions(false); }}
                      className="w-full text-left px-3 py-2 text-sm syntax-keyword hover:bg-muted transition-colors"
                    >
                      {p}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`${labelCls} syntax-variable`}>Username / Handle</label>
              <input
                name="username"
                type="text"
                defaultValue={account?.username ?? ""}
                placeholder="@username"
                className={inputCls}
              />
            </div>

            <div>
              <label className={`${labelCls} syntax-number`}>Nomor Telepon</label>
              <input
                name="phone"
                type="text"
                defaultValue={account?.phone ?? ""}
                placeholder="+628xxx"
                className={`${inputCls} font-mono`}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground/40 -mt-2">* Username atau nomor telepon wajib diisi salah satu</p>

          <div>
            <label className={`${labelCls} syntax-keyword`}>
              Password{" "}
              {account && <span className="text-muted-foreground/40 font-normal">(kosongkan jika tidak diubah)</span>}
            </label>
            <input
              name="password"
              type="password"
              required={!account}
              placeholder={account ? "Biarkan kosong jika tidak diubah" : "Password akun"}
              className={inputCls}
            />
          </div>

          <div>
            <label className={`${labelCls} syntax-function`}>
              Auth Token <span className="text-muted-foreground/40 font-normal">(opsional)</span>
            </label>
            <input
              name="token"
              type="password"
              placeholder="Session token / auth token"
              className={`${inputCls} font-mono`}
            />
          </div>

          <div>
            <label className={`${labelCls} syntax-function`}>
              TOTP Seed <span className="text-muted-foreground/40 font-normal">(Google Authenticator secret, opsional)</span>
            </label>
            <input
              name="totpSeed"
              type="password"
              placeholder="JBSWY3DPEHPK3PXP..."
              className={`${inputCls} font-mono`}
            />
          </div>

          {account && (
            <div>
              <label className={`${labelCls} syntax-variable`}>Status</label>
              <select
                name="status"
                defaultValue={account.status}
                className={inputCls}
              >
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className={`${labelCls} syntax-comment`}>
              Notes <span className="text-muted-foreground/40 font-normal">(opsional)</span>
            </label>
            <textarea
              name="notes"
              defaultValue={account?.notes ?? ""}
              rows={2}
              placeholder="Catatan tambahan, misal: banned sementara, dipakai project X..."
              className={`${inputCls} resize-none`}
            />
          </div>

          {state && "error" in state && (
            <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{state.error}</p>
          )}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 bg-muted hover:bg-muted/80 text-foreground/70 rounded-lg text-sm transition-colors">
              Batal
            </button>
            <button type="submit" disabled={pending}
              className="flex-1 py-2 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground font-medium rounded-lg text-sm transition-opacity">
              {pending ? "Menyimpan..." : account ? "Simpan Perubahan" : "Tambah Akun"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
