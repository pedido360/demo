import { Restaurant } from "@/types/restaurant";

export const restaurant: Restaurant = {
    id: "1",

    slug: "demo",

    name: "Pedidos360 Demo",

    description: "Los mejores productos de la ciudad.",

    logo: "/images/logo.png",

    banner: "/images/banner.jpg",

    whatsapp: "573184377576",

    address: "Calle Principal #123",

    city: "Bogotá",

    isOpen: true,

    rating: 4.8,

    categories: [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
    ],

    status: "active",

    pauseReason: null,

    pausedAt: null,
};