export type DailyMenuSection =
    | "soup"
    | "seco"
    | "principle"
    | "protein"
    | "drink"
    | "dessert";


export interface DailyMenuOption {

    id: string;

    restaurantId: string;

    section: DailyMenuSection;

    name: string;

    isActive: boolean;

    sortOrder: number;

    createdAt: string;

}


export interface DailyMenuItem {

    id: string;

    dailyMenuId: string;

    optionId: string;

    section: DailyMenuSection;

    sortOrder: number;

}


export interface DailyMenuSize {

    id: string;

    dailyMenuId: string;

    label: string;

    price: number;

    isAvailable: boolean;

    sortOrder: number;

}


export interface DailyMenu {

    id: string;

    restaurantId: string;

    menuProductId: string;

    menuDate: string;

    isPublished: boolean;

    createdAt: string;

    updatedAt: string;

    items: DailyMenuItem[];

    sizes: DailyMenuSize[];

}


export interface DailyMenuClientOption {

    id: string;

    section: DailyMenuSection;

    name: string;

    sortOrder: number;

}


export interface DailyMenuClient {

    id: string;

    restaurantId: string;

    menuProductId: string;

    menuDate: string;

    isPublished: boolean;

    sizes: DailyMenuSize[];

    options: DailyMenuClientOption[];

}