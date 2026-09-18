"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";

import { ExtraCatalogItem } from "@/types/extra-catalog";

interface ExtraCatalogFormProps {
    extra?: ExtraCatalogItem | null;
    nextSortOrder: number;
    onSave: (extra: ExtraCatalogItem) => void;
    onCancel: () => void;
}

export default function ExtraCatalogForm({
    extra,
    nextSortOrder,
    onSave,
    onCancel,
}: ExtraCatalogFormProps) {

    const [name, setName] =
        useState(extra?.name ?? "");

    const [price, setPrice] =
        useState(
            extra
                ? String(extra.price)
                : "0"
        );

    const [isActive, setIsActive] =
        useState(
            extra?.isActive ?? true
        );

    function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {

        event.preventDefault();

        const trimmedName =
            name.trim();

        if (!trimmedName) {
            alert(
                "El nombre del extra es obligatorio."
            );

            return;
        }

        const numericPrice =
            Number(price);

        if (
            Number.isNaN(numericPrice) ||
            numericPrice < 0
        ) {
            alert(
                "Ingresa un precio válido."
            );

            return;
        }

        onSave({
            id: extra?.id ?? "",
            restaurantId:
                extra?.restaurantId ?? "",
            name: trimmedName,
            price: numericPrice,
            isActive,
            sortOrder:
                extra?.sortOrder ??
                nextSortOrder,
        });

    }

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-gray-200 bg-gray-50 p-6"
        >

            <div className="mb-5">

                <h3 className="text-lg font-semibold text-gray-900">
                    {extra
                        ? "Editar extra"
                        : "Nuevo extra"}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                    Este extra podrá reutilizarse en diferentes grupos y productos.
                </p>

            </div>


            <div className="grid gap-5 md:grid-cols-2">

                <div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Nombre
                    </label>

                    <input
                        type="text"
                        value={name}
                        onChange={(event) =>
                            setName(event.target.value)
                        }
                        placeholder="Ej. Tocineta"
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />

                </div>


                <div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Precio adicional
                    </label>

                    <input
                        type="number"
                        min="0"
                        step="1"
                        value={price}
                        onChange={(event) =>
                            setPrice(event.target.value)
                        }
                        placeholder="0"
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />

                </div>

            </div>


            <label className="mt-5 flex cursor-pointer items-center gap-3">

                <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(event) =>
                        setIsActive(
                            event.target.checked
                        )
                    }
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />

                <span className="text-sm font-medium text-gray-700">
                    Extra activo
                </span>

            </label>


            <div className="mt-6 flex gap-3">

                <Button
                    type="submit"
                >
                    {extra
                        ? "Guardar cambios"
                        : "Crear extra"}
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                >
                    Cancelar
                </Button>

            </div>

        </form>
    );
}
