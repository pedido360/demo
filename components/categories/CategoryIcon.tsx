"use client";

import Image from "next/image";
import type { Category } from "@/types/category";

interface CategoryIconProps {
    category: Pick<Category, "name" | "emoji">;
    size?: number;
    className?: string;
}

const GUMMY_CATEGORIES = [
    "bolsitas",
    "bandejas",
    "mix",
    "variados",
    "productos",
];

export default function CategoryIcon({
    category,
    size = 32,
    className = "",
}: CategoryIconProps) {
    const normalizedName = category.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();

    if (GUMMY_CATEGORIES.includes(normalizedName)) {
        return (
            <Image
                src="/emojigomitas.png"
                alt={`Categoría ${category.name}`}
                width={size}
                height={size}
                className={`object-contain ${className}`}
            />
        );
    }

    return <span className={className}>{category.emoji}</span>;
}
