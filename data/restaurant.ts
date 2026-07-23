import { Restaurant } from "@/types/restaurant";

export const restaurant: Restaurant = {
    id: "1",

    slug: "demo",

    name: "Tu Negocio Acá",

    description: "Así podría verse el menú digital de tu restaurante.",

    logo: "/logo.png",

    banner: "/banner.jpg",

    whatsapp: "573184377576", // tu número

    address: "Colombia",

    city: "Disponible para cualquier ciudad",

    isOpen: true,

    rating: 5.0,

    categories: [
        "Hamburguesas",
        "Perros",
        "Burritos",
        "Patacones",
        "Carnes",
        "Bebidas",
    ],
};