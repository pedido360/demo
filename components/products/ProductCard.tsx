import { Product } from "@/types/product";

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    return (
        <article className="bg-white rounded-2xl shadow-sm border p-3 flex gap-4 items-center">

            <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center text-5xl flex-shrink-0">
                {product.image}
            </div>

            <div className="flex-1">

                <h3 className="font-bold text-lg">
                    {product.name}
                </h3>

                <p className="text-gray-500 text-sm mt-1">
                    {product.description}
                </p>

                <div className="flex items-center justify-between mt-4">

                    <span className="text-xl font-bold text-red-600">
                        ${product.price.toLocaleString("es-CO")}
                    </span>

                    <button className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-4 py-2 transition">
                        Agregar
                    </button>

                </div>

            </div>

        </article>
    );
}