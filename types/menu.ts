import { Category } from "./category";
import { Product } from "./product";

export interface MenuCategory {

    category: Category;

    products: Product[];

}

export interface MenuStats {

    totalCategories: number;

    totalProducts: number;

    activeProducts: number;

    pausedProducts: number;

    productsWithoutImage: number;

    productsWithoutIngredients: number;

    productsWithoutExtras: number;

}