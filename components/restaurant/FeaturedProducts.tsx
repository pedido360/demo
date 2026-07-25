import Image from "next/image";

import { products } from "@/data/products";

export default function FeaturedProducts() {
    const featuredProducts = products.filter(
        (product) => product.featured
    );

    return (
        <section className="w-full px-4 py-5">

            <div className="mb-4 flex items-center justify-between">

                <h2 className="text-xl font-bold">
                    ⭐ Los más pedidos
                </h2>

                <span className="text-sm font-medium text-red-600">
                    Recomendados
                </span>

            </div>

            <div className="space-y-3">

                {featuredProducts.map((product) => (
                    <article
                        key={product.id}
                        className="flex items-center gap-3 rounded-2xl border border-yellow-200 bg-yellow-50 p-3"
                    >

                        {/* Imagen */}
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-white">

                            {product.image.startsWith("/") ? (
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    width={80}
                                    height={80}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-4xl">
                                    {product.image}
                                </div>
                            )}

                        </div>

                        {/* Información */}
                        <div className="min-w-0 flex-1">

                            <h3 className="truncate font-semibold text-gray-900">
                                {product.name}
                            </h3>

                            <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                                {product.description}
                            </p>

                        </div>

                        {/* Precio */}
                        <div className="ml-2 flex flex-col items-end gap-2">

                            <span className="whitespace-nowrap font-bold text-red-600">
                                ${product.price.toLocaleString("es-CO")}
                            </span>

                            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-lg font-bold text-white transition hover:bg-red-700">
                                +
                            </button>

                        </div>

                    </article>
                ))}

            </div>

        </section>
    );
}