import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translations, type Lang, type DashboardTranslations } from "./translations";

const STORAGE_KEY = "mm-dash-lang";

function detectInitialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "es" || saved === "en" || saved === "pt") return saved;
  } catch {
    // localStorage unavailable
  }
  const browserLang = navigator.language?.slice(0, 2);
  if (browserLang === "en") return "en";
  if (browserLang === "pt") return "pt";
  return "es"; // Español as default
}

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: DashboardTranslations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => detectInitialLang());

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function setLang(next: Lang) {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] || translations.es }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
