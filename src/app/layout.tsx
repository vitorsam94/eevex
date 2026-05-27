import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "eevex",
  description: "Emissão segura de ingressos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
