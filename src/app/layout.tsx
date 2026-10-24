import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "HCM Lite — AI-Assisted Human Capital Management",
  description: "Saylani Hackathon HCM Lite: Role-based Human Capital Management with live AI assistant.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <body
        className="min-h-screen bg-white text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-600 selection:text-white"
      >
        <ThemeProvider defaultTheme="light">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
