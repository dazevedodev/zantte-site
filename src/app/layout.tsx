import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { BootScreen } from "@/components/boot-screen";
import { MetaPixel } from "@/components/meta-pixel";

// Geist pra tudo (título e corpo) — só a mono fica separada, de propósito,
// pros detalhes técnicos (labels, menu, rodapé).
const geist = Geist({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Zantte — Tecnologia que resolve problemas reais",
  description: "Zantte desenvolve sistemas digitais e motion sob medida para negócios locais.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${geist.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <MetaPixel />
        <BootScreen />
        {children}
      </body>
    </html>
  );
}
