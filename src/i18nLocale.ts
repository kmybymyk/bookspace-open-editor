import type { Locale } from "./i18n";

export const LOCALE_STORAGE_KEY = "bookspace-web:locale:v1";
export const LEGACY_LOCALE_STORAGE_KEY = "bookspace-lite:locale:v1";

export function localeFromValue(value: string | null | undefined): Locale | null {
  if (value === "ko" || value === "en") {
    return value;
  }
  return null;
}

export function localeFromBrowserLanguages(languages: readonly string[]): Locale {
  return languages.some((language) => language.toLowerCase().startsWith("ko")) ? "ko" : "en";
}

export function readStoredLocale(storage: Storage): Locale | null {
  try {
    return localeFromValue(storage.getItem(LOCALE_STORAGE_KEY)) ?? localeFromValue(storage.getItem(LEGACY_LOCALE_STORAGE_KEY));
  } catch (error: unknown) {
    if (isRecoverableStorageError(error)) {
      return null;
    }
    throw error;
  }
}

export function writeStoredLocale(storage: Storage, locale: Locale): void {
  try {
    storage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch (error: unknown) {
    if (!isRecoverableStorageError(error)) {
      throw error;
    }
  }
}

export function localeFromPathname(pathname: string): Locale | null {
  return pathname === "/en/editor/" || pathname === "/en/editor" ? "en" : null;
}

export function initialLocaleFromEnvironment(search: string, pathname: string, storage: Storage, languages: readonly string[]): Locale {
  const queryLocale = localeFromValue(new URLSearchParams(search).get("lang"));
  return queryLocale ?? localeFromPathname(pathname) ?? readStoredLocale(storage) ?? localeFromBrowserLanguages(languages);
}

function isRecoverableStorageError(error: unknown): boolean {
  return error instanceof DOMException && (error.name === "QuotaExceededError" || error.name === "SecurityError");
}
