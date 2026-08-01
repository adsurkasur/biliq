import type { Metadata } from "next";
import { APP_DESCRIPTION, APP_NAME } from "@/shared/config/appConfig";
import { ToastProvider } from "@/shared/components/ui/toast/ToastProvider";
import { AppPreferencesProvider } from "@/features/settings/components/AppPreferencesProvider";
import { AppGuide } from "@/features/guides/components/AppGuide";
import "./globals.css";

const preferenceBootstrap = `(() => { try {
  const themeMode = localStorage.getItem("biliq-theme-mode") || "system";
  const theme = themeMode === "system"
    ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : themeMode;
  const motionMode = localStorage.getItem("biliq-motion-preference") || "system";
  const motion = motionMode === "system"
    ? (matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduced" : "full")
    : motionMode;
  const root = document.documentElement;
  root.dataset.themeMode = themeMode;
  root.dataset.theme = theme;
  root.dataset.motionMode = motionMode;
  root.dataset.motion = motion;
} catch (_) {} })();`;

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  icons: {
    icon: "/favicon.svg",
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preferenceBootstrap }} />
      </head>
      <body>
        <AppPreferencesProvider />
        <ToastProvider>
          {children}
          <AppGuide />
        </ToastProvider>
      </body>
    </html>
  );
}

