"use client";

import { Ingredient } from "@/types/product";
import { Check } from "lucide-react";

interface IngredientSelectorProps {
    ingredients: Ingredient[];
    selectedIngredients: string[];
    onToggle: (ingredientId: string) => void;
}

export default function IngredientSelector({
    ingredients,
    selectedIngredients,
    onToggle,
}: IngredientSelectorProps) {
    if (!ingredients.length) return null;

    return (
        <section className="mt-8">

            <h3 className="text-lg font-bold">
                Ingredientes
            </h3>

            <p className="text-sm text-gray-500 mt-1 mb-4">
                Desmarca los ingredientes que no deseas.
            </p>

            <div className="space-y-3">

                {ingredients.map((ingredient) => {

                    const checked = selectedIngredients.includes(ingredient.id);

                    return (
                        <button
                            key={ingredient.id}
                            type="button"
                            onClick={() => onToggle(ingredient.id)}
                            className="w-full flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-red-500"
                        >

                            <span className="font-medium">
                                {ingredient.name}
                            </span>

                            <div
                                className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition ${checked
                                        ? "border-red-600 bg-red-600 text-white"
                                        : "border-gray-300"
                                    }`}
                            >
                                {checked && <Check size={16} />}
                            </div>

                        </button>
                    );

                })}

            </div>

        </section>
    );
}