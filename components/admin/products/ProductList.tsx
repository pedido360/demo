'use client';

import { Category } from '@/types/category';
import { Product } from '@/types/product';

import ProductItem from './ProductItem';

interface ProductListProps {
    products: Product[];
    categories: Category[];
    onEdit: (product: Product) => void;
    onDelete: (id: string) => void;
}

export default function ProductList({
    products,
    categories,
    onEdit,
    onDelete,
}: ProductListProps) {
    if (products.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-10 text-center">
                <h3 className="text-lg font-semibold">
                    No hay productos
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                    Crea tu primer producto para comenzar a vender.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {products.map((product) => (
                <ProductItem
                    key={product.id}
                    product={product}
                    category={categories.find(
                        (category) => category.id === product.categoryId
                    )}
                    onEdit={() => onEdit(product)}
                    onDelete={() => onDelete(product.id)}
                />
            ))}
        </div>
    );
}