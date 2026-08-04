"use client";

import { useState } from "react";

import { Product } from "@/types/product";

import ProductCard from "./ProductCard";
import ProductDrawer from "@/components/product/ProductDrawer";
import { useCart } from "@/hooks/useCart";

interface ProductGridProps {
    products: Product[];
    selectedCategory: string;
}

export default function ProductGrid({
    products,
    selectedCategory,
}: ProductGridProps) {
    const [selectedProduct, setSelectedProduct] =
        useState<Product | null>(null);

    const [drawerOpen, setDrawerOpen] =
        useState(false);

    const { addToCart } = useCart();

    const filteredProducts = products.filter(
        (product) => product.categoryId === selectedCategory
    );

    function handleSelectProduct(product: Product) {
        setSelectedProduct(product);
        setDrawerOpen(true);
    }

    return (
        <>
            <section className="w-full px-4 py-6">
                <h2 className="mb-5 text-2xl font-bold text-gray-900">
                    Productos
                </h2>

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
                    addToCart(selection);
                    setDrawerOpen(false);
                }}
            />
        </>
    );
}