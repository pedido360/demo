export interface ExtraCatalogItem {

    id: string;

    restaurantId: string;

    name: string;

    price: number;

    isActive: boolean;

    sortOrder: number;

}


export interface ExtraGroup {

    id: string;

    restaurantId: string;

    name: string;

    isActive: boolean;

    sortOrder: number;

}


export interface ExtraGroupItem {

    groupId: string;

    extraId: string;

    sortOrder: number;

}


export interface ProductExtraGroup {

    productId: string;

    groupId: string;

    sortOrder: number;

}
