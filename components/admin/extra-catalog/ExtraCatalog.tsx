"use client";

import { useEffect, useState } from "react";

import ExtraCatalogForm from "@/components/admin/extra-catalog/ExtraCatalogForm";
import ExtraCatalogList from "@/components/admin/extra-catalog/ExtraCatalogList";
import ExtraGroupForm from "@/components/admin/extra-catalog/ExtraGroupForm";
import ExtraGroupItems from "@/components/admin/extra-catalog/ExtraGroupItems";
import ExtraGroupList from "@/components/admin/extra-catalog/ExtraGroupList";
import ProductExtraGroups from "@/components/admin/extra-catalog/ProductExtraGroups";

import {
    listExtraCatalog,
    listExtraGroupItems,
    listExtraGroups,
    removeExtraCatalogItem,
    removeExtraGroup,
    saveExtraCatalogItem,
    saveExtraGroup,
    saveExtraGroupItems,
    listProductExtraGroups,
    saveProductExtraGroups,
} from "@/lib/services/extra-catalog.service";

import {
    ExtraCatalogItem,
    ExtraGroup,
    ProductExtraGroup,
} from "@/types/extra-catalog";

import { Product } from "@/types/product";

interface ExtraCatalogProps {
    restaurantId: string;
    products: Product[];
    onBack: () => void;
}

export default function ExtraCatalog({
    restaurantId,
    products,
    onBack,
}: ExtraCatalogProps) {
    const [extras, setExtras] = useState<ExtraCatalogItem[]>([]);
    const [groups, setGroups] = useState<ExtraGroup[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [showExtraForm, setShowExtraForm] = useState(false);
    const [editingExtra, setEditingExtra] =
        useState<ExtraCatalogItem | null>(null);

    const [showGroupForm, setShowGroupForm] = useState(false);
    const [editingGroup, setEditingGroup] =
        useState<ExtraGroup | null>(null);

    const [showGroupItems, setShowGroupItems] = useState(false);
    const [groupItems, setGroupItems] = useState<
        Awaited<ReturnType<typeof listExtraGroupItems>>
    >([]);

    const [showProductAssignments, setShowProductAssignments] =
        useState(false);

    const [productAssignments, setProductAssignments] = useState<
        ProductExtraGroup[]
    >([]);

    async function loadData() {
        try {
            setLoading(true);

            const [extrasData, groupsData] = await Promise.all([
                listExtraCatalog(restaurantId),
                listExtraGroups(restaurantId),
            ]);

            setExtras(extrasData);
            setGroups(groupsData);
        } catch (error) {
            console.error(error);
            alert("No fue posible cargar el catálogo de extras.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadData();
    }, [restaurantId]);

    function handleCreateExtra() {
        setEditingExtra(null);
        setShowExtraForm(true);
    }

    function handleEditExtra(extra: ExtraCatalogItem) {
        setEditingExtra(extra);
        setShowExtraForm(true);
    }

    async function handleSaveExtra(extra: ExtraCatalogItem) {
        try {
            setSaving(true);

            await saveExtraCatalogItem({
                ...extra,
                restaurantId,
            });

            await loadData();

            setShowExtraForm(false);
            setEditingExtra(null);
        } catch (error) {
            console.error(error);

            alert(
                error instanceof Error
                    ? error.message
                    : "No fue posible guardar el extra."
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleDeleteExtra(extra: ExtraCatalogItem) {
        const confirmed = window.confirm(
            `¿Eliminar el extra "${extra.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setSaving(true);

            await removeExtraCatalogItem(extra.id);

            await loadData();
        } catch (error) {
            console.error(error);
            alert("No fue posible eliminar el extra.");
        } finally {
            setSaving(false);
        }
    }

    function handleCreateGroup() {
        setEditingGroup(null);
        setShowGroupForm(true);
    }

    function handleEditGroup(group: ExtraGroup) {
        setEditingGroup(group);
        setShowGroupForm(true);
        setShowGroupItems(false);
    }

    async function handleConfigureGroupItems(group: ExtraGroup) {
        try {
            setSaving(true);

            const items = await listExtraGroupItems(group.id);

            setEditingGroup(group);
            setGroupItems(items);
            setShowGroupForm(false);
            setShowGroupItems(true);
        } catch (error) {
            console.error(error);
            alert("No fue posible cargar los extras del grupo.");
        } finally {
            setSaving(false);
        }
    }

    async function handleSaveGroup(group: ExtraGroup) {
        try {
            setSaving(true);

            await saveExtraGroup({
                ...group,
                restaurantId,
            });

            await loadData();

            setShowGroupForm(false);
            setEditingGroup(null);
        } catch (error) {
            console.error(error);

            alert(
                error instanceof Error
                    ? error.message
                    : "No fue posible guardar el grupo."
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleSaveGroupItems(
        items: Awaited<ReturnType<typeof listExtraGroupItems>>
    ) {
        if (!editingGroup) {
            return;
        }

        try {
            setSaving(true);

            await saveExtraGroupItems(
                editingGroup.id,
                items
            );

            setGroupItems(items);
            setShowGroupItems(false);
        } catch (error) {
            console.error(error);
            alert("No fue posible guardar los extras del grupo.");
        } finally {
            setSaving(false);
        }
    }

    async function handleConfigureProductAssignments(
        group: ExtraGroup
    ) {
        try {
            setSaving(true);

            const assignments: ProductExtraGroup[] = [];

            for (const product of products) {
                const productGroups =
                    await listProductExtraGroups(product.id);

                const assignment = productGroups.find(
                    (item) => item.groupId === group.id
                );

                if (assignment) {
                    assignments.push(assignment);
                }
            }

            setEditingGroup(group);
            setProductAssignments(assignments);
            setShowGroupForm(false);
            setShowGroupItems(false);
            setShowProductAssignments(true);
        } catch (error) {
            console.error(error);
            alert(
                "No fue posible cargar los productos asignados al grupo."
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleSaveProductAssignments(
        assignments: ProductExtraGroup[]
    ) {
        try {
            setSaving(true);

            const assignmentsByProduct = new Map<string, ProductExtraGroup[]>();

            for (const assignment of assignments) {
                const current =
                    assignmentsByProduct.get(assignment.productId) ?? [];

                assignmentsByProduct.set(assignment.productId, [
                    ...current,
                    assignment,
                ]);
            }

            for (const product of products) {
                const currentGroups =
                    await listProductExtraGroups(product.id);

                const otherGroups = currentGroups.filter(
                    (item) => item.groupId !== editingGroup?.id
                );

                const newGroups = assignmentsByProduct.get(product.id) ?? [];

                await saveProductExtraGroups(product.id, [
                    ...otherGroups,
                    ...newGroups,
                ]);
            }

            setProductAssignments(assignments);
            setShowProductAssignments(false);
        } catch (error) {
            console.error(error);
            alert(
                "No fue posible guardar los productos del grupo."
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleDeleteGroup(group: ExtraGroup) {
        const confirmed = window.confirm(
            `¿Eliminar el grupo "${group.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setSaving(true);

            await removeExtraGroup(group.id);

            await loadData();
        } catch (error) {
            console.error(error);
            alert("No fue posible eliminar el grupo.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-5">
                <button
                    type="button"
                    onClick={onBack}
                    className="mb-4 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                    ← Volver al Smart Menu
                </button>

                <h2 className="text-2xl font-bold text-gray-900">
                    Catálogo de Extras
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Crea extras reutilizables y organízalos en grupos para
                    asignarlos a varios productos.
                </p>
            </div>

            <div className="space-y-6 p-6">
                {loading ? (
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500">
                        Cargando catálogo...
                    </div>
                ) : (
                    <>
                        {showExtraForm && (
                            <ExtraCatalogForm
                                extra={editingExtra}
                                nextSortOrder={extras.length}
                                onSave={handleSaveExtra}
                                onCancel={() => {
                                    setShowExtraForm(false);
                                    setEditingExtra(null);
                                }}
                            />
                        )}

                        <ExtraCatalogList
                            extras={extras}
                            onCreate={handleCreateExtra}
                            onEdit={handleEditExtra}
                            onDelete={handleDeleteExtra}
                        />

                        {showGroupForm && (
                            <ExtraGroupForm
                                group={editingGroup}
                                nextSortOrder={groups.length}
                                onSave={handleSaveGroup}
                                onCancel={() => {
                                    setShowGroupForm(false);
                                    setEditingGroup(null);
                                }}
                            />
                        )}

                        {showProductAssignments && editingGroup ? (
                            <ProductExtraGroups
                                group={editingGroup}
                                products={products}
                                assignments={productAssignments}
                                onSave={handleSaveProductAssignments}
                                onCancel={() => {
                                    setShowProductAssignments(false);
                                    setEditingGroup(null);
                                }}
                            />
                        ) : showGroupItems && editingGroup ? (
                            <ExtraGroupItems
                                groupId={editingGroup.id}
                                extras={extras}
                                items={groupItems}
                                onSave={handleSaveGroupItems}
                                onCancel={() => {
                                    setShowGroupItems(false);
                                    setEditingGroup(null);
                                }}
                            />
                        ) : (
                            <ExtraGroupList
                                groups={groups}
                                onCreate={handleCreateGroup}
                                onEdit={handleEditGroup}
                                onDelete={handleDeleteGroup}
                                onConfigureItems={handleConfigureGroupItems}
                                onConfigureProducts={
                                    handleConfigureProductAssignments
                                }
                            />
                        )}

                        {saving && (
                            <p className="text-sm text-gray-500">
                                Guardando...
                            </p>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}
