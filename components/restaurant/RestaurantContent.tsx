"use client";

import { useState } from "react";

import RestaurantHero from "./RestaurantHero";
import FeaturedProducts from "./FeaturedProducts";
import Categories from "./Categories";
import CallToAction from "./CallToAction";

import ProductGrid from "@/components/products/ProductGrid";

import FloatingCartButton from "@/components/cart/FloatingCartButton";
import CartDrawer from "@/components/cart/CartDrawer";

export default function RestaurantContent() {
    const [selectedCategory, setSelectedCategory] = useState("1");
    const [cartOpen, setCartOpen] = useState(false);

    return (
        <>
            <RestaurantHero />

            <FeaturedProducts />

            <Categories
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
            />

            {/* <ProductGrid selectedCategory={selectedCategory} /> */}

            <CallToAction />

            <FloatingCartButton onClick={() => setCartOpen(true)} />

            <CartDrawer
                open={cartOpen}
                onClose={() => setCartOpen(false)}
            />
        </>
    );
}