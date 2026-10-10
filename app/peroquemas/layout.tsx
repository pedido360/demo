import type { Metadata } from "next";

const title = "¡PERO QUÉ MÁS! | Guía regional de Santander";
const description =
  "Todo lo bueno de esta tierra en un solo lugar: gastronomía, hospedajes, comercio y experiencias.";

export const metadata: Metadata = {
  metadataBase: new URL("https://guiaboquisabrosa.pedidos360.shop"),
  title,
  description,
  openGraph: {
    title,
    description,
    url: "https://guiaboquisabrosa.pedidos360.shop",
    siteName: "¡PERO QUÉ MÁS!",
    locale: "es_CO",
    type: "website",
    images: [
      {
        url: "/guia/GuiaBoquisabrosaOG.jpeg",
        alt: "¡PERO QUÉ MÁS! · Guía regional de Santander",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/guia/GuiaBoquisabrosaOG.jpeg"],
  },
};

export default function BoquisabrosaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
