import { useState } from "react";
import { login } from "../api";
import type { AuthUser } from "../types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function Login({ onLoggedIn }: { onLoggedIn: (user: AuthUser) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { user } = await login(email.trim(), password);
      onLoggedIn(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Incorrect email or password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={submit}>
        <Card className="w-[340px] p-5">
          <h2 className="font-heading text-lg font-bold">MoneyMachine Ops</h2>
          <p className="-mt-1 mb-4 text-[13px] text-muted-foreground">Sign in to continue</p>
          <div className="flex flex-col gap-2.5">
            <Input
              type="email"
              autoFocus
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="mt-2.5 text-xs text-bad">{error}</p>}
          <Button type="submit" disabled={busy} className="mt-3.5 w-full justify-center">
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </Card>
      </form>
    </div>
  );
}
