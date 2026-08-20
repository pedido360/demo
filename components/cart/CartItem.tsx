"use client";

import { ProductSelection } from "@/types/product";
import { Trash2 } from "lucide-react";

interface CartItemProps {
    item: ProductSelection;
    index: number;
    onRemove: (index: number) => void;
}

export default function CartItem({
    item,
    index,
    onRemove,
}: CartItemProps) {

    /*
     * ============================================================
     * MENÚ DEL DÍA
     * ============================================================
     */

    if (item.dailyMenu) {

        const menu =
            item.dailyMenu;

        const subtotal =
            menu.size.price *
            item.quantity;

        return (

            <article className="rounded-2xl border border-orange-200 bg-orange-50 p-4">

                <div className="flex items-start justify-between">

                    <div className="min-w-0">

                        <h3 className="font-bold text-gray-900">
                            🍽️ {item.product.name}
                        </h3>

                        <p className="mt-1 text-sm font-semibold text-red-600">
                            📏 {menu.size.label}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                            Cantidad: {item.quantity}
                        </p>

                    </div>

                    <button
                        onClick={() =>
                            onRemove(index)
                        }
                        className="ml-3 shrink-0 text-red-600 transition hover:text-red-700"
                    >
                        <Trash2 size={20} />
                    </button>

                </div>


                <div className="mt-4 space-y-3 border-t border-orange-200 pt-4">

                    {menu.soup && (

                        <div>

                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                🍲 Sopa
                            </p>

                            <p className="mt-1 text-sm text-gray-800">
                                {menu.soup.name}
                            </p>

                        </div>

                    )}


                    {menu.secos.length > 0 && (

                        <div>

                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                🍛 Seco
                            </p>

                            <div className="mt-1 space-y-1">

                                {menu.secos.map(
                                    seco => (

                                        <p
                                            key={
                                                seco.id
                                            }
                                            className="text-sm text-gray-800"
                                        >
                                            • {seco.name}
                                        </p>

                                    )
                                )}

                            </div>

                        </div>

                    )}


                    {menu.principle && (

                        <div>

                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                🥣 Principio
                            </p>

                            <p className="mt-1 text-sm text-gray-800">
                                {menu.principle.name}
                            </p>

                        </div>

                    )}


                    {menu.protein && (

                        <div>

                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                🥩 Proteína
                            </p>

                            <p className="mt-1 text-sm text-gray-800">
                                {menu.protein.name}
                            </p>

                        </div>

                    )}


                    {menu.drink && (

                        <div>

                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                🥤 Bebida
                            </p>

                            <p className="mt-1 text-sm text-gray-800">
                                {menu.drink.name}
                            </p>

                        </div>

                    )}


                    {menu.dessert && (

                        <div>

                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                🍰 Postre
                            </p>

                            <p className="mt-1 text-sm text-gray-800">
                                {menu.dessert.name}
                            </p>

                        </div>

                    )}


                    {menu.notes?.trim() && (

                        <div>

                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                📝 Observaciones
                            </p>

                            <p className="mt-1 text-sm italic text-gray-700">
                                "{menu.notes}"
                            </p>

                        </div>

                    )}

                </div>


                <div className="mt-4 flex justify-between border-t border-orange-200 pt-3">

                    <span className="font-medium">
                        Subtotal
                    </span>

                    <span className="font-bold text-red-600">
                        ${subtotal.toLocaleString("es-CO")}
                    </span>

                </div>

            </article>

        );

    }


    /*
     * ============================================================
     * PRODUCTO NORMAL
     * ============================================================
     */

    const extrasTotal =
        (item.extras ?? []).reduce(
            (total, extra) =>
                total + extra.price,
            0
        );

    const productPrice =
        item.variant?.price ??
        item.product.price;

    const subtotal =
        (productPrice + extrasTotal)
        * item.quantity;


    return (

        <article className="rounded-2xl border border-gray-200 bg-white p-4">

            <div className="flex items-start justify-between">

                <div>

                    <h3 className="font-bold">
                        {item.product.name}
                    </h3>

                    {item.variant && (

                        <p className="mt-1 text-sm font-medium text-red-600">
                            📏 {item.variant.label}
                        </p>

                    )}

                    <p className="mt-1 text-sm text-gray-500">
                        Cantidad: {item.quantity}
                    </p>

                    {item.extras.length > 0 && (

                        <div className="mt-3">

                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                ➕ Extras
                            </p>

                            <div className="space-y-1">

                                {item.extras.map(
                                    extra => (

                                        <div
                                            key={
                                                extra.id
                                            }
                                            className="flex items-center gap-2 text-sm text-gray-700"
                                        >

                                            <span className="text-green-600">
                                                ✓
                                            </span>

                                            <span>
                                                {extra.name}
                                            </span>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>

                    )}

                    {item.notes && (

                        <div className="mt-4">

                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                📝 Observaciones
                            </p>

                            <p className="text-sm italic text-gray-700">
                                "{item.notes}"
                            </p>

                        </div>

                    )}

                </div>


                <button
                    onClick={() =>
                        onRemove(index)
                    }
                    className="text-red-600 transition hover:text-red-700"
                >
                    <Trash2 size={20} />
                </button>

            </div>


            <div className="mt-4 flex justify-between border-t pt-3">

                <span className="font-medium">
                    Subtotal
                </span>

                <span className="font-bold text-red-600">
                    ${subtotal.toLocaleString("es-CO")}
                </span>

            </div>

        </article>

    );

}