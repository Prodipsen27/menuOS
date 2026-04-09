import type { Metadata } from "next";
import { Noto_Serif, Manrope } from "next/font/google";
import "@/styles/globals.css";
import BottomNavWrapper from "@/components/ui/BottomNavWrapper";
import TopBar from "@/components/ui/TopBar";

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Luxé Digital Menu | The Digital Sommelier",
  description: "A premium, nocturnal culinary experience for the curated soul.",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
};

import SettingsManager from "@/components/ui/SettingsManager";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${notoSerif.variable} ${manrope.variable} h-full`}
    >
      <body className="h-full flex flex-col font-body">
        <SettingsManager>
          <TopBar />
          {children}
          <BottomNavWrapper />
        </SettingsManager>
      </body>
    </html>
  );
}
