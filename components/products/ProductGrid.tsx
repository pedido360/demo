"use client";

import { useState } from "react";

import { Product } from "@/types/product";

import ProductCard from "./ProductCard";
import ProductDrawer from "@/components/product/ProductDrawer";
import { useCart } from "@/hooks/useCart";

import {
    WEDNESDAY_PROMOTION_PRODUCT_ID,
    isWednesdayPromotionActive,
} from "@/lib/utils/isWednesdayPromotionActive";

interface ProductGridProps {
    products: Product[];
    selectedCategory: string;
    searchActive?: boolean;
}

export default function ProductGrid({
    products,
    selectedCategory,
    searchActive = false,
}: ProductGridProps) {
    const [selectedProduct, setSelectedProduct] =
        useState<Product | null>(null);

    const [drawerOpen, setDrawerOpen] =
        useState(false);

    const { addToCart } = useCart();

    const filteredProducts = searchActive
        ? products
        : products.filter(
            (product) =>
                product.categoryId === selectedCategory
        );

    function handleSelectProduct(product: Product) {
        setSelectedProduct(product);
        setDrawerOpen(true);
    }

    return (
        <>
            <section className="w-full px-4 py-6">

                <h2 className="mb-5 text-2xl font-bold text-gray-900">
                    {searchActive
                        ? "Resultados de búsqueda"
                        : "Productos"}
                </h2>

                {searchActive &&
                    filteredProducts.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                            <p className="text-lg font-semibold text-gray-700">
                                😕 No encontramos productos
                            </p>

                            <p className="mt-2 text-sm text-gray-500">
                                Intenta buscar con otro nombre.
                            </p>
                        </div>
                    )}

                <div className="space-y-3">

                    {filteredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onSelect={handleSelectProduct}
                        />
                    ))}

                </div>

            </section>

            <ProductDrawer
                product={selectedProduct}
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                onAdd={(selection) => {

                    if (
                        selection.product.id ===
                        WEDNESDAY_PROMOTION_PRODUCT_ID
                    ) {

                        if (
                            !isWednesdayPromotionActive()
                        ) {

                            alert(
                                "⏰ Esta promoción está disponible los miércoles después de las 2:00 P.M. No está disponible en enero ni diciembre."
                            );

                            return;
                        }

                    }

                    addToCart(selection);

                    setDrawerOpen(false);
                }}
            />
        </>
    );
}