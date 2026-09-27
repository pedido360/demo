import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://guiaboquisabrosa.pedidos360.shop"),

  title: "Guía Boquisabrosa | Ruta Gastronómica · San Gil",

  description:
    "Descubre restaurantes, cafés y sabores de San Gil con la Guía Boquisabrosa.",

  openGraph: {
    title: "Guía Boquisabrosa | Ruta Gastronómica · San Gil",
    description:
      "Descubre restaurantes, cafés y sabores de San Gil con la Guía Boquisabrosa.",
    url: "https://guiaboquisabrosa.pedidos360.shop",
    siteName: "Guía Boquisabrosa",
    locale: "es_CO",
    type: "website",
    images: [
      {
        url: "/guia/GuiaBoquisabrosaOG.jpeg",
        alt: "Guía Boquisabrosa · Ruta Gastronómica · San Gil",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Guía Boquisabrosa | Ruta Gastronómica · San Gil",
    description:
      "Descubre restaurantes, cafés y sabores de San Gil con la Guía Boquisabrosa.",
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
