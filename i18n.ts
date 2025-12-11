import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

const locales = ["en", "es", "hi", "fr", "de", "ja"] as const;
type Locale = (typeof locales)[number];
const defaultLocale: Locale = "en";

export default getRequestConfig(async () => {
  // Try to get locale from cookie first
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value as
    | Locale
    | undefined;

  if (cookieLocale && locales.includes(cookieLocale)) {
    return {
      locale: cookieLocale,
      messages: (await import(`./messages/${cookieLocale}.json`)).default,
    };
  }

  // Fall back to Accept-Language header
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");

  if (acceptLanguage) {
    const preferredLocales = acceptLanguage
      .split(",")
      .map((lang) => lang.split(";")[0].trim().substring(0, 2));

    for (const lang of preferredLocales) {
      if (locales.includes(lang as Locale)) {
        return {
          locale: lang,
          messages: (await import(`./messages/${lang}.json`)).default,
        };
      }
    }
  }

  // Default to English
  return {
    locale: defaultLocale,
    messages: (await import(`./messages/${defaultLocale}.json`)).default,
  };
});
