import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TrackingProvider from "@/components/tracking/TrackingProvider";
import MetaPixel from "@/components/analytics/MetaPixel";
import { GtmScript, GtmNoScript } from "@/components/analytics/GoogleTagManager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Codename Obliq | Commercial Spaces in Juinagar by Today Group & Jindal Group",
  description:
    "New commercial launch on Juinagar-Mulund Link Road. Corporate offices, professional suites & retail spaces by Today Group & Jindal Group. CC Received. Book a free site visit today.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GtmNoScript />
        {children}
        <TrackingProvider />
        <MetaPixel />
        <GtmScript />
      </body>
    </html>
  );
}
