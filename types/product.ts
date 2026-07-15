export interface Ingredient {
    id: string;
    name: string;
}

export interface Extra {
    id: string;
    name: string;
    price: number;
}

export interface Product {
    id: string;

    categoryId: string;

    name: string;

    description: string;

    price: number;

    image: string;

    featured: boolean;

    ingredients?: Ingredient[];

    extras?: Extra[];
}

export interface ProductSelection {
    product: Product;

    quantity: number;

    ingredients: string[];

    extras: string[];

    notes: string;
}