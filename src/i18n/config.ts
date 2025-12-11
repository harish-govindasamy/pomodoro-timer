export const locales = ["en", "es", "hi", "fr", "de", "ja"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  hi: "हिन्दी",
  fr: "Français",
  de: "Deutsch",
  ja: "日本語",
};

export const localeFlags: Record<Locale, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
  hi: "🇮🇳",
  fr: "🇫🇷",
  de: "🇩🇪",
  ja: "🇯🇵",
};
