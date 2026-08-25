"use client";

import { useActionState } from "react";
import { Lock, LogIn } from "lucide-react";
import { login, type LoginState } from "@/lib/auth/actions";
import { SITE } from "@/lib/content";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy-950 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-navy-700 bg-navy-900 p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/10 text-gold-400">
            <Lock className="h-5 w-5" />
          </span>
          <h1 className="mt-4 text-lg font-bold text-white">{SITE.projectName} Admin</h1>
          <p className="mt-1 text-sm text-navy-400">Sign in to view leads and analytics.</p>
        </div>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              autoComplete="current-password"
              autoFocus
              required
              className="w-full rounded-lg border border-navy-700 bg-navy-800 px-4 py-3 text-sm text-white placeholder:text-navy-500 outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          {state?.error && <p className="text-sm text-red-400">{state.error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold-500 px-4 py-3 text-sm font-semibold text-navy-950 transition hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <LogIn className="h-4 w-4" /> {pending ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
