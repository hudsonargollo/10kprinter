import { useState } from "react";
import { login, register } from "../api";
import type { AuthUser } from "../types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lock, Mail, User, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

export function Login({ onLoggedIn }: { onLoggedIn: (user: AuthUser) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "login") {
        const { user } = await login(email.trim(), password);
        onLoggedIn(user);
      } else {
        const { user } = await register(email.trim(), password, name.trim());
        onLoggedIn(user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#0c0812] text-foreground font-sans selection:bg-[#e8ff5c] selection:text-black">
      <div className="w-full max-w-[380px] space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#e8ff5c] text-black font-black text-base shadow-lg shadow-[#e8ff5c]/20 mb-1">
            M
          </div>
          <h1 className="font-heading text-xl font-bold tracking-tight text-white">MoneyMachine Ops</h1>
          <p className="text-xs text-white/50 font-mono">{t.login.subtitle}</p>
        </div>

        {/* Card */}
        <Card className="p-6 bg-[#161020] border-white/10 shadow-2xl rounded-2xl">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 mb-5 bg-white/5 rounded-xl border border-white/5">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-[#e8ff5c] text-black font-semibold shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {t.login.signInTab}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
              }}
              className={`py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                mode === "register"
                  ? "bg-[#e8ff5c] text-black font-semibold shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {t.login.registerTab}
            </button>
          </div>

          <form onSubmit={submit} className="space-y-3.5">
            {mode === "register" && (
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-white/60">{t.login.nameLabel}</label>
                <div className="relative">
                  <User className="w-4 h-4 text-white/40 absolute left-3 top-2.5" />
                  <Input
                    type="text"
                    required
                    placeholder={t.login.namePlaceholder}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9 bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 h-9 text-xs rounded-xl"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-white/60">{t.login.emailLabel}</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-white/40 absolute left-3 top-2.5" />
                <Input
                  type="email"
                  autoFocus
                  required
                  placeholder={t.login.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-white/60">{t.login.passwordLabel}</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3 top-2.5" />
                <Input
                  type="password"
                  required
                  minLength={6}
                  placeholder={mode === "register" ? t.login.passwordPlaceholderRegister : t.login.passwordPlaceholderLogin}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={busy}
              className="w-full h-10 mt-2 bg-[#e8ff5c] text-black font-bold hover:bg-[#d8ef4c] rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#e8ff5c]/20"
            >
              {busy ? (
                <span>{t.login.submitBusy}</span>
              ) : mode === "login" ? (
                <>
                  <span>{t.login.submitSignIn}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.login.submitRegister}</span>
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-white/40 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t.login.securityNote}</span>
        </div>
      </div>
    </div>
  );
}
