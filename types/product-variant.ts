export interface ProductVariant {

    id: string;

    productId: string;

    label: string;

    price: number;

    isDefault: boolean;

    isAvailable: boolean;

    sortOrder: number;

}