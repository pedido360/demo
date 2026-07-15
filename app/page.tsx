"use client";

import { useState } from "react";

import Hero from "@/components/landing/Hero";
import FeaturedProducts from "@/components/landing/FeaturedProducts";
import Categories from "@/components/landing/Categories";
import ProductGrid from "@/components/products/ProductGrid";
import FloatingCartButton from "@/components/cart/FloatingCartButton";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("1");

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
          onClick={() => {
            console.log("Abrir carrito");
          }}
        />

      </div>
    </main>
  );
}