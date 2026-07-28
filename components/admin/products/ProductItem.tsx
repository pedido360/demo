'use client';

import { Pencil, Star, Trash2 } from 'lucide-react';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

import { Category } from '@/types/category';
import { Product } from '@/types/product';

interface ProductItemProps {
    product: Product;
    category?: Category;
    onEdit: () => void;
    onDelete: () => void;
}

export default function ProductItem({
    product,
    category,
    onEdit,
    onDelete,
}: ProductItemProps) {
    return (
        <Card>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div className="flex gap-4">

                    <div className="h-20 w-20 overflow-hidden rounded-lg border bg-gray-100">

                        {product.image ? (
                            <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-xs text-gray-400">
                                Sin imagen
                            </div>
                        )}

                    </div>

                    <div className="space-y-1">

                        <div className="flex items-center gap-2 flex-wrap">

                            <h3 className="font-semibold text-lg">
                                {product.name}
                            </h3>

                            {product.featured && (
                                <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                                    <Star size={14} fill="currentColor" />
                                    Destacado
                                </span>
                            )}

                            {!product.isAvailable && (
                                <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                                    No disponible
                                </span>
                            )}

                        </div>

                        {product.description && (
                            <p className="text-sm text-gray-500">
                                {product.description}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-sm">

                            <span className="font-semibold">
                                ${product.price.toFixed(2)}
                            </span>

                            {category && (
                                <span className="rounded-full bg-gray-100 px-2 py-1">
                                    {category.emoji} {category.name}
                                </span>
                            )}

                        </div>

                        {!!product.ingredients?.length && (
                            <p className="text-xs text-gray-500">
                                Ingredientes:{" "}
                                {product.ingredients
                                    .map((item) => item.name)
                                    .join(", ")}
                            </p>
                        )}

                        {!!product.extras?.length && (
                            <p className="text-xs text-gray-500">
                                Extras:{" "}
                                {product.extras
                                    .map(
                                        (item) =>
                                            `${item.name} (+$${item.price.toFixed(
                                                2
                                            )})`
                                    )
                                    .join(", ")}
                            </p>
                        )}

                    </div>

                </div>

                <div className="flex gap-2">

                    <Button
                        variant="outline"
                        leftIcon={<Pencil size={16} />}
                        onClick={onEdit}
                    >
                        Editar
                    </Button>

                    <Button
                        variant="danger"
                        leftIcon={<Trash2 size={16} />}
                        onClick={onDelete}
                    >
                        Eliminar
                    </Button>

                </div>

            </div>
        </Card>
    );
}