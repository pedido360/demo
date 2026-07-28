export interface Product {
    id: string;

    categoryId: string;

    name: string;

    description: string;

    price: number;

    image: string;

    featured: boolean;

    isAvailable: boolean;

    ingredients?: Ingredient[];

    extras?: Extra[];
}