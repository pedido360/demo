import { Product } from "@/types/product";

export const products: Product[] = [
    {
        id: "1",
        categoryId: "1",
        name: "Hamburguesa Especial",
        description: "Carne, pollo, queso y tocineta",
        price: 21000,
        image: "/images/products/hamburger.jpg",
        featured: true,

        ingredients: [
            { id: "1", name: "Pan" },
            { id: "2", name: "Carne" },
            { id: "3", name: "Pollo" },
            { id: "4", name: "Queso" },
            { id: "5", name: "Tocineta" },
            { id: "6", name: "Lechuga" },
            { id: "7", name: "Tomate" },
            { id: "8", name: "Salsa de la casa" },
        ],

        extras: [
            {
                id: "1",
                name: "Queso",
                price: 3000,
            },
            {
                id: "2",
                name: "Tocineta",
                price: 5000,
            },
            {
                id: "3",
                name: "Carne",
                price: 7000,
            },
        ],
    },

    {
        id: "2",
        categoryId: "1",
        name: "Hamburguesa Mexicana",
        description: "Carne, jalapeños y queso",
        price: 23000,
        image: "/images/products/hamburger.jpg",
        featured: false,

        ingredients: [
            { id: "1", name: "Pan" },
            { id: "2", name: "Carne" },
            { id: "3", name: "Queso" },
            { id: "4", name: "Jalapeños" },
            { id: "5", name: "Lechuga" },
            { id: "6", name: "Tomate" },
        ],

        extras: [
            {
                id: "1",
                name: "Queso",
                price: 3000,
            },
            {
                id: "2",
                name: "Guacamole",
                price: 4000,
            },
        ],
    },

    {
        id: "3",
        categoryId: "2",
        name: "Perro Especial",
        description: "Salchicha premium y queso",
        price: 18000,
        image: "🌭",
        featured: true,

        ingredients: [
            { id: "1", name: "Pan" },
            { id: "2", name: "Salchicha" },
            { id: "3", name: "Queso" },
            { id: "4", name: "Papa ripio" },
            { id: "5", name: "Salsas" },
        ],

        extras: [
            {
                id: "1",
                name: "Tocineta",
                price: 4000,
            },
            {
                id: "2",
                name: "Queso",
                price: 3000,
            },
        ],
    },
];