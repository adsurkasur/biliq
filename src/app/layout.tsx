import type { Metadata } from "next";
import { APP_DESCRIPTION, APP_NAME } from "@/shared/config/appConfig";
import { ToastProvider } from "@/shared/components/ui/toast/ToastProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
