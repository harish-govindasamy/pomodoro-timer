import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pomofocus - Pomodoro Timer & Task Manager",
  description: "A beautiful Pomodoro timer and task manager to boost your productivity. Stay focused and get more done with the Pomodoro Technique.",
  keywords: ["Pomodoro", "Timer", "Task Manager", "Productivity", "Focus", "Time Management"],
  authors: [{ name: "Pomofocus Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Pomofocus - Pomodoro Timer & Task Manager",
    description: "A beautiful Pomodoro timer and task manager to boost your productivity",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pomofocus - Pomodoro Timer & Task Manager",
    description: "A beautiful Pomodoro timer and task manager to boost your productivity",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
