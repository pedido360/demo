import Image from "next/image";

import { products } from "@/data/products";

export default function FeaturedProducts() {
    const featuredProducts = products.filter(
        (product) => product.featured
    );

    return (
        <section className="max-w-md mx-auto px-5 py-6">

            <div className="flex items-center justify-between mb-4">

                <h2 className="text-xl font-bold">
                    ⭐ Los más pedidos
                </h2>

                <span className="text-sm text-red-600 font-medium">
                    Recomendados
                </span>

            </div>

            <div className="space-y-3">

                {featuredProducts.map((product) => (

                    <article
                        key={product.id}
                        className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center gap-3"
                    >

                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-white flex items-center justify-center flex-shrink-0">

                            {product.image.startsWith("/") ? (
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-4xl">
                                    {product.image}
                                </span>
                            )}

                        </div>

                        <div className="flex-1 min-w-0">

                            <h3 className="font-semibold truncate">
                                {product.name}
                            </h3>

                            <p className="text-sm text-gray-600 line-clamp-1">
                                {product.description}
                            </p>

                        </div>

                        <div className="flex flex-col items-end gap-2">

                            <span className="font-bold text-red-600">
                                ${product.price.toLocaleString("es-CO")}
                            </span>

                            <button
                                className="w-9 h-9 rounded-full bg-red-600 text-white font-bold hover:bg-red-700 transition"
                            >
                                +
                            </button>

                        </div>

                    </article>

                ))}

            </div>

        </section>
    );
}