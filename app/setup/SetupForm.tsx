"use client";

import { useActionState } from "react";
import { setupAction } from "@/app/actions/auth";

export default function SetupForm() {
  const [state, action, pending] = useActionState(setupAction, null);

  return (
    <form action={action} className="space-y-4 bg-zinc-900 p-6 rounded-xl border border-zinc-800">
      <div>
        <label className="block text-sm text-zinc-300 mb-1">Master Password</label>
        <input
          name="masterPassword"
          type="password"
          required
          minLength={8}
          placeholder="Min. 8 karakter"
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm text-zinc-300 mb-1">Konfirmasi Master Password</label>
        <input
          name="confirmPassword"
          type="password"
          required
          placeholder="Ulangi master password"
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm text-zinc-300 mb-1">PIN (6 digit)</label>
        <input
          name="pin"
          type="password"
          required
          inputMode="numeric"
          maxLength={6}
          placeholder="••••••"
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 tracking-widest text-center text-lg"
        />
      </div>
      <div>
        <label className="block text-sm text-zinc-300 mb-1">Konfirmasi PIN</label>
        <input
          name="confirmPin"
          type="password"
          required
          inputMode="numeric"
          maxLength={6}
          placeholder="••••••"
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 tracking-widest text-center text-lg"
        />
      </div>

      {state && "error" in state && (
        <p className="text-sm text-red-400 bg-red-950/50 px-3 py-2 rounded-lg">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
      >
        {pending ? "Menyimpan..." : "Buat Akun"}
      </button>
    </form>
  );
}
