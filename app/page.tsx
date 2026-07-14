"use client";

import { useState } from "react";

import Hero from "@/components/landing/Hero";
import Categories from "@/components/landing/Categories";
import ProductGrid from "@/components/products/ProductGrid";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("1");

  return (
    <>
      <Hero />

      <Categories
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <ProductGrid
        selectedCategory={selectedCategory}
      />
    </>
  );
}