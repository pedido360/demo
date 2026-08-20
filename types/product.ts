import { ProductVariant } from "./product-variant";
import {
    DailyMenuClientOption,
} from "./daily-menu";


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

    productType?:
    | "normal"
    | "daily_menu";

    description: string;

    price: number;

    image: string;

    imageFile?: File;

    featured: boolean;

    isAvailable?: boolean;

    ingredients?: Ingredient[];

    extras?: Extra[];

    variants?: ProductVariant[];

}


export interface DailyMenuSelection {

    size: {
        id: string;
        label: string;
        price: number;
    };

    soup?: DailyMenuClientOption;

    secos: DailyMenuClientOption[];

    principle?: DailyMenuClientOption;

    protein?: DailyMenuClientOption;

    drink?: DailyMenuClientOption;

    dessert?: DailyMenuClientOption;

    quantity: number;

    notes?: string;

}


export interface ProductSelection {

    product: Product;

    variant?: ProductVariant;

    quantity: number;

    ingredients: Ingredient[];

    extras: Extra[];

    notes?: string;

    dailyMenu?: DailyMenuSelection;

}