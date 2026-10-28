"use client";

import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import IngredientSection from "./IngredientSection";
import ExtraSection from "./ExtraSection";

import { Category } from "@/types/category";
import {
    Ingredient,
    Product,
    ProductAvailableHour,
} from "@/types/product";
import { ProductVariant } from "@/types/product-variant";

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

    const [isSaving, setIsSaving] = useState(false);
    const [variantLabel, setVariantLabel] = useState("");
    const [variantPrice, setVariantPrice] = useState("");

    function updateVariant(id: string, changes: Partial<ProductVariant>) {
        updateField(
            "variants",
            (editableProduct.variants ?? []).map(variant =>
                variant.id === id ? { ...variant, ...changes } : variant
            )
        );
    }

    function addVariant() {
        const label = variantLabel.trim();

        if (!label) {
            alert("Escribe el nombre de la presentación.");
            return;
        }

        const variants = editableProduct.variants ?? [];

        const newVariant: ProductVariant = {
            id: crypto.randomUUID(),
            productId: editableProduct.id,
            label,
            price: Number(variantPrice) || 0,
            isDefault: variants.length === 0,
            isAvailable: true,
            sortOrder: variants.length,
        };

        updateField("variants", [...variants, newVariant]);
        setVariantLabel("");
        setVariantPrice("");
    }

    function removeVariant(id: string) {
        const remaining = (editableProduct.variants ?? [])
            .filter(variant => variant.id !== id)
            .map((variant, index) => ({
                ...variant,
                isDefault: index === 0 ? variant.isDefault : false,
                sortOrder: index,
            }));

        updateField("variants", remaining);
    }

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

    function updateDayHours(
        dayOfWeek: number,
        field: "startTime" | "endTime",
        value: string
    ) {

        const currentHours =
            editableProduct.availableHours ?? [];

        const existing =
            currentHours.find(
                hour =>
                    hour.dayOfWeek === dayOfWeek
            );

        if (existing) {

            updateField(
                "availableHours",
                currentHours.map(hour =>
                    hour.dayOfWeek === dayOfWeek
                        ? {
                            ...hour,
                            [field]: value,
                        }
                        : hour
                )
            );

            return;

        }

        const newHour: ProductAvailableHour = {
            id: crypto.randomUUID(),
            productId: editableProduct.id,
            dayOfWeek,
            startTime:
                field === "startTime"
                    ? value
                    : "",
            endTime:
                field === "endTime"
                    ? value
                    : "",
        };

        updateField(
            "availableHours",
            [
                ...currentHours,
                newHour,
            ]
        );

    }

    function getDayHours(
        dayOfWeek: number
    ) {

        return (
            editableProduct.availableHours ?? []
        ).find(
            hour =>
                hour.dayOfWeek === dayOfWeek
        );

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

                <section className="rounded-xl border border-gray-200 p-6">
                    <h2 className="mb-4 text-lg font-semibold">
                        Variantes, tamaños y precios
                    </h2>

                    {(editableProduct.variants ?? []).length > 0 ? (
                        <div className="mb-5 space-y-3">
                            {(editableProduct.variants ?? []).map(variant => (
                                <div
                                    key={variant.id}
                                    className="grid gap-3 rounded-lg border border-gray-200 p-4 sm:grid-cols-[1fr_180px_auto]"
                                >
                                    <div>
                                        <label className="mb-1 block text-sm font-medium">
                                            Presentación
                                        </label>
                                        <input
                                            className="w-full rounded-xl border border-gray-300 p-3"
                                            value={variant.label}
                                            onChange={event =>
                                                updateVariant(variant.id, {
                                                    label: event.target.value,
                                                })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium">
                                            Precio
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            step="0.01"
                                            className="w-full rounded-xl border border-gray-300 p-3"
                                            value={variant.price}
                                            onChange={event =>
                                                updateVariant(variant.id, {
                                                    price: Number(event.target.value),
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="flex items-end">
                                        <Button
                                            type="button"
                                            variant="danger"
                                            onClick={() => {
                                                if (window.confirm(
                                                    `¿Eliminar la presentación "${variant.label}"?`
                                                )) {
                                                    removeVariant(variant.id);
                                                }
                                            }}
                                        >
                                            Eliminar
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="mb-4 text-sm text-gray-500">
                            Este producto todavía no tiene variantes configuradas.
                        </p>
                    )}

                    <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto]">
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Nueva presentación
                            </label>
                            <input
                                className="w-full rounded-xl border border-gray-300 p-3"
                                placeholder="Ej. Personal, mediano, familiar"
                                value={variantLabel}
                                onChange={event => setVariantLabel(event.target.value)}
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Precio
                            </label>
                            <input
                                type="number"
                                min={0}
                                step="0.01"
                                className="w-full rounded-xl border border-gray-300 p-3"
                                placeholder="0"
                                value={variantPrice}
                                onChange={event => setVariantPrice(event.target.value)}
                            />
                        </div>

                        <div className="flex items-end">
                            <Button type="button" onClick={addVariant}>
                                Agregar variante
                            </Button>
                        </div>
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
                    productId={
                        editableProduct.id
                    }

                    extras={
                        editableProduct.extras ??
                        []
                    }

                    selectionGroups={
                        editableProduct.extraSelectionGroups ??
                        []
                    }

                    onSelectionGroupsChange={
                        (groups) =>
                            updateField(
                                "extraSelectionGroups",
                                groups
                            )
                    }

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
                                updateField(
                                    "availableDays",
                                    event.target.checked
                                        ? []
                                        : [1, 2, 3, 4, 5, 6, 0]
                                );
                            }}
                            className="h-5 w-5"
                        />

                        <span className="font-medium">
                            Disponible todos los días
                        </span>

                    </label>


                    {editableProduct.availableDays &&
                        editableProduct.availableDays.length > 0 && (

                            <div className="mt-4 space-y-3">

                                <button
                                    type="button"
                                    onClick={() => {
                                        const days = editableProduct.availableDays ?? [];
                                        const currentHours = editableProduct.availableHours ?? [];
                                        const sourceDay = days.find(day =>
                                            currentHours.some(hour =>
                                                hour.dayOfWeek === day &&
                                                hour.startTime &&
                                                hour.endTime
                                            )
                                        );

                                        if (sourceDay === undefined) {
                                            alert("Configura primero la hora de inicio y fin de un día.");
                                            return;
                                        }

                                        const sourceHours = currentHours.find(
                                            hour => hour.dayOfWeek === sourceDay
                                        )!;

                                        updateField(
                                            "availableHours",
                                            [
                                                ...currentHours.filter(
                                                    hour => !days.includes(hour.dayOfWeek)
                                                ),
                                                ...days.map(day => ({
                                                    ...sourceHours,
                                                    dayOfWeek: day,
                                                })),
                                            ]
                                        );
                                    }}
                                    className="rounded-lg border border-orange-300 px-4 py-2 text-sm font-medium text-orange-700 hover:bg-orange-50"
                                >
                                    Aplicar a todos los días
                                </button>

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

                                    const hours =
                                        getDayHours(
                                            day.value
                                        );

                                    return (

                                        <div
                                            key={day.value}
                                            className="rounded-lg border border-gray-200 bg-white p-3"
                                        >

                                            <label className="flex cursor-pointer items-center gap-2">

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

                                                        if (
                                                            !event.target.checked
                                                        ) {

                                                            updateField(
                                                                "availableHours",
                                                                (
                                                                    editableProduct.availableHours ??
                                                                    []
                                                                ).filter(
                                                                    hour =>
                                                                        hour.dayOfWeek !==
                                                                        day.value
                                                                )
                                                            );

                                                        }

                                                    }}
                                                />

                                                <span className="text-sm font-medium">
                                                    {day.label}
                                                </span>

                                            </label>

                                            {selected && (

                                                <div className="mt-3 grid gap-3 sm:grid-cols-2">

                                                    <div>

                                                        <label className="mb-2 block text-sm font-medium">
                                                            Hora inicio
                                                        </label>

                                                        <input
                                                            type="time"
                                                            className="w-full rounded-xl border border-gray-300 p-3"
                                                            value={
                                                                hours?.startTime?.slice(
                                                                    0,
                                                                    5
                                                                ) ?? ""
                                                            }
                                                            onChange={(event) =>
                                                                updateDayHours(
                                                                    day.value,
                                                                    "startTime",
                                                                    event.target.value
                                                                )
                                                            }
                                                        />

                                                    </div>

                                                    <div>

                                                        <label className="mb-2 block text-sm font-medium">
                                                            Hora fin
                                                        </label>

                                                        <input
                                                            type="time"
                                                            className="w-full rounded-xl border border-gray-300 p-3"
                                                            value={
                                                                hours?.endTime?.slice(
                                                                    0,
                                                                    5
                                                                ) ?? ""
                                                            }
                                                            onChange={(event) =>
                                                                updateDayHours(
                                                                    day.value,
                                                                    "endTime",
                                                                    event.target.value
                                                                )
                                                            }
                                                        />

                                                    </div>

                                                </div>

                                            )}

                                        </div>

                                    );

                                })}

                            </div>

                        )}

                </section>

                <section className="rounded-xl border border-orange-200 bg-orange-50 p-6">

                    <h2 className="mb-3 text-lg font-semibold">
                        🕒 Horario de compra
                    </h2>

                    <label className="flex cursor-pointer items-center gap-3">
                        <input
                            type="checkbox"
                            checked={editableProduct.restrictPurchaseHours ?? false}
                            onChange={(event) =>
                                updateField(
                                    "restrictPurchaseHours",
                                    event.target.checked
                                )
                            }
                            className="h-5 w-5"
                        />

                        <span className="font-medium">
                            Limitar horario de compra
                        </span>
                    </label>

                    <p className="mt-2 text-sm text-gray-600">
                        El producto seguirá visible en el menú, pero solo se podrá pedir dentro de los días y horarios configurados arriba.
                    </p>

                </section>

                <section className="rounded-xl border border-gray-200 p-6">

                    <h2 className="mb-4 text-lg font-semibold">
                        ⭐ Visibilidad
                    </h2>

                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={editableProduct.featured ?? false}
                            onChange={(event) =>
                                updateField(
                                    "featured",
                                    event.target.checked
                                )
                            }
                            className="h-5 w-5"
                        />

                        <span className="font-medium">
                            Producto destacado
                        </span>
                    </label>

                    <p className="mt-2 text-sm text-gray-500">
                        Los productos destacados aparecen resaltados en el menú.
                    </p>

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
                        loading={isSaving}
                        disabled={isSaving}
                        onClick={async () => {
                            if (isSaving) return;

                            const availableDays =
                                editableProduct.availableDays ?? [];

                            if (availableDays.length === 0) {
                                alert(
                                    "Este producto quedará disponible todos los días."
                                );
                            }

                            setIsSaving(true);

                            try {
                                await onSave(editableProduct);
                            } finally {
                                setIsSaving(false);
                            }
                        }}
                    >
                        {isSaving ? "Guardando…" : "Guardar cambios"}
                    </Button>
                </div>

            </div>

        </div>

    );

}