"use client";

import { useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

// Privacy-friendly analytics configuration
interface AnalyticsConfig {
  enabled: boolean;
  provider: "plausible" | "umami" | "simple" | "none";
  domain?: string;
  scriptUrl?: string;
  websiteId?: string; // For Umami
}

// Default configuration - can be overridden via environment variables
const getAnalyticsConfig = (): AnalyticsConfig => {
  if (typeof window === "undefined") {
    return { enabled: false, provider: "none" };
  }

  // Check for Plausible
  if (process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN) {
    return {
      enabled: true,
      provider: "plausible",
      domain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
      scriptUrl:
        process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL ||
        "https://plausible.io/js/script.js",
    };
  }

  // Check for Umami
  if (
    process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID &&
    process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL
  ) {
    return {
      enabled: true,
      provider: "umami",
      websiteId: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
      scriptUrl: process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL,
    };
  }

  // Check for Simple Analytics
  if (process.env.NEXT_PUBLIC_SIMPLE_ANALYTICS === "true") {
    return {
      enabled: true,
      provider: "simple",
      scriptUrl: "https://scripts.simpleanalyticscdn.com/latest.js",
    };
  }

  return { enabled: false, provider: "none" };
};

// Custom event tracking interface
interface TrackEventOptions {
  name: string;
  props?: Record<string, string | number | boolean>;
}

// Analytics context for tracking custom events
export function useAnalytics() {
  const trackEvent = useCallback(({ name, props }: TrackEventOptions) => {
    if (typeof window === "undefined") return;

    const config = getAnalyticsConfig();
    if (!config.enabled) return;

    try {
      switch (config.provider) {
        case "plausible":
          // Plausible custom events
          if ((window as any).plausible) {
            (window as any).plausible(name, { props });
          }
          break;

        case "umami":
          // Umami custom events
          if ((window as any).umami) {
            (window as any).umami.track(name, props);
          }
          break;

        case "simple":
          // Simple Analytics custom events
          if ((window as any).sa_event) {
            (window as any).sa_event(name, props);
          }
          break;

        default:
          break;
      }
    } catch (error) {
      // Silently fail - analytics should never break the app
      console.debug("Analytics event failed:", error);
    }
  }, []);

  // Track page views manually if needed
  const trackPageView = useCallback((url?: string) => {
    if (typeof window === "undefined") return;

    const config = getAnalyticsConfig();
    if (!config.enabled) return;

    try {
      switch (config.provider) {
        case "plausible":
          if ((window as any).plausible) {
            (window as any).plausible("pageview", {
              u: url || window.location.href,
            });
          }
          break;

        case "umami":
          if ((window as any).umami) {
            (window as any).umami.track();
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.debug("Analytics pageview failed:", error);
    }
  }, []);

  return {
    trackEvent,
    trackPageView,
    isEnabled: getAnalyticsConfig().enabled,
  };
}

// Predefined events for Pomofocus
export const AnalyticsEvents = {
  // Timer events
  TIMER_START: "timer_start",
  TIMER_PAUSE: "timer_pause",
  TIMER_RESET: "timer_reset",
  TIMER_COMPLETE: "timer_complete",
  TIMER_SKIP: "timer_skip",

  // Task events
  TASK_CREATE: "task_create",
  TASK_COMPLETE: "task_complete",
  TASK_DELETE: "task_delete",

  // Mode changes
  MODE_FOCUS: "mode_focus",
  MODE_SHORT_BREAK: "mode_short_break",
  MODE_LONG_BREAK: "mode_long_break",

  // Settings
  SETTINGS_CHANGE: "settings_change",
  THEME_CHANGE: "theme_change",

  // Onboarding
  ONBOARDING_START: "onboarding_start",
  ONBOARDING_COMPLETE: "onboarding_complete",
  ONBOARDING_SKIP: "onboarding_skip",

  // PWA
  PWA_INSTALL: "pwa_install",
  PWA_PROMPT: "pwa_prompt",

  // Errors
  ERROR_BOUNDARY: "error_boundary",
} as const;

// Analytics script loader component
export function Analytics() {
  const pathname = usePathname();
  const config = getAnalyticsConfig();

  // Track page views on route change
  useEffect(() => {
    if (!config.enabled) return;

    // The analytics scripts handle page views automatically
    // This effect is for any custom handling needed
  }, [pathname, config.enabled]);

  // Don't render anything if analytics is disabled
  if (!config.enabled) {
    return null;
  }

  return (
    <>
      {/* Plausible Analytics */}
      {config.provider === "plausible" && config.scriptUrl && config.domain && (
        <script
          defer
          data-domain={config.domain}
          src={config.scriptUrl}
        />
      )}

      {/* Umami Analytics */}
      {config.provider === "umami" && config.scriptUrl && config.websiteId && (
        <script
          defer
          src={config.scriptUrl}
          data-website-id={config.websiteId}
        />
      )}

      {/* Simple Analytics */}
      {config.provider === "simple" && config.scriptUrl && (
        <>
          <script async defer src={config.scriptUrl} />
          <noscript>
            <img
              src="https://queue.simpleanalyticscdn.com/noscript.gif"
              alt=""
              referrerPolicy="no-referrer-when-downgrade"
            />
          </noscript>
        </>
      )}
    </>
  );
}

// Analytics wrapper for layout
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Analytics />
    </>
  );
}

// Respect Do Not Track
export function respectsDoNotTrack(): boolean {
  if (typeof window === "undefined") return true;

  const dnt =
    (navigator as any).doNotTrack ||
    (window as any).doNotTrack ||
    (navigator as any).msDoNotTrack;

  return dnt === "1" || dnt === "yes";
}

// Privacy notice component
export function AnalyticsPrivacyNotice() {
  const config = getAnalyticsConfig();

  if (!config.enabled) {
    return (
      <p className="text-xs text-muted-foreground">
        🔒 No analytics or tracking is enabled. Your data stays on your device.
      </p>
    );
  }

  const providerInfo = {
    plausible: {
      name: "Plausible Analytics",
      description:
        "Privacy-friendly analytics that doesn't use cookies and is fully GDPR compliant.",
      url: "https://plausible.io/privacy-focused-web-analytics",
    },
    umami: {
      name: "Umami Analytics",
      description:
        "Self-hosted, privacy-focused analytics that respects user privacy.",
      url: "https://umami.is/docs/about",
    },
    simple: {
      name: "Simple Analytics",
      description:
        "Privacy-first analytics without cookies, GDPR compliant by design.",
      url: "https://simpleanalytics.com/privacy",
    },
    none: {
      name: "None",
      description: "No analytics enabled.",
      url: "",
    },
  };

  const info = providerInfo[config.provider];

  return (
    <div className="text-xs text-muted-foreground space-y-1">
      <p>
        📊 We use{" "}
        <a
          href={info.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          {info.name}
        </a>{" "}
        for anonymous usage statistics.
      </p>
      <p>{info.description}</p>
    </div>
  );
}

export default Analytics;
