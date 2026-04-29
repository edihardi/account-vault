"use client";

import { useActionState, useEffect } from "react";
import { createPortal } from "react-dom";
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

const inputCls = "w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors";
const labelCls = "block text-xs mb-1 font-medium";

export default function EmailFormModal({ email, onClose }: Props) {
  const action = email ? updateEmailAction : createEmailAction;
  const [state, formAction, pending] = useActionState(action, null);

  useEffect(() => {
    if (state && "success" in state) onClose();
  }, [state, onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl max-h-[90vh] flex flex-col animate-bounce-in">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h2 className="font-semibold syntax-function">
            {email ? "Edit Email" : "Tambah Email"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
        </div>

        <form action={formAction} className="p-6 space-y-4 overflow-y-auto">
          {email && <input type="hidden" name="id" value={email.id} />}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={`${labelCls} syntax-string`}>Email Address *</label>
              <input
                name="emailAddress"
                type="email"
                required
                defaultValue={email?.emailAddress}
                className={inputCls}
                placeholder="contoh@gmail.com"
              />
            </div>

            <div className="col-span-2">
              <label className={`${labelCls} syntax-keyword`}>
                Password *{" "}
                {email && <span className="text-muted-foreground/40 font-normal">(kosongkan jika tidak diubah)</span>}
              </label>
              <input
                name="password"
                type="password"
                required={!email}
                className={inputCls}
                placeholder={email ? "Biarkan kosong jika tidak diubah" : "Password email"}
              />
            </div>

            <div>
              <label className={`${labelCls} syntax-type`}>Provider *</label>
              <select
                name="provider"
                required
                defaultValue={email?.provider ?? "Gmail"}
                className={inputCls}
              >
                {PROVIDERS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>

            {email && (
              <div>
                <label className={`${labelCls} syntax-variable`}>Status</label>
                <select
                  name="status"
                  defaultValue={email.status}
                  className={inputCls}
                >
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            )}

            <div className="col-span-2">
              <label className={`${labelCls} syntax-string`}>Recovery Email</label>
              <input
                name="recoveryEmail"
                type="email"
                defaultValue={email?.recoveryEmail ?? ""}
                className={inputCls}
                placeholder="recovery@email.com"
              />
            </div>

            <div className="col-span-2">
              <label className={`${labelCls} syntax-comment`}>
                Proxy <span className="text-muted-foreground/40 font-normal">ip:port:user:pass</span>
              </label>
              <input
                name="proxy"
                defaultValue={email?.proxy ?? ""}
                className={`${inputCls} font-mono`}
                placeholder="1.2.3.4:8080:user:pass"
              />
            </div>

            <div className="col-span-2">
              <label className={`${labelCls} syntax-comment`}>Notes</label>
              <textarea
                name="notes"
                defaultValue={email?.notes ?? ""}
                rows={2}
                className={`${inputCls} resize-none`}
                placeholder="Catatan tambahan..."
              />
            </div>
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
              {pending ? "Menyimpan..." : email ? "Simpan Perubahan" : "Tambah Email"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
