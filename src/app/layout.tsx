import type { Metadata } from "next";
import { DM_Sans, Source_Sans_3 } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { AuthProvider } from "@/components/features/AuthProvider";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "AllClear — Instant Sanctions Screening",
  description:
    "Screen names against 40+ global sanctions lists in seconds. Affordable compliance for small businesses at 1/100th the price of enterprise tools.",
  keywords: [
    "sanctions screening",
    "OFAC",
    "due diligence",
    "compliance",
    "KYC",
    "AML",
    "sanctions check",
    "PEP screening",
    "trade compliance",
    "small business compliance",
  ],
  openGraph: {
    title: "AllClear — Instant Sanctions Screening",
    description:
      "Know who you're doing business with. Screen names against 40+ global sanctions lists in seconds.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AllClear — Instant Sanctions Screening",
    description:
      "Know who you're doing business with. Screen names against 40+ global sanctions lists in seconds.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${sourceSans.variable} antialiased font-body`}>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
