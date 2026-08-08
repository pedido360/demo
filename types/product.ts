import { ProductVariant } from "./product-variant";

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

    // Variantes del producto (opcional)
    variants?: ProductVariant[];
}

export interface ProductSelection {

    product: Product;

    variant?: ProductVariant;

    quantity: number;

    ingredients: Ingredient[];

    extras: Extra[];

    notes?: string;

}