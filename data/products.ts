import { Product } from "@/types/product";
const burgerExtras = [
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
];

const hotdogExtras = [
    {
        id: "1",
        name: "Queso",
        price: 3000,
    },
    {
        id: "2",
        name: "Tocineta",
        price: 4000,
    },
];

export const products: Product[] = [

    {
        id: "1",
        categoryId: "1",
        name: "Hamburguesa Especial",
        description: "Carne, pollo, queso y tocineta.",
        price: 21000,
        image: "/images/products/hamburger.jpg",
        featured: false,

        ingredients: [
            { id: "1", name: "Pan" },
            { id: "2", name: "Carne 120 gr" },
            { id: "3", name: "Pollo desmechado" },
            { id: "4", name: "Queso" },
            { id: "5", name: "Tocineta" },
            { id: "6", name: "Lechuga" },
            { id: "7", name: "Tomate" },
            { id: "8", name: "Salsa de la casa" },
        ],

        extras: burgerExtras,
    },

    {
        id: "5",
        categoryId: "1",
        name: "Hamburguesa Solo Pollo",
        description: "Pollo desmechado, queso y vegetales.",
        price: 18000,
        image: "/images/products/hamburger.jpg",
        featured: false,

        ingredients: [
            { id: "1", name: "Pan" },
            { id: "2", name: "Pollo desmechado" },
            { id: "3", name: "Queso" },
            { id: "4", name: "Lechuga" },
            { id: "5", name: "Tomate" },
            { id: "6", name: "Salsa de la casa" },
        ],

        extras: burgerExtras,
    },

    {
        id: "6",
        categoryId: "1",
        name: "Hamburguesa Campesina",
        description: "Carne, huevo, queso y tocineta.",
        price: 22000,
        image: "/images/products/hamburger.jpg",
        featured: false,

        ingredients: [
            { id: "1", name: "Pan" },
            { id: "2", name: "Carne 120 gr" },
            { id: "3", name: "Huevo" },
            { id: "4", name: "Queso" },
            { id: "5", name: "Tocineta" },
            { id: "6", name: "Lechuga" },
            { id: "7", name: "Tomate" },
        ],

        extras: burgerExtras,
    },

    {
        id: "7",
        categoryId: "1",
        name: "Hamburguesa Maduro",
        description: "Carne, queso y maduro.",
        price: 22000,
        image: "/images/products/hamburger.jpg",
        featured: false,

        ingredients: [
            { id: "1", name: "Pan" },
            { id: "2", name: "Carne 120 gr" },
            { id: "3", name: "Queso" },
            { id: "4", name: "Maduro" },
            { id: "5", name: "Lechuga" },
            { id: "6", name: "Tomate" },
        ],

        extras: burgerExtras,
    },

    {
        id: "9",
        categoryId: "1",
        name: "Hamburguesa Doble Carne Crispy",
        description: "Doble carne, pollo crispy y queso.",
        price: 23000,
        image: "/images/products/hamburger.jpg",
        featured: false,

        ingredients: [
            { id: "1", name: "Pan" },
            { id: "2", name: "2 Carnes 120 gr" },
            { id: "3", name: "Pollo Crispy" },
            { id: "4", name: "Queso" },
            { id: "5", name: "Lechuga" },
            { id: "6", name: "Tomate" },
        ],

        extras: burgerExtras,
    },

    {
        id: "10",
        categoryId: "1",
        name: "Hamburguesa Santandereana",
        description: "Carne, chorizo, piña y queso.",
        price: 24000,
        image: "/images/products/hamburger.jpg",
        featured: false,

        ingredients: [
            { id: "1", name: "Pan" },
            { id: "2", name: "Carne 120 gr" },
            { id: "3", name: "Chorizo" },
            { id: "4", name: "Piña" },
            { id: "5", name: "Queso" },
            { id: "6", name: "Lechuga" },
        ],

        extras: burgerExtras,
    },

    {
        id: "11",
        categoryId: "1",
        name: "Hamburguesa Doble Carne Especial",
        description: "Doble carne, pollo, queso y tocineta.",
        price: 25000,
        image: "/images/products/hamburger.jpg",
        featured: false,

        ingredients: [
            { id: "1", name: "Pan" },
            { id: "2", name: "2 Carnes 120 gr" },
            { id: "3", name: "Pollo desmechado" },
            { id: "4", name: "Queso" },
            { id: "5", name: "Tocineta" },
            { id: "6", name: "Lechuga" },
            { id: "7", name: "Tomate" },
        ],

        extras: burgerExtras,
    },

    {
        id: "12",
        categoryId: "1",
        name: "Hamburguesa Ranchera",
        description: "Carne, pollo, chorizo, huevo y queso.",
        price: 25000,
        image: "/images/products/hamburger.jpg",
        featured: false,

        ingredients: [
            { id: "1", name: "Pan" },
            { id: "2", name: "Carne 120 gr" },
            { id: "3", name: "Pollo desmechado" },
            { id: "4", name: "Chorizo" },
            { id: "5", name: "Huevo" },
            { id: "6", name: "Queso" },
            { id: "7", name: "Lechuga" },
        ],

        extras: burgerExtras,
    },

    {
        id: "13",
        categoryId: "1",
        name: "Hamburguesa Super D' Tatis",
        description: "Carne, pollo, chorizo, tocineta y queso.",
        price: 28000,
        image: "/images/products/hamburger.jpg",
        featured: false,

        ingredients: [
            { id: "1", name: "Pan" },
            { id: "2", name: "Carne 120 gr" },
            { id: "3", name: "Pollo desmechado" },
            { id: "4", name: "Chorizo" },
            { id: "5", name: "Tocineta" },
            { id: "6", name: "Queso" },
            { id: "7", name: "Lechuga" },
            { id: "8", name: "Tomate" },
        ],

        extras: burgerExtras,
    },

    {
        id: "14",
        categoryId: "1",
        name: "Hamburguesa La 10",
        description: "La hamburguesa insignia de la casa.",
        price: 33000,
        image: "/images/products/hamburger.jpg",
        featured: true,

        ingredients: [
            { id: "1", name: "Pan" },
            { id: "2", name: "Doble carne 120 gr" },
            { id: "3", name: "Pollo desmechado" },
            { id: "4", name: "Chorizo" },
            { id: "5", name: "Tocineta" },
            { id: "6", name: "Huevo" },
            { id: "7", name: "Queso" },
            { id: "8", name: "Lechuga" },
            { id: "9", name: "Tomate" },
        ],

        extras: burgerExtras,
    },

    {
        id: "8",
        categoryId: "1",
        name: "Choriburguer",
        description: "Carne, chorizo y queso.",
        price: 23000,
        image: "/images/products/hamburger.jpg",
        featured: false,

        ingredients: [
            { id: "1", name: "Pan" },
            { id: "2", name: "Carne 120 gr" },
            { id: "3", name: "Chorizo" },
            { id: "4", name: "Queso" },
            { id: "5", name: "Lechuga" },
            { id: "6", name: "Tomate" },
        ],

        extras: burgerExtras,
    },
    {
        id: "4",
        categoryId: "1",
        name: "Hamburguesa Sencilla",
        description: "Carne de res, queso y vegetales.",
        price: 17000,
        image: "/images/products/hamburger.jpg",
        featured: false,

        ingredients: [
            { id: "1", name: "Pan" },
            { id: "2", name: "Carne 120 gr" },
            { id: "3", name: "Queso" },
            { id: "4", name: "Lechuga" },
            { id: "5", name: "Tomate" },
            { id: "6", name: "Salsa de la casa" },
        ],

        extras: burgerExtras,
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
        id: "15",
        categoryId: "2",
        name: "Perro Sencillo",
        description: "Salchicha premium, queso y papa ripio.",
        price: 12000,
        image: "/images/products/hotdog.jpg",
        featured: false,

        ingredients: [
            { id: "1", name: "Pan" },
            { id: "2", name: "Salchicha Premium" },
            { id: "3", name: "Queso" },
            { id: "4", name: "Papa Ripio" },
            { id: "5", name: "Salsas de la casa" },
        ],

        extras: hotdogExtras,
    },

    {
        id: "16",
        categoryId: "2",
        name: "Perro Americano",
        description: "Salchicha premium, queso mozzarella y papa ripio.",
        price: 14000,
        image: "/images/products/hotdog.jpg",
        featured: false,

        ingredients: [
            { id: "1", name: "Pan" },
            { id: "2", name: "Salchicha Premium" },
            { id: "3", name: "Queso Mozzarella" },
            { id: "4", name: "Papa Ripio" },
            { id: "5", name: "Salsas de la casa" },
        ],

        extras: hotdogExtras,
    },

    {
        id: "17",
        categoryId: "2",
        name: "Choriperro",
        description: "Chorizo artesanal, queso y papa ripio.",
        price: 14000,
        image: "/images/products/hotdog.jpg",
        featured: false,

        ingredients: [
            { id: "1", name: "Pan" },
            { id: "2", name: "Chorizo" },
            { id: "3", name: "Queso" },
            { id: "4", name: "Papa Ripio" },
            { id: "5", name: "Salsas de la casa" },
        ],

        extras: hotdogExtras,
    },

    {
        id: "18",
        categoryId: "2",
        name: "Perro Americano Especial",
        description: "Salchicha premium, tocineta, queso y papa ripio.",
        price: 18000,
        image: "/images/products/hotdog.jpg",
        featured: false,

        ingredients: [
            { id: "1", name: "Pan" },
            { id: "2", name: "Salchicha Premium" },
            { id: "3", name: "Tocineta" },
            { id: "4", name: "Queso Mozzarella" },
            { id: "5", name: "Papa Ripio" },
            { id: "6", name: "Salsas de la casa" },
        ],

        extras: hotdogExtras,
    },
    {
        id: "19",
        categoryId: "2",
        name: "Choriperro Especial",
        description: "Chorizo, tocineta, queso y papa ripio.",
        price: 18000,
        image: "/images/products/hotdog.jpg",
        featured: false,

        ingredients: [
            { id: "1", name: "Pan" },
            { id: "2", name: "Chorizo" },
            { id: "3", name: "Tocineta" },
            { id: "4", name: "Queso Mozzarella" },
            { id: "5", name: "Papa Ripio" },
            { id: "6", name: "Salsas de la casa" },
        ],

        extras: hotdogExtras,
    },

    {
        id: "20",
        categoryId: "2",
        name: "Perro Criollo",
        description: "Salchicha premium, chorizo, queso y tocineta.",
        price: 21000,
        image: "/images/products/hotdog.jpg",
        featured: false,

        ingredients: [
            { id: "1", name: "Pan" },
            { id: "2", name: "Salchicha Premium" },
            { id: "3", name: "Chorizo" },
            { id: "4", name: "Queso" },
            { id: "5", name: "Tocineta" },
            { id: "6", name: "Papa Ripio" },
            { id: "7", name: "Salsas de la casa" },
        ],

        extras: hotdogExtras,
    },

    {
        id: "21",
        categoryId: "2",
        name: "Megaperro",
        description: "La especialidad de la casa con doble proteína.",
        price: 28000,
        image: "/images/products/hotdog.jpg",
        featured: true,

        ingredients: [
            { id: "1", name: "Pan" },
            { id: "2", name: "Salchicha Premium" },
            { id: "3", name: "Chorizo" },
            { id: "4", name: "Tocineta" },
            { id: "5", name: "Queso Mozzarella" },
            { id: "6", name: "Papa Ripio" },
            { id: "7", name: "Salsas de la casa" },
        ],

        extras: hotdogExtras,
    },

    {
        id: "22",
        categoryId: "3",
        name: "Burrito Especial",
        description: "Carne, pollo, queso, verduras y salsa de la casa.",
        price: 23000,
        image: "/images/products/burrito.jpg",
        featured: false,
    },

    {
        id: "23",
        categoryId: "4",
        name: "Papa Especial",
        description: "Papa francesa, carne, pollo, queso y tocineta.",
        price: 26000,
        image: "/images/products/fries.jpg",
        featured: false,
    },

    {
        id: "24",
        categoryId: "5",
        name: "Churrasco",
        description: "300 gr de carne acompañada de papa francesa y ensalada.",
        price: 35000,
        image: "/images/products/meat.jpg",
        featured: false,
    },

    {
        id: "25",
        categoryId: "5",
        name: "Punta de Anca",
        description: "300 gr de punta de anca con papa francesa y ensalada.",
        price: 38000,
        image: "/images/products/meat.jpg",
        featured: false,
    },

    {
        id: "26",
        categoryId: "5",
        name: "Costillas BBQ",
        description: "Costillas bañadas en salsa BBQ con papa francesa.",
        price: 36000,
        image: "/images/products/meat.jpg",
        featured: false,
    },

    {
        id: "27",
        categoryId: "6",
        name: "Coca-Cola 400 ml",
        description: "Bebida gaseosa.",
        price: 5000,
        image: "/images/products/drink.jpg",
        featured: false,
    },

    {
        id: "28",
        categoryId: "6",
        name: "Colombiana 400 ml",
        description: "Bebida gaseosa.",
        price: 5000,
        image: "/images/products/drink.jpg",
        featured: false,
    },

    {
        id: "29",
        categoryId: "6",
        name: "Sprite 400 ml",
        description: "Bebida gaseosa.",
        price: 5000,
        image: "/images/products/drink.jpg",
        featured: false,
    },

    {
        id: "30",
        categoryId: "6",
        name: "Agua",
        description: "Agua embotellada.",
        price: 4000,
        image: "/images/products/drink.jpg",
        featured: false,
    },

    {
        id: "3",
        categoryId: "2",
        name: "Perro Especial",
        description: "Salchicha premium y queso",
        price: 18000,
        image: "/images/products/hotdog.jpg",
        featured: false,

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