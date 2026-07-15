import { Product } from "@/types/product";

interface ProductCardProps {
    product: Product;
    onSelect: (product: Product) => void;
}

export default function ProductCard({
    product,
    onSelect,
}: ProductCardProps) {
    return (
        <article className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3">

            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-3xl flex-shrink-0">
                {product.image}
            </div>

            <div className="flex-1 min-w-0">

                <h3 className="font-semibold truncate">
                    {product.name}
                </h3>

                <p className="text-sm text-gray-600 line-clamp-1">
                    {product.description}
                </p>

            </div>

            <div className="flex flex-col items-end justify-between h-16">

                <span className="font-bold text-red-600 whitespace-nowrap">
                    ${product.price.toLocaleString("es-CO")}
                </span>

                <button
                    onClick={() => onSelect(product)}
                    className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 text-white text-xl font-bold transition"
                >
                    +
                </button>

            </div>

        </article>
    );
}