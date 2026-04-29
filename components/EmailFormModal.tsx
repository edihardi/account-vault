"use client";

import { useActionState, useEffect } from "react";
import { createEmailAction, updateEmailAction } from "@/app/actions/emails";

interface EmailData {
  id: string;
  emailAddress: string;
  provider: string;
  recoveryEmail?: string | null;
  proxy?: string | null;
  status: string;
  notes?: string | null;
}

interface Props {
  email?: EmailData;
  onClose: () => void;
}

const PROVIDERS = ["Gmail", "Outlook", "Proton", "Yahoo", "iCloud", "Lainnya"];
const STATUSES = ["ACTIVE", "INACTIVE", "BANNED"];

export default function EmailFormModal({ email, onClose }: Props) {
  const action = email ? updateEmailAction : createEmailAction;
  const [state, formAction, pending] = useActionState(action, null);

  useEffect(() => {
    if (state && "success" in state) onClose();
  }, [state, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 flex-shrink-0">
          <h2 className="text-white font-semibold">
            {email ? "Edit Email" : "Tambah Email"}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-xl leading-none">×</button>
        </div>

        <form action={formAction} className="p-6 space-y-4 overflow-y-auto">
          {email && <input type="hidden" name="id" value={email.id} />}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-zinc-400 mb-1">Email Address *</label>
              <input
                name="emailAddress"
                type="email"
                required
                defaultValue={email?.emailAddress}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
                placeholder="contoh@gmail.com"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs text-zinc-400 mb-1">
                Password * {email && <span className="text-zinc-500">(kosongkan jika tidak diubah)</span>}
              </label>
              <input
                name="password"
                type="password"
                required={!email}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
                placeholder={email ? "Biarkan kosong jika tidak diubah" : "Password email"}
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">Provider *</label>
              <select
                name="provider"
                required
                defaultValue={email?.provider ?? "Gmail"}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                {PROVIDERS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>

            {email && (
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Status</label>
                <select
                  name="status"
                  defaultValue={email.status}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            )}

            <div className="col-span-2">
              <label className="block text-xs text-zinc-400 mb-1">Recovery Email</label>
              <input
                name="recoveryEmail"
                type="email"
                defaultValue={email?.recoveryEmail ?? ""}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
                placeholder="recovery@email.com"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs text-zinc-400 mb-1">Proxy <span className="text-zinc-500">ip:port:user:pass</span></label>
              <input
                name="proxy"
                defaultValue={email?.proxy ?? ""}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
                placeholder="1.2.3.4:8080:user:pass"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs text-zinc-400 mb-1">Notes</label>
              <textarea
                name="notes"
                defaultValue={email?.notes ?? ""}
                rows={2}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
                placeholder="Catatan tambahan..."
              />
            </div>
          </div>

          {state && "error" in state && (
            <p className="text-sm text-red-400 bg-red-950/50 px-3 py-2 rounded-lg">{state.error}</p>
          )}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm transition-colors">
              Batal
            </button>
            <button type="submit" disabled={pending}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors">
              {pending ? "Menyimpan..." : email ? "Simpan Perubahan" : "Tambah Email"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
