"use client";

import { useState } from "react";
import {
    ChevronDown,
    ChevronRight,
} from "lucide-react";

import { MenuCategory } from "@/types/menu";
import { Product } from "@/types/product";

import ProductRow from "./ProductRow";

interface CategoryAccordionProps {
    group: MenuCategory;
    onProductClick: (product: Product) => void;
}

export default function CategoryAccordion({
    group,
    onProductClick,
}: CategoryAccordionProps) {

    const [open, setOpen] = useState(true);

    return (

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between px-5 py-4 hover:bg-gray-50"
            >

                <div className="flex items-center gap-3">

                    <span className="text-2xl">
                        {group.category.emoji}
                    </span>

                    <div className="text-left">

                        <h2 className="font-semibold">
                            {group.category.name}
                        </h2>

                        <p className="text-sm text-gray-500">
                            {group.products.length} productos
                        </p>

                    </div>

                </div>

                {open ? (
                    <ChevronDown size={20} />
                ) : (
                    <ChevronRight size={20} />
                )}

            </button>

            {open && (

                <div className="space-y-2 border-t bg-gray-50 p-3">

                    {group.products.length === 0 ? (

                        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">

                            Esta categoría aún no tiene productos.

                        </div>

                    ) : (

                        group.products.map((product) => (

                            <ProductRow
                                key={product.id}
                                product={product}
                                onClick={() => onProductClick(product)}
                            />

                        ))

                    )}

                </div>

            )}

        </div>

    );

}