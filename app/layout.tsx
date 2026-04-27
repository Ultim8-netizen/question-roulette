import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "abyssprotocol — question roulette",
  description:
    "A two-player game of blind draws. Light surface. Dark depths. No map.",
  metadataBase: new URL("https://abyssprotocol.vercel.app"),
  openGraph: {
    title: "abyssprotocol — question roulette",
    description:
      "A two-player game of blind draws. Light surface. Dark depths. No map.",
    siteName: "abyssprotocol",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "abyssprotocol — question roulette",
    description:
      "A two-player game of blind draws. Light surface. Dark depths. No map.",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
  themeColor: "#020308",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}