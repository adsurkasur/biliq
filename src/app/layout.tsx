import type { Metadata } from "next";
import { APP_DESCRIPTION, APP_NAME } from "@/shared/config/appConfig";
import { ToastProvider } from "@/shared/components/ui/toast/ToastProvider";
import { AppPreferencesProvider } from "@/features/settings/components/AppPreferencesProvider";
import "./globals.css";

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
    <html lang="en">
      <body>
        <AppPreferencesProvider />
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

