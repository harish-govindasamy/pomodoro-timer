"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Locale,
  locales,
  localeNames,
  localeFlags,
  defaultLocale,
} from "@/i18n/config";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const router = useRouter();
  const [currentLocale, setCurrentLocale] = useState<Locale>(() => {
    if (typeof document !== "undefined") {
      const cookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("NEXT_LOCALE="));
      const locale = cookie?.split("=")[1] as Locale | undefined;
      return locale && locales.includes(locale) ? locale : defaultLocale;
    }
    return defaultLocale;
  });

  const handleLocaleChange = (locale: Locale) => {
    // Set cookie for 1 year
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`;
    setCurrentLocale(locale);
    // Refresh to apply new locale
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={className}>
          <Globe className="h-4 w-4" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={currentLocale === locale ? "bg-accent" : ""}
          >
            <span className="mr-2">{localeFlags[locale]}</span>
            {localeNames[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
