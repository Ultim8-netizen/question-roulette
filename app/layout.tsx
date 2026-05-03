import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/context/ThemeContext";
import { FeedbackWidget } from "@/components/FeedbackWidget";
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
  title: "room 13 — question roulette",
  description:
    "A two-player game of blind draws. Light surface. Dark depths. No map.",
  metadataBase: new URL("https://question-roulette-self.vercel.app"),
  openGraph: {
    title: "room 13 — question roulette",
    description:
      "A two-player game of blind draws. Light surface. Dark depths. No map.",
    siteName: "room 13 by abyss protocol",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "room 13 — question roulette",
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
        <script
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
          <FeedbackWidget />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}