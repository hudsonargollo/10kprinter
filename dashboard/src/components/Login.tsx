import { useEffect, useState } from "react";
import { login, register, registrationStatus } from "../api";
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
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    registrationStatus()
      .then((r) => {
        setRegistrationOpen(r.open);
        if (!r.open) setMode("login");
      })
      .catch(() => setRegistrationOpen(false));
  }, []);

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
    <div className="flex min-h-screen items-center justify-center p-4 bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      <div className="w-full max-w-[380px] space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center size-11 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20 mb-1">
            M
          </div>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground">MoneyMachine Ops</h1>
          <p className="text-xs text-muted-foreground">{t.login.subtitle}</p>
        </div>

        {/* Card */}
        <Card className="p-6 shadow-2xl">
          {/* Mode Switcher */}
          <div className={`grid ${registrationOpen ? "grid-cols-2" : "grid-cols-1"} gap-1 p-1 mb-5 rounded-full bg-secondary`}>
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`h-8 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.login.signInTab}
            </button>
            {registrationOpen && (
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError(null);
                }}
                className={`h-8 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  mode === "register"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.login.registerTab}
              </button>
            )}
          </div>

          <form onSubmit={submit} className="space-y-3.5">
            {mode === "register" && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground">{t.login.nameLabel}</label>
                <div className="relative">
                  <User className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <Input
                    type="text"
                    required
                    placeholder={t.login.namePlaceholder}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground">{t.login.emailLabel}</label>
              <div className="relative">
                <Mail className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  type="email"
                  autoFocus
                  required
                  placeholder={t.login.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground">{t.login.passwordLabel}</label>
              <div className="relative">
                <Lock className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  type="password"
                  required
                  minLength={6}
                  placeholder={mode === "register" ? t.login.passwordPlaceholderRegister : t.login.passwordPlaceholderLogin}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                {error}
              </div>
            )}

            <Button type="submit" disabled={busy} className="w-full mt-2">
              {busy ? (
                <span>{t.login.submitBusy}</span>
              ) : mode === "login" ? (
                <>
                  <span>{t.login.submitSignIn}</span>
                  <ArrowRight className="size-4" />
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  <span>{t.login.submitRegister}</span>
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="size-3.5 text-emerald-400" />
          <span>{t.login.securityNote}</span>
        </div>
      </div>
    </div>
  );
}
