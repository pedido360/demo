"use client";

import { useState } from "react";

import Hero from "@/components/landing/Hero";
import FeaturedProducts from "@/components/landing/FeaturedProducts";
import Categories from "@/components/landing/Categories";
import ProductGrid from "@/components/products/ProductGrid";

import FloatingCartButton from "@/components/cart/FloatingCartButton";
import CartDrawer from "@/components/cart/CartDrawer";

export default function Home() {

  const [selectedCategory, setSelectedCategory] = useState("1");
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <main className="min-h-screen bg-gray-100">

      <div className="max-w-md mx-auto bg-white min-h-screen relative overflow-hidden">

        <Hero />

        <FeaturedProducts />

        <Categories
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <ProductGrid
          selectedCategory={selectedCategory}
        />

        <FloatingCartButton
          onClick={() => setCartOpen(true)}
        />

        <CartDrawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
        />

      </div>

    </main>
  );
}