import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeSync — Collaborative Dev Space",
  description: "Real-time collaborative coding with video calls and VS Code sync",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bg h-screen overflow-hidden">{children}</body>
    </html>
  );
}
