"use client";

import { useActionState, useEffect, useState } from "react";
import { createAccountAction, updateAccountAction } from "@/app/actions/accounts";

// Platform suggestions untuk autocomplete
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 flex-shrink-0">
          <h2 className="text-white font-semibold">
            {account ? "Edit Akun" : "Tambah Akun Sosmed"}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-xl leading-none">×</button>
        </div>

        {/* Form — scrollable */}
        <form action={formAction} className="p-6 space-y-4 overflow-y-auto">
          {account && <input type="hidden" name="id" value={account.id} />}

          {/* Email Induk */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Email Induk *</label>
            {account ? (
              // Edit mode: tampilkan saja, tidak bisa diubah
              <input
                type="hidden"
                name="emailId"
                value={account.emailId}
              />
            ) : (
              <select
                name="emailId"
                required
                defaultValue={defaultEmailId ?? ""}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
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
              <p className="text-xs text-zinc-500">
                {emails.find(e => e.id === account.emailId)?.emailAddress ?? account.emailId}
              </p>
            )}
          </div>

          {/* Platform dengan autocomplete */}
          <div className="relative">
            <label className="block text-xs text-zinc-400 mb-1">Platform *</label>
            <input
              name="platform"
              type="text"
              required
              value={platform}
              onChange={e => { setPlatform(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Discord, Instagram, TikTok..."
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
            />
            {showSuggestions && filtered.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden shadow-xl max-h-48 overflow-y-auto">
                {filtered.map(p => (
                  <li key={p}>
                    <button
                      type="button"
                      onMouseDown={() => { setPlatform(p); setShowSuggestions(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                    >
                      {p}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Username */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Username / Handle</label>
              <input
                name="username"
                type="text"
                defaultValue={account?.username ?? ""}
                placeholder="@username"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Nomor Telepon</label>
              <input
                name="phone"
                type="text"
                defaultValue={account?.phone ?? ""}
                placeholder="+628xxx"
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <p className="text-xs text-zinc-600 -mt-2">* Username atau nomor telepon wajib diisi salah satu</p>

          {/* Password */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              Password {account && <span className="text-zinc-600">(kosongkan jika tidak diubah)</span>}
            </label>
            <input
              name="password"
              type="password"
              required={!account}
              placeholder={account ? "Biarkan kosong jika tidak diubah" : "Password akun"}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Token */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              Auth Token <span className="text-zinc-600">(opsional)</span>
            </label>
            <input
              name="token"
              type="password"
              placeholder="Session token / auth token"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {/* TOTP Seed */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              TOTP Seed <span className="text-zinc-600">(Google Authenticator secret, opsional)</span>
            </label>
            <input
              name="totpSeed"
              type="password"
              placeholder="JBSWY3DPEHPK3PXP..."
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {/* Status (edit only) */}
          {account && (
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Status</label>
              <select
                name="status"
                defaultValue={account.status}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Notes <span className="text-zinc-600">(opsional)</span></label>
            <textarea
              name="notes"
              defaultValue={account?.notes ?? ""}
              rows={2}
              placeholder="Catatan tambahan, misal: banned sementara, dipakai project X..."
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {state && "error" in state && (
            <p className="text-sm text-red-400 bg-red-950/50 px-3 py-2 rounded-lg">{state.error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition-colors">
              Batal
            </button>
            <button type="submit" disabled={pending}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors">
              {pending ? "Menyimpan..." : account ? "Simpan Perubahan" : "Tambah Akun"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
