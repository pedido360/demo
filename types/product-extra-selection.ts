export interface ProductExtraSelectionGroupItem {
    id: string;
    groupId: string;
    extraId: string;
    sortOrder: number;
}

export interface ProductExtraSelectionGroup {
    id: string;
    productId: string;
    name: string;
    minSelections: number;
    maxSelections: number;
    isActive: boolean;
    sortOrder: number;
    items: ProductExtraSelectionGroupItem[];
}
