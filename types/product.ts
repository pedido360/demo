export interface Ingredient {
    id: string;
    name: string;
    isActive: boolean;
}

export interface Extra {
    id: string;
    name: string;
    price: number;
    isActive: boolean;
}

export interface Product {
    id: string;

    categoryId: string;

    name: string;

    description: string;

    price: number;

    image: string;

    imageFile?: File;

    featured: boolean;

    isAvailable?: boolean;

    ingredients?: Ingredient[];

    extras?: Extra[];
}

export interface ProductSelection {
    product: Product;

    quantity: number;

    ingredients: Ingredient[];

    extras: Extra[];

    notes?: string;
}