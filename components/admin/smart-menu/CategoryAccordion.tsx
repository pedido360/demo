"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";

import { MenuCategory } from "@/types/menu";
import { Product } from "@/types/product";

import ProductRow from "./ProductRow";
import CategoryHeader from "./CategoryHeader";

interface CategoryAccordionProps {
    group: MenuCategory;
    onProductClick: (product: Product) => void;
    onToggleProduct: (id: string) => void;
    onCreateProduct?: (categoryId: string) => void;
    onEditCategory?: (
        category: MenuCategory["category"]
    ) => void;
    onDeleteCategory?: (
        categoryId: string
    ) => void;
}

export default function CategoryAccordion({
    group,
    onProductClick,
    onToggleProduct,
    onCreateProduct,
    onEditCategory,
    onDeleteCategory,
}: CategoryAccordionProps) {

    const [open, setOpen] = useState(true);

    return (

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

            <CategoryHeader
                category={group.category}
                productCount={group.products.length}
                open={open}
                onToggle={() => setOpen(!open)}
                onEdit={() =>
                    onEditCategory?.(
                        group.category
                    )
                }
                onDelete={() =>
                    onDeleteCategory?.(
                        group.category.id
                    )
                }
            />

            {open && (

                <div className="border-t bg-gray-50 p-3">

                    <div className="mb-3 flex justify-end">

                        <Button
                            size="sm"
                            onClick={() =>
                                onCreateProduct?.(
                                    group.category.id
                                )
                            }
                        >
                            + Nuevo producto
                        </Button>

                    </div>

                    <div className="space-y-2">

                        {group.products.length === 0 ? (

                            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">

                                Esta categoría aún no tiene productos.

                            </div>

                        ) : (

                            group.products.map((product) => (

                                <ProductRow
                                    key={product.id}
                                    product={product}
                                    onClick={() =>
                                        onProductClick(product)
                                    }
                                    onToggle={onToggleProduct}
                                />

                            ))

                        )}

                    </div>

                </div>

            )}

        </div>

    );

}