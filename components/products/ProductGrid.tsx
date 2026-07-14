import { products } from "@/data/products";
import ProductCard from "./ProductCard";

interface ProductGridProps {
    selectedCategory: string;
}

export default function ProductGrid({
    selectedCategory,
}: ProductGridProps) {
    const filteredProducts = products.filter(
        (product) => product.categoryId === selectedCategory
    );

    return (
        <section className="max-w-md mx-auto px-5 py-6">

            <h2 className="text-2xl font-bold mb-6">
                Productos
            </h2>

            <div className="space-y-4">

                {filteredProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                    />
                ))}

            </div>

        </section>
    );
}