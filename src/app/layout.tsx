import type { Metadata } from "next";
import {
  Overpass as FontSans,
  Red_Hat_Mono as FontMono,
} from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const fontSans = FontSans({
  variable: "--font-sans",
  weight: "variable",
  subsets: ["latin", "latin-ext"],
});

const fontMono = FontMono({
  variable: "--font-mono",
  weight: "variable",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "MeetEasy : Meetings made Easy!",
  description: "Use MeetEasy to schedule meetings with ease!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          "font-sans antialiased",
          fontSans.variable,
          fontMono.variable,
        )}
      >
        {children}
      </body>
    </html>
  );
}
