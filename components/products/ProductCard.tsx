import Image from "next/image";

import { Product } from "@/types/product";

import { DailyMenuClient } from "@/types/daily-menu";


interface ProductCardProps {
    product: Product;

    onSelect: (
        product: Product
    ) => void;

    dailyMenu?: DailyMenuClient | null;
}


export default function ProductCard({

    product,

    onSelect,

    dailyMenu,

}: ProductCardProps) {


    const isDailyMenu =
        product.productType ===
        "daily_menu";


    const dailyMenuPrices =
        isDailyMenu &&
            dailyMenu
            ? dailyMenu.sizes
                .filter(
                    size =>
                        size.isAvailable
                )
                .map(
                    size =>
                        Number(
                            size.price
                        )
                )
                .filter(
                    price =>
                        Number.isFinite(
                            price
                        )
                )
            : [];


    const dailyMenuPrice =
        dailyMenuPrices.length > 0
            ? Math.min(
                ...dailyMenuPrices
            )
            : null;


    const priceLabel =
        isDailyMenu &&
            dailyMenuPrice !== null
            ? `Desde $${dailyMenuPrice.toLocaleString(
                "es-CO"
            )}`
            : `$${product.price.toLocaleString(
                "es-CO"
            )}`;


    return (

        <article className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">

            {/* Imagen */}

            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100">

                {product.image ? (

                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                    />

                ) : (

                    <div className="flex h-full w-full items-center justify-center text-3xl">
                        🍔
                    </div>

                )}

            </div>


            {/* Información */}

            <div className="min-w-0 flex-1">

                <h3 className="truncate text-[15px] font-semibold text-gray-900">
                    {product.name}
                </h3>

                <p className="mt-1 line-clamp-2 text-xs leading-4 text-gray-500">
                    {product.description}
                </p>

            </div>


            {/* Precio y botón */}

            <div className="ml-2 flex flex-col items-end justify-between self-stretch">

                <span className="whitespace-nowrap text-base font-bold text-red-600">
                    {priceLabel}
                </span>


                <button
                    onClick={() =>
                        onSelect(
                            product
                        )
                    }
                    className="flex flex-col items-center justify-center text-red-600 transition-transform hover:scale-105"
                >

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-xl font-bold text-white hover:bg-red-700">
                        +
                    </div>

                    <span className="mt-1 text-[11px] font-medium leading-none">
                        Pedir
                    </span>

                </button>

            </div>

        </article>

    );

}