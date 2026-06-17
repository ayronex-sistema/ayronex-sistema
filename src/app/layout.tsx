import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Checklist EPI | Ayronex",
  description: "Portal independente para checklist de entrega de EPIs."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
