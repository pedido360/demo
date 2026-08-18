"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

import { Category } from "@/types/category";

interface CategoriesProps {
    categories: Category[];
    selectedCategory: string;
    onSelectCategory: (categoryId: string) => void;
}

export default function Categories({
    categories,
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
        <section
            id="menu"
            className="w-full px-4 py-5"
        >
            <div className="mb-4 flex items-center justify-between">

                <button
                    type="button"
                    onClick={() => scroll("left")}
                    className="hidden h-9 w-9 items-center justify-center rounded-full bg-white shadow md:flex"
                    aria-label="Categorías anteriores"
                >
                    <ChevronLeft size={18} />
                </button>

                <h2 className="text-lg font-bold">
                    Categorías
                </h2>

                <button
                    type="button"
                    onClick={() => scroll("right")}
                    className="hidden h-9 w-9 items-center justify-center rounded-full bg-white shadow md:flex"
                    aria-label="Más categorías"
                >
                    <ChevronRight size={18} />
                </button>

            </div>

            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto pb-3"
                style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}
            >
                {categories.map((category) => {
                    const active =
                        selectedCategory === category.id;

                    return (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() =>
                                onSelectCategory(category.id)
                            }
                            className="flex w-24 shrink-0 flex-col items-center"
                        >
                            <div
                                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl shadow transition-all duration-300 ${active
                                        ? "bg-red-600 text-white"
                                        : "bg-white hover:shadow-lg"
                                    }`}
                            >
                                {category.emoji}
                            </div>

                            <span
                                className={`mt-2 w-full truncate text-center text-sm ${active
                                        ? "font-semibold text-red-600"
                                        : "text-gray-700"
                                    }`}
                                title={category.name}
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