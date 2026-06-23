// @ts-nocheck
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: "Skyway AI | Your Smart Travel Planner",
  description: "Generate complete travel itineraries, budgets, and hotel recommendations in seconds with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <Toaster richColors position="top-right" />
        {children}
      </body>
    </html>
  );
}
