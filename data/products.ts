import { Product } from "@/types/product";

export const products: Product[] = [
    {
        id: "1",
        categoryId: "1",
        name: "Hamburguesa Especial",
        description: "Carne, pollo, queso y tocineta",
        price: 21000,
        image: "🍔",
    },

    {
        id: "2",
        categoryId: "1",
        name: "Hamburguesa Mexicana",
        description: "Carne, jalapeños y queso",
        price: 23000,
        image: "🍔",
    },

    {
        id: "3",
        categoryId: "2",
        name: "Perro Especial",
        description: "Salchicha premium y queso",
        price: 18000,
        image: "🌭",
    },

];