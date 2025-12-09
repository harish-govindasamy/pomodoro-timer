import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@/components/Analytics";

// JSON-LD Structured Data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Pomofocus",
  description:
    "A beautiful Pomodoro timer and task manager to boost your productivity. Stay focused and get more done with the Pomodoro Technique.",
  url: "https://pomofocus.io",
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Organization",
    name: "Growth Mindset Academy",
    url: "https://github.com/harish-govindasamy",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "1000",
  },
  featureList: [
    "Pomodoro Timer",
    "Task Management",
    "Statistics Tracking",
    "Customizable Settings",
    "Desktop & Mobile Support",
    "Dark Mode",
    "Keyboard Shortcuts",
  ],
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://pomofocus.io",
  ),
  title: {
    default: "Pomofocus - Pomodoro Timer & Task Manager",
    template: "%s | Pomofocus",
  },
  description:
    "A beautiful Pomodoro timer and task manager to boost your productivity. Stay focused and get more done with the Pomodoro Technique. Free, open-source, and works offline.",
  keywords: [
    "Pomodoro",
    "Pomodoro Timer",
    "Pomodoro Technique",
    "Timer",
    "Task Manager",
    "Productivity",
    "Focus",
    "Time Management",
    "Study Timer",
    "Work Timer",
    "Focus Timer",
    "Tomato Timer",
    "Productivity App",
    "Task Tracker",
    "Time Tracker",
  ],
  authors: [
    {
      name: "Harish Govindasamy",
      url: "https://github.com/harish-govindasamy",
    },
    { name: "Growth Mindset Academy" },
  ],
  creator: "Growth Mindset Academy",
  publisher: "Growth Mindset Academy",
  category: "Productivity",
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
    apple: "/logo.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pomofocus.io",
    siteName: "Pomofocus",
    title: "Pomofocus - Pomodoro Timer & Task Manager",
    description:
      "A beautiful Pomodoro timer and task manager to boost your productivity. Stay focused and get more done with the Pomodoro Technique.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pomofocus - Pomodoro Timer & Task Manager",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pomofocus - Pomodoro Timer & Task Manager",
    description:
      "A beautiful Pomodoro timer and task manager to boost your productivity. Free & open-source.",
    images: ["/og-image.png"],
    creator: "@G_Harish",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://pomofocus.io",
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
