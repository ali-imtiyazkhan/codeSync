import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Auth/Providers";
import { StyledJsxRegistry } from "@/lib/styled-jsx-registry";

const outfit = Outfit({ subsets: ["latin"] });

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
      <body className={`${outfit.className} bg-bg`}>
        <StyledJsxRegistry>
          <Providers>{children}</Providers>
        </StyledJsxRegistry>
      </body>
    </html>
  );
}
