import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/context/ThemeContext";
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
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  themeColor: "#020308",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/*
          Blocking script — runs synchronously before the browser paints.
          Reads localStorage and writes the correct CSS custom properties
          to <html> so the chosen theme is applied on the very first frame.
          Without this, users would see a flash of the default void theme
          on every page load when a different theme is stored.
        */}
        <script
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}