"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <form action={action} className="space-y-4 bg-card border border-border p-6 rounded-xl shadow-md">
      <div>
        <label className="block text-sm text-card-foreground mb-1">Master Password</label>
        <input
          name="masterPassword"
          type="password"
          required
          autoFocus
          placeholder="Master password"
          className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {state && "error" in state && (
        <p className="text-sm text-destructive-foreground bg-destructive/80 px-3 py-2 rounded-lg">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-2.5 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground font-medium rounded-lg transition-opacity"
      >
        {pending ? "Memverifikasi..." : "Login"}
      </button>
    </form>
  );
}
