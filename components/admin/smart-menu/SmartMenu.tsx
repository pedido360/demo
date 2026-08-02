"use client";

import { useMemo, useState } from "react";

import { Category } from "@/types/category";
import { Product } from "@/types/product";

import { buildMenu } from "@/lib/services/menu.service";

import SearchBar from "./SearchBar";
import CategoryAccordion from "./CategoryAccordion";
import ProductEditor from "./ProductEditor";

interface SmartMenuProps {
    categories: Category[];
    products: Product[];
}

export default function SmartMenu({
    categories,
    products,
}: SmartMenuProps) {

    const [selectedProduct, setSelectedProduct] =
        useState<Product | null>(null);

    const [search, setSearch] = useState("");

    const filteredProducts = useMemo(() => {

        if (!search.trim()) {
            return products;
        }

        const value = search.toLowerCase();

        return products.filter(product =>
            product.name.toLowerCase().includes(value)
        );

    }, [products, search]);

    const menu = useMemo(
        () => buildMenu(categories, filteredProducts),
        [categories, filteredProducts]
    );

    if (selectedProduct) {

        return (
            <ProductEditor
                product={selectedProduct}
                categories={categories}
                onSave={() => { }}
                onDelete={() => { }}
                onClose={() => setSelectedProduct(null)}
            />
        );

    }

    return (

        <section className="overflow-hidden rounded-2xl border border-orange-200 bg-orange-50">

            <div className="border-b border-orange-200 bg-orange-100 px-6 py-5">

                <h2 className="text-2xl font-bold text-orange-700">
                    🍔 Smart Menu
                </h2>

                <p className="mt-1 text-sm text-orange-600">
                    Administra categorías, productos, ingredientes y extras desde un solo lugar.
                </p>

                <div className="mt-3 flex flex-wrap gap-6 text-sm">

                    <span className="font-medium text-orange-700">
                        📂 {categories.length} categorías
                    </span>

                    <span className="font-medium text-orange-700">
                        🍽️ {products.length} productos
                    </span>

                </div>

            </div>

            <div className="space-y-5 p-6">

                <SearchBar
                    value={search}
                    onChange={setSearch}
                />

                {menu.map(group => (

                    <CategoryAccordion
                        key={group.category.id}
                        group={group}
                        onProductClick={setSelectedProduct}
                    />

                ))}

            </div>

        </section>

    );

}