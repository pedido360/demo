"use client";

import Button from "@/components/ui/Button";

import { Category } from "@/types/category";
import { Product } from "@/types/product";

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

    return (

        <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white">

            <div className="border-b p-6">

                <button
                    type="button"
                    onClick={onClose}
                    className="mb-4 text-sm font-medium text-green-600 hover:underline"
                >
                    ← Volver al menú
                </button>

                <h1 className="text-2xl font-bold">
                    {product.name || "Nuevo producto"}
                </h1>

                <p className="mt-2 text-gray-500">
                    Administra toda la información del producto.
                </p>

            </div>

            <div className="space-y-6 p-6">

                <div className="grid gap-6 md:grid-cols-2">

                    <div>

                        <label className="mb-2 block text-sm font-medium">
                            Nombre
                        </label>

                        <input
                            value={product.name}
                            readOnly
                            className="w-full rounded-xl border p-3"
                        />

                    </div>

                    <div>

                        <label className="mb-2 block text-sm font-medium">
                            Precio
                        </label>

                        <input
                            value={product.price}
                            readOnly
                            className="w-full rounded-xl border p-3"
                        />

                    </div>

                </div>

                <div>

                    <label className="mb-2 block text-sm font-medium">
                        Descripción
                    </label>

                    <textarea
                        value={product.description}
                        readOnly
                        rows={4}
                        className="w-full rounded-xl border p-3"
                    />

                </div>

                <div>

                    <label className="mb-2 block text-sm font-medium">
                        Categoría
                    </label>

                    <select
                        value={product.categoryId}
                        disabled
                        className="w-full rounded-xl border p-3"
                    >

                        {categories.map((category) => (

                            <option
                                key={category.id}
                                value={category.id}
                            >
                                {category.name}
                            </option>

                        ))}

                    </select>

                </div>

                <div className="rounded-xl bg-gray-50 p-4">

                    <h2 className="font-semibold">
                        Ingredientes
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        {product.ingredients?.length ?? 0} ingredientes.
                    </p>

                </div>

                <div className="rounded-xl bg-gray-50 p-4">

                    <h2 className="font-semibold">
                        Extras
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                        {product.extras?.length ?? 0} extras.
                    </p>

                </div>

            </div>

            <div className="flex justify-between border-t p-6">

                <Button
                    variant="danger"
                    onClick={() => onDelete(product.id)}
                >
                    Eliminar
                </Button>

                <Button
                    onClick={() => onSave(product)}
                >
                    Guardar
                </Button>

            </div>

        </div>

    );

}