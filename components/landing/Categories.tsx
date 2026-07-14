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

    const scroll = (direction: "left" | "right") => {
        scrollRef.current?.scrollBy({
            left: direction === "left" ? -220 : 220,
            behavior: "smooth",
        });
    };

    return (
        <section className="max-w-md mx-auto px-5 py-5">

            <div className="flex items-center justify-between mb-4">

                <button
                    onClick={() => scroll("left")}
                    className="hidden md:flex w-9 h-9 rounded-full bg-white shadow items-center justify-center"
                >
                    <ChevronLeft size={18} />
                </button>

                <h2 className="font-bold text-lg">
                    Categorías
                </h2>

                <button
                    onClick={() => scroll("right")}
                    className="hidden md:flex w-9 h-9 rounded-full bg-white shadow items-center justify-center"
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
                            className="flex flex-col items-center min-w-[85px]"
                        >
                            <div
                                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow transition-all
                  ${active
                                        ? "bg-red-600 text-white"
                                        : "bg-white hover:shadow-lg"
                                    }`}
                            >
                                {category.icon}
                            </div>

                            <span
                                className={`text-sm mt-2 ${active ? "font-bold text-red-600" : ""
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