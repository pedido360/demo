"use client";

import { useRef } from "react";

import { Category } from "@/types/category";
import CategoryIcon from "@/components/categories/CategoryIcon";

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

    return (
        <section id="menu" className="w-full px-3 py-3">
            <div
                ref={scrollRef}
                className="flex items-center gap-2 overflow-x-auto pb-1"
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
                            className={`flex w-[76px] shrink-0 flex-col items-center gap-1 rounded-xl px-1 py-1.5 transition-all duration-200 ${
                                active
                                    ? "bg-red-50 text-red-600"
                                    : "bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                            aria-pressed={active}
                            title={category.name}
                        >
                            <span
                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-sm ${
                                    active
                                        ? "bg-red-600 text-white"
                                        : "bg-gray-100"
                                }`}
                            >
                                <CategoryIcon
                                    category={category}
                                    size={30}
                                />
                            </span>

                            <span className="w-full text-center text-[11px] font-semibold leading-tight">
                                {category.name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
