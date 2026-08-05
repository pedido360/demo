"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";

import { Ingredient } from "@/types/product";

interface IngredientSectionProps {
    ingredients: Ingredient[];
    onDelete: (id: string) => void;
    onAdd: (name: string) => void;
    onToggle: (id: string) => void;
}

export default function IngredientSection({
    ingredients,
    onDelete,
    onAdd,
    onToggle,
}: IngredientSectionProps) {

    const [isAdding, setIsAdding] =
        useState(false);

    const [name, setName] =
        useState("");

    function handleAdd() {

        if (!name.trim()) {
            return;
        }

        onAdd(name.trim());

        setName("");

        setIsAdding(false);

    }

    return (

        <section className="rounded-xl border border-gray-200 p-6">

            <h2 className="mb-5 text-lg font-semibold">
                🥬 Ingredientes
            </h2>

            {ingredients.length === 0 ? (

                <p className="text-sm text-gray-500">
                    Este producto no tiene ingredientes.
                </p>

            ) : (

                <div className="space-y-3">

                    {ingredients.map((ingredient) => (

                        <div
                            key={ingredient.id}
                            className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
                        >

                            <span
                                className={
                                    ingredient.isActive
                                        ? "font-medium text-gray-900"
                                        : "font-medium text-gray-500"
                                }
                            >
                                {ingredient.name}
                            </span>

                            <div className="flex items-center gap-3">

                                <button
                                    type="button"
                                    onClick={() => onToggle(ingredient.id)}
                                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${ingredient.isActive
                                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                        }`}
                                >
                                    {ingredient.isActive
                                        ? "🟢 Activo"
                                        : "⚪ Inactivo"}
                                </button>

                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => onDelete(ingredient.id)}
                                >
                                    Eliminar
                                </Button>

                            </div>

                        </div>

                    ))}

                </div>

            )}

            {!isAdding ? (

                <div className="mt-6">

                    <Button
                        variant="outline"
                        onClick={() =>
                            setIsAdding(true)
                        }
                    >
                        ➕ Agregar ingrediente
                    </Button>

                </div>

            ) : (

                <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-4">

                    <label className="mb-2 block text-sm font-medium">

                        Nombre del ingrediente

                    </label>

                    <input
                        className="w-full rounded-lg border border-gray-300 p-3"
                        value={name}
                        onChange={(event) =>
                            setName(event.target.value)
                        }
                        placeholder="Ej: Tocineta"
                    />

                    <div className="mt-4 flex justify-end gap-2">

                        <Button
                            variant="outline"
                            onClick={() => {

                                setName("");

                                setIsAdding(false);

                            }}
                        >
                            Cancelar
                        </Button>

                        <Button
                            onClick={handleAdd}
                        >
                            Guardar
                        </Button>

                    </div>

                </div>

            )}

        </section>

    );

}