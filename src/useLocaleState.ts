import { useState } from "react";
import type { Locale } from "./i18n";
import { initialLocaleFromEnvironment, writeStoredLocale } from "./i18nLocale";

export function useLocaleState(): readonly [Locale, (locale: Locale) => void] {
  const [locale, setLocale] = useState<Locale>(() => initialLocaleFromEnvironment(window.location.search, window.localStorage, window.navigator.languages));

  const updateLocale = (nextLocale: Locale) => {
    setLocale(nextLocale);
    writeStoredLocale(window.localStorage, nextLocale);
  };

  return [locale, updateLocale];
}
