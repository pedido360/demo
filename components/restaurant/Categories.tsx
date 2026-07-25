"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

import { categories } from "@/data/categories";

interface CategoriesProps {
    selectedCategory: string;
    onSelectCategory: (categoryId: string) => void;
}

export default function Categories({
    selectedCategory,
    onSelectCategory,
}: CategoriesProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    function scroll(direction: "left" | "right") {
        scrollRef.current?.scrollBy({
            left: direction === "left" ? -220 : 220,
            behavior: "smooth",
        });
    }

    return (
        <section className="w-full px-4 py-5">

            <div className="mb-4 flex items-center justify-between">

                <button
                    onClick={() => scroll("left")}
                    className="hidden h-9 w-9 items-center justify-center rounded-full bg-white shadow md:flex"
                >
                    <ChevronLeft size={18} />
                </button>

                <h2 className="text-lg font-bold">
                    Categorías
                </h2>

                <button
                    onClick={() => scroll("right")}
                    className="hidden h-9 w-9 items-center justify-center rounded-full bg-white shadow md:flex"
                >
                    <ChevronRight size={18} />
                </button>

            </div>

            <div
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto pb-2"
                style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}
            >
                {categories.map((category) => {
                    const active = selectedCategory === category.id;

                    return (
                        <button
                            key={category.id}
                            onClick={() => onSelectCategory(category.id)}
                            className="flex min-w-[84px] flex-col items-center"
                        >
                            <div
                                className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl shadow transition-all duration-300 ${active
                                        ? "bg-red-600 text-white"
                                        : "bg-white hover:shadow-lg"
                                    }`}
                            >
                                {category.icon}
                            </div>

                            <span
                                className={`mt-2 text-sm ${active
                                        ? "font-semibold text-red-600"
                                        : "text-gray-700"
                                    }`}
                            >
                                {category.name}
                            </span>
                        </button>
                    );
                })}
            </div>

        </section>
    );
}