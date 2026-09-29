"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import Button from "@/components/ui/Button";

import {
    Extra,
} from "@/types/product";

import {
    ProductExtraSelectionGroup,
    ProductExtraSelectionGroupItem,
} from "@/types/product-extra-selection";

interface ProductExtraSelectionGroupsProps {
    productId: string;
    extras: Extra[];
    groups: ProductExtraSelectionGroup[];
    onChange: (
        groups: ProductExtraSelectionGroup[]
    ) => void;
}

export default function ProductExtraSelectionGroups({
    productId,
    extras,
    groups,
    onChange,
}: ProductExtraSelectionGroupsProps) {

    const [isAdding, setIsAdding] =
        useState(false);

    const [editingGroupId, setEditingGroupId] =
        useState<string | null>(null);

    const [name, setName] =
        useState("");

    const [minSelections, setMinSelections] =
        useState(1);

    const [maxSelections, setMaxSelections] =
        useState(1);

    const [selectedExtraIds, setSelectedExtraIds] =
        useState<string[]>([]);

    function resetForm() {

        setIsAdding(false);
        setEditingGroupId(null);
        setName("");
        setMinSelections(1);
        setMaxSelections(1);
        setSelectedExtraIds([]);

    }

    function startAdd() {

        resetForm();
        setIsAdding(true);

    }

    function startEdit(
        group: ProductExtraSelectionGroup
    ) {

        setIsAdding(true);
        setEditingGroupId(group.id);
        setName(group.name);
        setMinSelections(group.minSelections);
        setMaxSelections(group.maxSelections);
        setSelectedExtraIds(
            group.items.map(
                item => item.extraId
            )
        );

    }

    function toggleExtra(
        extraId: string
    ) {

        setSelectedExtraIds(
            current =>
                current.includes(extraId)
                    ? current.filter(
                        id =>
                            id !== extraId
                    )
                    : [
                        ...current,
                        extraId,
                    ]
        );

    }

    function handleSave() {

        const trimmedName =
            name.trim();

        if (!trimmedName) {

            alert(
                "Escribe el nombre del grupo."
            );

            return;

        }

        if (selectedExtraIds.length === 0) {

            alert(
                "Selecciona al menos un extra para el grupo."
            );

            return;

        }

        if (minSelections < 1) {

            alert(
                "La selección mínima debe ser 1 o más."
            );

            return;

        }

        if (maxSelections < minSelections) {

            alert(
                "La selección máxima no puede ser menor que la mínima."
            );

            return;

        }

        if (maxSelections > selectedExtraIds.length) {

            alert(
                "La selección máxima no puede superar la cantidad de extras del grupo."
            );

            return;

        }

        const existingGroup =
            editingGroupId
                ? groups.find(
                    group =>
                        group.id ===
                        editingGroupId
                )
                : undefined;

        const groupId =
            editingGroupId ??
            crypto.randomUUID();

        const previousItemsByExtra =
            new Map(
                (
                    existingGroup?.items ??
                    []
                ).map(
                    item => [
                        item.extraId,
                        item,
                    ]
                )
            );

        const items:
            ProductExtraSelectionGroupItem[] =
            selectedExtraIds.map(
                (
                    extraId,
                    index
                ) => {

                    const previous =
                        previousItemsByExtra.get(
                            extraId
                        );

                    return {
                        id:
                            previous?.id ??
                            crypto.randomUUID(),
                        groupId,
                        extraId,
                        sortOrder:
                            index,
                    };

                }
            );

        const nextGroup:
            ProductExtraSelectionGroup = {

            id: groupId,

            productId,

            name: trimmedName,

            minSelections,

            maxSelections,

            isActive:
                existingGroup?.isActive ??
                true,

            sortOrder:
                existingGroup?.sortOrder ??
                groups.length,

            items,

        };

        if (editingGroupId) {

            onChange(
                groups.map(
                    group =>
                        group.id ===
                        editingGroupId
                            ? nextGroup
                            : group
                )
            );

        } else {

            onChange([
                ...groups,
                nextGroup,
            ]);

        }

        resetForm();

    }

    function handleDelete(
        groupId: string
    ) {

        const group =
            groups.find(
                item =>
                    item.id ===
                    groupId
            );

        if (!group) {
            return;
        }

        const confirmed =
            window.confirm(
                `¿Eliminar el grupo "${group.name}"?`
            );

        if (!confirmed) {
            return;
        }

        onChange(
            groups.filter(
                item =>
                    item.id !==
                    groupId
            )
        );

    }

    function selectionText(
        group: ProductExtraSelectionGroup
    ) {

        if (
            group.minSelections ===
            group.maxSelections
        ) {

            return `Obligatorio · Selecciona ${group.minSelections}`;

        }

        return `Obligatorio · Selecciona entre ${group.minSelections} y ${group.maxSelections}`;

    }

    return (

        <div className="mt-8 border-t border-gray-200 pt-6">

            <div className="mb-4 flex items-start justify-between gap-4">

                <div>

                    <h3 className="text-base font-semibold text-gray-900">
                        Grupos de selección
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                        Agrupa extras cuando el cliente deba elegir una o varias opciones obligatorias.
                    </p>

                </div>

                {!isAdding && (

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        leftIcon={
                            <Plus size={16} />
                        }
                        onClick={startAdd}
                    >
                        Crear grupo
                    </Button>

                )}

            </div>

            {groups.length > 0 && (

                <div className="space-y-3">

                    {groups
                        .slice()
                        .sort(
                            (a, b) =>
                                a.sortOrder -
                                b.sortOrder
                        )
                        .map(group => {

                            const groupExtras =
                                group.items
                                    .slice()
                                    .sort(
                                        (
                                            a,
                                            b
                                        ) =>
                                            a.sortOrder -
                                            b.sortOrder
                                    )
                                    .map(
                                        item =>
                                            extras.find(
                                                extra =>
                                                    extra.id ===
                                                    item.extraId
                                            )
                                    )
                                    .filter(
                                        (
                                            extra
                                        ): extra is Extra =>
                                            Boolean(extra)
                                    );

                            return (

                                <div
                                    key={
                                        group.id
                                    }
                                    className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-4"
                                >

                                    <div className="flex items-start justify-between gap-4">

                                        <div>

                                            <div className="font-semibold text-gray-900">
                                                {group.name}
                                            </div>

                                            <div className="mt-1 text-xs font-semibold text-orange-700">
                                                {selectionText(
                                                    group
                                                )}
                                            </div>

                                            <div className="mt-2 text-sm text-gray-600">
                                                {groupExtras.length > 0
                                                    ? groupExtras
                                                        .map(
                                                            extra =>
                                                                extra.name
                                                        )
                                                        .join(
                                                            ", "
                                                        )
                                                    : "Sin extras asociados."}
                                            </div>

                                        </div>

                                        <div className="flex shrink-0 gap-2">

                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                leftIcon={
                                                    <Pencil size={15} />
                                                }
                                                onClick={() =>
                                                    startEdit(
                                                        group
                                                    )
                                                }
                                            >
                                                Editar
                                            </Button>

                                            <Button
                                                type="button"
                                                variant="danger"
                                                size="sm"
                                                leftIcon={
                                                    <Trash2 size={15} />
                                                }
                                                onClick={() =>
                                                    handleDelete(
                                                        group.id
                                                    )
                                                }
                                            >
                                                Eliminar
                                            </Button>

                                        </div>

                                    </div>

                                </div>

                            );

                        })}

                </div>

            )}

            {groups.length === 0 && !isAdding && (

                <div className="rounded-xl border border-dashed border-gray-300 px-4 py-4 text-sm text-gray-500">
                    No hay grupos de selección configurados.
                </div>

            )}

            {isAdding && (

                <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4">

                    <div className="grid gap-4 md:grid-cols-2">

                        <div className="md:col-span-2">

                            <label className="mb-2 block text-sm font-medium text-gray-800">
                                Nombre del grupo
                            </label>

                            <input
                                type="text"
                                value={name}
                                onChange={event =>
                                    setName(
                                        event.target.value
                                    )
                                }
                                placeholder="Ej. Tipo de huevo"
                                className="w-full rounded-lg border border-gray-300 bg-white p-3"
                            />

                        </div>

                        <div>

                            <label className="mb-2 block text-sm font-medium text-gray-800">
                                Mínimo de selecciones
                            </label>

                            <input
                                type="number"
                                min={1}
                                max={Math.max(
                                    1,
                                    selectedExtraIds.length
                                )}
                                value={minSelections}
                                onChange={event =>
                                    setMinSelections(
                                        Math.max(
                                            1,
                                            Number(
                                                event.target.value
                                            ) || 1
                                        )
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white p-3"
                            />

                        </div>

                        <div>

                            <label className="mb-2 block text-sm font-medium text-gray-800">
                                Máximo de selecciones
                            </label>

                            <input
                                type="number"
                                min={minSelections}
                                max={Math.max(
                                    1,
                                    selectedExtraIds.length
                                )}
                                value={maxSelections}
                                onChange={event =>
                                    setMaxSelections(
                                        Math.max(
                                            1,
                                            Number(
                                                event.target.value
                                            ) || 1
                                        )
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white p-3"
                            />

                        </div>

                    </div>

                    <div className="mt-5">

                        <p className="mb-3 text-sm font-medium text-gray-800">
                            Extras que pertenecen a este grupo
                        </p>

                        {extras.length === 0 ? (

                            <p className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-3 text-sm text-gray-500">
                                Primero crea al menos un extra para poder formar el grupo.
                            </p>

                        ) : (

                            <div className="space-y-2">

                                {extras.map(extra => (

                                    <label
                                        key={
                                            extra.id
                                        }
                                        className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
                                    >

                                        <div className="flex items-center gap-3">

                                            <input
                                                type="checkbox"
                                                checked={
                                                    selectedExtraIds.includes(
                                                        extra.id
                                                    )
                                                }
                                                onChange={() =>
                                                    toggleExtra(
                                                        extra.id
                                                    )
                                                }
                                            />

                                            <span className="font-medium text-gray-900">
                                                {extra.name}
                                            </span>

                                        </div>

                                        <span className="text-sm font-semibold text-red-600">
                                            +$
                                            {extra.price.toLocaleString()}
                                        </span>

                                    </label>

                                ))}

                            </div>

                        )}

                    </div>

                    <div className="mt-5 flex justify-end gap-2">

                        <Button
                            type="button"
                            variant="outline"
                            onClick={resetForm}
                        >
                            Cancelar
                        </Button>

                        <Button
                            type="button"
                            onClick={handleSave}
                        >
                            {editingGroupId
                                ? "Guardar cambios"
                                : "Crear grupo"}
                        </Button>

                    </div>

                </div>

            )}

        </div>

    );

}
