'use client';

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

import ProductForm from './ProductForm';
import ProductList from './ProductList';

import { Category } from '@/types/category';
import { Product } from '@/types/product';

interface ProductEditorProps {
    categories: Category[];
    products: Product[];
    setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

export default function ProductEditor({
    categories,
    products,
    setProducts,
}: ProductEditorProps) {
    const [editingProduct, setEditingProduct] =
        useState<Product | undefined>();

    const [showForm, setShowForm] = useState(false);

    const activeCategories = useMemo(
        () => categories.filter((category) => category.isActive),
        [categories]
    );

    function handleCreate() {
        setEditingProduct(undefined);
        setShowForm(true);
    }

    function handleCancel() {
        setEditingProduct(undefined);
        setShowForm(false);
    }

    function handleSave(product: Product) {
        console.log("=== PRODUCTO GUARDADO ===", product);
        setProducts((previous) => {
            const exists = previous.some(
                (item) => item.id === product.id
            );

            if (exists) {
                return previous.map((item) =>
                    item.id === product.id ? product : item
                );
            }

            return [...previous, product];
        });

        setEditingProduct(undefined);
        setShowForm(false);
    }

    function handleEdit(product: Product) {
        setEditingProduct(product);
        setShowForm(true);
    }

    function handleDelete(id: string) {
        setProducts((previous) =>
            previous.filter(
                (product) => product.id !== id
            )
        );
    }

    return (
        <Card
            title="Productos"
            description="Administra el menú de tu restaurante"
            actions={
                !showForm && (
                    <Button
                        leftIcon={<Plus size={18} />}
                        onClick={handleCreate}
                    >
                        Nuevo producto
                    </Button>
                )
            }
        >
            {categories.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                    <h3 className="text-lg font-semibold">
                        No hay categorías
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                        Debes crear al menos una categoría antes de agregar
                        productos.
                    </p>
                </div>
            ) : showForm ? (
                <ProductForm
                    categories={activeCategories}
                    product={editingProduct}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            ) : (
                <ProductList
                    products={products}
                    categories={categories}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}
        </Card>
    );
}