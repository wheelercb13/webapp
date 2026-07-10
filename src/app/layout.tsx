import type { Metadata, Viewport } from "next";
import { Newsreader, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Personal Dashboard",
  description: "Personal task/project dashboard",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Dashboard",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

// viewportFit: "cover" is required for env(safe-area-inset-*) to resolve to
// real values on iOS -- without it every safe-area calc() silently evaluates
// to 0, so elements meant to clear the home-indicator/notch area don't.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${hankenGrotesk.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
