"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";

import {
    ExtraGroup,
    ProductExtraGroup,
} from "@/types/extra-catalog";

import { Product } from "@/types/product";

interface ProductExtraGroupsProps {
    group: ExtraGroup;
    products: Product[];
    assignments: ProductExtraGroup[];
    onSave: (groups: ProductExtraGroup[]) => void;
    onCancel: () => void;
}

export default function ProductExtraGroups({
    group,
    products,
    assignments,
    onSave,
    onCancel,
}: ProductExtraGroupsProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>(
        assignments.map((assignment) => assignment.productId)
    );

    function toggleProduct(productId: string, checked: boolean) {
        setSelectedIds((current) =>
            checked
                ? current.includes(productId)
                    ? current
                    : [...current, productId]
                : current.filter((id) => id !== productId)
        );
    }

    function handleSave() {
        const selectedGroups: ProductExtraGroup[] = selectedIds.map(
            (productId, index) => ({
                productId,
                groupId: group.id,
                sortOrder: index,
            })
        );

        onSave(selectedGroups);
    }

    const availableProducts = products.filter(
        (product) =>
            product.productType !== "daily_menu" &&
            product.isAvailable !== false
    );

    return (
        <section className="rounded-2xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-5">
                <h3 className="text-lg font-semibold text-gray-900">
                    Productos del grupo
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                    Selecciona los productos que tendrán disponible el grupo{" "}
                    <span className="font-medium text-gray-700">
                        “{group.name}”
                    </span>
                    .
                </p>
            </div>

            {availableProducts.length === 0 ? (
                <div className="px-6 py-10 text-center">
                    <div className="text-3xl">🍔</div>

                    <h4 className="mt-3 font-semibold text-gray-900">
                        No hay productos disponibles
                    </h4>

                    <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                        Crea productos en el Smart Menu para poder asignarles
                        este grupo de extras.
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid gap-3 p-6 md:grid-cols-2">
                        {availableProducts.map((product) => {
                            const selected = selectedIds.includes(product.id);

                            return (
                                <label
                                    key={product.id}
                                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                                        selected
                                            ? "border-green-300 bg-green-50"
                                            : "border-gray-200 bg-white hover:border-green-300"
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selected}
                                        onChange={(event) =>
                                            toggleProduct(
                                                product.id,
                                                event.target.checked
                                            )
                                        }
                                        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <span className="block text-sm font-medium text-gray-900">
                                            {product.name}
                                        </span>

                                        {product.description && (
                                            <span className="mt-1 block truncate text-xs text-gray-500">
                                                {product.description}
                                            </span>
                                        )}
                                    </div>
                                </label>
                            );
                        })}
                    </div>

                    <div className="flex flex-col gap-3 border-t border-gray-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-gray-500">
                            {selectedIds.length}{" "}
                            {selectedIds.length === 1
                                ? "producto seleccionado"
                                : "productos seleccionados"}
                        </p>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                onClick={handleSave}
                            >
                                Guardar productos
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </section>
    );
}
