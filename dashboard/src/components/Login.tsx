import { useState } from "react";
import { login } from "../api";
import type { AuthUser } from "../types";

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
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
      <form onSubmit={submit} className="card" style={{ width: 340 }}>
        <h2>MoneyMachine Ops</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: -6, marginBottom: 16 }}>Sign in to continue</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            type="email"
            autoFocus
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: "9px 11px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }}
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "9px 11px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)" }}
          />
        </div>
        {error && <p style={{ color: "var(--bad)", fontSize: 12, marginTop: 10 }}>{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={busy} style={{ width: "100%", justifyContent: "center", marginTop: 14 }}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
