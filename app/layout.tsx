import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jordanka · Sweet Sixteen",
  description: "Acompáñanos a celebrar los Sweet Sixteen de Jordanka Hernández este 18 de diciembre en Dallas, Texas.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
