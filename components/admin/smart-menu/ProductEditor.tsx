"use client";

import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import IngredientSection from "./IngredientSection";
import ExtraSection from "./ExtraSection";

import { Category } from "@/types/category";
import {
    Ingredient,
    Product,
} from "@/types/product";

interface ProductEditorProps {
    product: Product;
    categories: Category[];

    onSave: (product: Product) => void;
    onDelete: (id: string) => void;
    onClose: () => void;
}

export default function ProductEditor({
    product,
    categories,
    onSave,
    onDelete,
    onClose,
}: ProductEditorProps) {

    const [editableProduct, setEditableProduct] =
        useState<Product>(product);

    useEffect(() => {

        setEditableProduct(product);

    }, [product]);

    function updateField<K extends keyof Product>(
        field: K,
        value: Product[K]
    ) {

        setEditableProduct(previous => ({
            ...previous,
            [field]: value,
        }));

    }

    return (

        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-orange-200 bg-white">

            <div className="border-b border-orange-200 bg-orange-50 p-6">

                <button
                    type="button"
                    onClick={onClose}
                    className="mb-4 text-sm font-medium text-orange-700 hover:underline"
                >
                    ← Volver al menú
                </button>

                <h1 className="text-2xl font-bold text-orange-700">
                    {editableProduct.name}
                </h1>

                <p className="mt-2 text-sm text-orange-600">
                    Edita la información del producto.
                </p>

            </div>

            <div className="space-y-6 p-6">

                <section className="rounded-xl border border-gray-200 p-6">

                    <h2 className="mb-6 text-lg font-semibold">
                        📝 Información General
                    </h2>

                    <div className="grid gap-6 md:grid-cols-2">

                        <div>

                            <label className="mb-2 block text-sm font-medium">
                                Nombre
                            </label>

                            <input
                                className="w-full rounded-xl border border-gray-300 p-3"
                                value={editableProduct.name}
                                onChange={(event) =>
                                    updateField(
                                        "name",
                                        event.target.value
                                    )
                                }
                            />

                        </div>

                        <div>

                            <label className="mb-2 block text-sm font-medium">
                                Precio
                            </label>

                            <input
                                type="number"
                                className="w-full rounded-xl border border-gray-300 p-3"
                                value={editableProduct.price}
                                onChange={(event) =>
                                    updateField(
                                        "price",
                                        Number(event.target.value)
                                    )
                                }
                            />

                        </div>

                    </div>

                    <div className="mt-6">

                        <label className="mb-2 block text-sm font-medium">
                            Descripción
                        </label>

                        <textarea
                            rows={4}
                            className="w-full rounded-xl border border-gray-300 p-3"
                            value={editableProduct.description}
                            onChange={(event) =>
                                updateField(
                                    "description",
                                    event.target.value
                                )
                            }
                        />

                    </div>

                    <div className="mt-6">

                        <label className="mb-2 block text-sm font-medium">
                            Categoría
                        </label>

                        <select
                            className="w-full rounded-xl border border-gray-300 p-3"
                            value={editableProduct.categoryId}
                            onChange={(event) =>
                                updateField(
                                    "categoryId",
                                    event.target.value
                                )
                            }
                        >

                            {categories.map(category => (

                                <option
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.name}
                                </option>

                            ))}

                        </select>

                    </div>

                </section>

                <IngredientSection
                    ingredients={editableProduct.ingredients ?? []}

                    onToggle={(id) => {

                        updateField(
                            "ingredients",
                            (editableProduct.ingredients ?? []).map(
                                ingredient =>
                                    ingredient.id === id
                                        ? {
                                            ...ingredient,
                                            isActive: !ingredient.isActive,
                                        }
                                        : ingredient
                            )
                        );

                    }}

                    onDelete={(id) => {

                        updateField(
                            "ingredients",
                            editableProduct.ingredients?.filter(
                                ingredient => ingredient.id !== id
                            ) ?? []
                        );

                    }}
                    onAdd={(name) => {

                        updateField(
                            "ingredients",
                            [
                                ...(editableProduct.ingredients ?? []),
                                {
                                    id: crypto.randomUUID(),
                                    name,
                                    isActive: true,
                                },
                            ]
                        );

                    }}
                />

                <ExtraSection
                    extras={editableProduct.extras ?? []}

                    onToggle={(id) => {

                        updateField(
                            "extras",
                            (editableProduct.extras ?? []).map(
                                extra =>
                                    extra.id === id
                                        ? {
                                            ...extra,
                                            isActive: !extra.isActive,
                                        }
                                        : extra
                            )
                        );

                    }}

                    onDelete={(id) => {

                        updateField(
                            "extras",
                            editableProduct.extras?.filter(
                                extra => extra.id !== id
                            ) ?? []
                        );

                    }}

                    onAdd={(extra) => {

                        updateField(
                            "extras",
                            [
                                ...(editableProduct.extras ?? []),
                                {
                                    id: crypto.randomUUID(),
                                    ...extra,
                                },
                            ]
                        );

                    }}
                />

                <section className="rounded-xl border border-gray-200 p-6">

                    <h2 className="mb-2 text-lg font-semibold">
                        📅 Días de disponibilidad
                    </h2>

                    <p className="mb-4 text-sm text-gray-500">
                        Define en qué días de la semana se puede vender este producto.
                    </p>

                    <label className="flex items-center gap-3">

                        <input
                            type="checkbox"
                            checked={
                                !editableProduct.availableDays ||
                                editableProduct.availableDays.length === 0
                            }
                            onChange={(event) => {

                                if (
                                    event.target.checked
                                ) {

                                    updateField(
                                        "availableDays",
                                        []
                                    );

                                }

                            }}
                            className="h-5 w-5"
                        />

                        <span className="font-medium">
                            Disponible todos los días
                        </span>

                    </label>


                    {editableProduct.availableDays &&
                        editableProduct.availableDays.length > 0 && (

                            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">

                                {[
                                    {
                                        value: 1,
                                        label: "Lunes",
                                    },
                                    {
                                        value: 2,
                                        label: "Martes",
                                    },
                                    {
                                        value: 3,
                                        label: "Miércoles",
                                    },
                                    {
                                        value: 4,
                                        label: "Jueves",
                                    },
                                    {
                                        value: 5,
                                        label: "Viernes",
                                    },
                                    {
                                        value: 6,
                                        label: "Sábado",
                                    },
                                    {
                                        value: 0,
                                        label: "Domingo",
                                    },
                                ].map(day => {

                                    const selected =
                                        editableProduct.availableDays?.includes(
                                            day.value
                                        ) ?? false;


                                    return (

                                        <label
                                            key={day.value}
                                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white p-3 hover:border-orange-300"
                                        >

                                            <input
                                                type="checkbox"
                                                checked={selected}
                                                onChange={(event) => {

                                                    const current =
                                                        editableProduct.availableDays ??
                                                        [];

                                                    const next =
                                                        event.target.checked

                                                            ? [
                                                                ...current,
                                                                day.value,
                                                            ]

                                                            : current.filter(
                                                                value =>
                                                                    value !==
                                                                    day.value
                                                            );


                                                    updateField(
                                                        "availableDays",
                                                        next
                                                    );

                                                }}
                                            />

                                            <span className="text-sm font-medium">
                                                {day.label}
                                            </span>

                                        </label>

                                    );

                                })}

                            </div>

                        )}

                </section>

                <section className="rounded-xl border border-gray-200 p-6">

                    <h2 className="mb-4 text-lg font-semibold">
                        ⚙ Estado
                    </h2>

                    <div className="flex items-center justify-between">

                        <span className="text-sm text-gray-600">
                            Producto disponible
                        </span>

                        <input
                            type="checkbox"
                            checked={editableProduct.isAvailable ?? true}
                            onChange={(event) =>
                                updateField(
                                    "isAvailable",
                                    event.target.checked
                                )
                            }
                            className="h-5 w-5"
                        />

                    </div>

                </section>

            </div>

            <div className="flex items-center justify-between border-t border-orange-200 bg-gray-50 p-6">

                <Button
                    variant="danger"
                    onClick={() => onDelete(editableProduct.id)}
                >
                    Eliminar
                </Button>

                <div className="flex gap-3">

                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        Cancelar
                    </Button>

                    <Button
                        onClick={() => {

                            const availableDays =
                                editableProduct.availableDays ?? [];

                            if (
                                availableDays.length === 0
                            ) {

                                alert(
                                    "Este producto quedará disponible todos los días."
                                );

                            }

                            onSave(
                                editableProduct
                            );

                        }}
                    >
                        Guardar cambios
                    </Button>
                </div>

            </div>

        </div>

    );

}