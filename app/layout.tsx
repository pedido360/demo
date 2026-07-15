import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

import { CartProvider } from "@/context/CartContext";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "Pedidos360",
  description: "Convierte tu WhatsApp en un canal de ventas inteligente.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={geist.variable}>
      <body className="bg-gray-100 text-gray-900 antialiased">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}