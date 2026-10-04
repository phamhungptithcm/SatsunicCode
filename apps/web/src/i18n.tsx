import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Locale, Text } from "../../../packages/domain/src/catalog";
const Context = createContext<{
  locale: Locale;
  toggle: () => void;
  t: (value: Text) => string;
}>({ locale: "en", toggle: () => {}, t: (x) => x.en });
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    try {
      return localStorage.getItem("satsuniccode.locale") === "vi" ? "vi" : "en";
    } catch {
      return "en";
    }
  });
  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      localStorage.setItem("satsuniccode.locale", locale);
    } catch {
      /* Storage may be unavailable. */
    }
  }, [locale]);
  return (
    <Context.Provider
      value={{
        locale,
        t: (x) => x[locale],
        toggle: () => setLocale((x) => (x === "vi" ? "en" : "vi")),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useLanguage = () => useContext(Context);
export const text = (vi: string, en: string): Text => ({ vi, en });
