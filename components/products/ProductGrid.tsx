"use client";

import { useState } from "react";

import { products } from "@/data/products";
import { Product } from "@/types/product";

import ProductCard from "./ProductCard";
import ProductDrawer from "@/components/product/ProductDrawer";
import { useCart } from "@/hooks/useCart";

interface ProductGridProps {
    selectedCategory: string;
}

export default function ProductGrid({
    selectedCategory,
}: ProductGridProps) {

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
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
            <section className="max-w-md mx-auto px-5 py-6">

                <h2 className="text-2xl font-bold mb-6">
                    Productos
                </h2>

                <div className="space-y-4">

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