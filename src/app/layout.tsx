import type { Metadata } from "next";
import { TanstackQueryProvider } from "@/providers/tanstack-query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next.js 15 App Router",
  description: "Next.js 15 App Router",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
      <html lang="en">
        <body suppressHydrationWarning={true}>
          <TanstackQueryProvider>
            {children}
          </TanstackQueryProvider>
        </body>
      </html>
  );
}
