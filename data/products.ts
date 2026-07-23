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
        id: "2",
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
        id: "3",
        categoryId: "1",
        name: "Hamburguesa del Campo",
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
        id: "4",
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
        id: "5",
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
        id: "6",
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
        id: "7",
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
        id: "8",
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
        id: "9",
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
        id: "10",
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
        id: "11",
        categoryId: "3",
        name: "Burrito Especial",
        description: "Carne, pollo, queso, verduras y salsa de la casa.",
        price: 23000,
        image: "/images/products/burrito.jpg",
        featured: false,
    },

    {
        id: "12",
        categoryId: "3",
        name: "Burrito Clásico",
        description: "Carne de res, arroz, frijoles, queso cheddar y salsa especial.",
        price: 20000,
        image: "/images/products/burrito.jpg",
        featured: false,

        ingredients: [
            { id: "1", name: "Tortilla de Trigo" },
            { id: "2", name: "Carne de Res" },
            { id: "3", name: "Arroz" },
            { id: "4", name: "Frijoles" },
            { id: "5", name: "Queso Cheddar" },
            { id: "6", name: "Salsa Especial" },
        ],
    },

    {
        id: "13",
        categoryId: "3",
        name: "Burrito BBQ",
        description: "Pollo desmechado, queso cheddar, cebolla caramelizada y salsa BBQ.",
        price: 22000,
        image: "/images/products/burrito.jpg",
        featured: false,

        ingredients: [
            { id: "1", name: "Tortilla de Trigo" },
            { id: "2", name: "Pollo Desmechado" },
            { id: "3", name: "Queso Cheddar" },
            { id: "4", name: "Cebolla Caramelizada" },
            { id: "5", name: "Salsa BBQ" },
        ],
    },

    {
        id: "14",
        categoryId: "3",
        name: "Burrito Mexicano",
        description: "Carne de res, jalapeños, guacamole, queso cheddar y vegetales frescos.",
        price: 23000,
        image: "/images/products/burrito.jpg",
        featured: false,

        ingredients: [
            { id: "1", name: "Tortilla de Trigo" },
            { id: "2", name: "Carne de Res" },
            { id: "3", name: "Jalapeños" },
            { id: "4", name: "Guacamole" },
            { id: "5", name: "Queso Cheddar" },
            { id: "6", name: "Lechuga" },
        ],
    },

    {
        id: "15",
        categoryId: "3",
        name: "Burrito Ranchero",
        description: "Pollo desmechado, chorizo artesanal, queso cheddar y salsa especial.",
        price: 24000,
        image: "/images/products/burrito.jpg",
        featured: false,

        ingredients: [
            { id: "1", name: "Tortilla de Trigo" },
            { id: "2", name: "Pollo Desmechado" },
            { id: "3", name: "Chorizo Artesanal" },
            { id: "4", name: "Queso Cheddar" },
            { id: "5", name: "Salsa Especial" },
        ],
    },


    {
        id: "17",
        categoryId: "4",
        name: "Papa Especial",
        description: "Papa francesa, carne, pollo, queso y tocineta.",
        price: 26000,
        image: "/images/products/fries.jpg",
        featured: false,
    },

    {
        id: "18",
        categoryId: "4",
        name: "Papas BBQ",
        description: "Papas francesas con pollo desmechado, salsa BBQ y queso cheddar.",
        price: 18000,
        image: "/images/products/fries.jpg",
        featured: false,
    },

    {
        id: "19",
        categoryId: "4",
        name: "Papas con Tocineta",
        description: "Papas francesas, tocineta crocante, queso cheddar y salsa especial.",
        price: 19000,
        image: "/images/products/fries.jpg",
        featured: false,
    },


    {
        id: "20",
        categoryId: "4",
        name: "Papas Mixtas",
        description: "Papas francesas con carne de res, pollo desmechado, queso cheddar y salsas.",
        price: 22000,
        image: "/images/products/fries.jpg",
        featured: false,
    },





    {
        id: "21",
        categoryId: "5",
        name: "Churrasco",
        description: "300 gr de carne acompañada de papa francesa y ensalada.",
        price: 35000,
        image: "/images/products/meat.jpg",
        featured: false,
    },

    {
        id: "22",
        categoryId: "5",
        name: "Punta de Anca",
        description: "300 gr de punta de anca con papa francesa y ensalada.",
        price: 38000,
        image: "/images/products/meat.jpg",
        featured: false,
    },

    {
        id: "23",
        categoryId: "5",
        name: "Costillas BBQ",
        description: "Costillas bañadas en salsa BBQ con papa francesa.",
        price: 36000,
        image: "/images/products/meat.jpg",
        featured: false,
    },

    {
        id: "24",
        categoryId: "5",
        name: "Pechuga a la Parrilla",
        description: "Pechuga de pollo a la parrilla con papas francesas, ensalada fresca y salsa especial.",
        price: 32000,
        image: "/images/products/meat.jpg",
        featured: false,
    },

    {
        id: "25",
        categoryId: "5",
        name: "Lomo de Cerdo",
        description: "Lomo de cerdo a la parrilla acompañado de papas francesas, ensalada y salsa de la casa.",
        price: 34000,
        image: "/images/products/meat.jpg",
        featured: true,
    },





    {
        id: "26",
        categoryId: "6",
        name: "Coca-Cola 400 ml",
        description: "Bebida gaseosa.",
        price: 5000,
        image: "/images/products/drink.jpg",
        featured: false,
    },

    {
        id: "27",
        categoryId: "6",
        name: "Colombiana 400 ml",
        description: "Bebida gaseosa.",
        price: 5000,
        image: "/images/products/drink.jpg",
        featured: false,
    },

    {
        id: "28",
        categoryId: "6",
        name: "Sprite 400 ml",
        description: "Bebida gaseosa.",
        price: 5000,
        image: "/images/products/drink.jpg",
        featured: false,
    },

    {
        id: "29",
        categoryId: "6",
        name: "Agua",
        description: "Agua embotellada.",
        price: 4000,
        image: "/images/products/drink.jpg",
        featured: false,
    },

    {
        id: "30",
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