"use client";

import { useState } from "react";

import { X } from "lucide-react";

import { restaurant } from "@/data/restaurant";
import { buildWhatsAppMessage } from "@/lib/whatsapp";

import { useCart } from "@/hooks/useCart";

import CartItem from "./CartItem";

interface CartDrawerProps {
    open: boolean;
    onClose: () => void;
}

export default function CartDrawer({
    open,
    onClose,
}: CartDrawerProps) {

    const {
        items,
        totalPrice,
        removeFromCart,
    } = useCart();

    const [customerName, setCustomerName] =
        useState("");

    const [address, setAddress] =
        useState("");

    const [paymentMethod, setPaymentMethod] =
        useState("Efectivo");

    const [cashChange, setCashChange] =
        useState("");

    const [observations, setObservations] =
        useState("");

    function handleWhatsApp() {

        const message = buildWhatsAppMessage(
            items,
            totalPrice,
            {
                customerName,
                address,
                paymentMethod,
                cashChange,
                observations,
            }
        );

        const url =
            `https://wa.me/${restaurant.whatsapp}?text=${encodeURIComponent(message)}`;

        window.open(url, "_blank");

    }

    if (!open) return null;

    return (

        <div className="fixed inset-0 z-50">

            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />

            <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">

                <header className="flex items-center justify-between border-b p-5">

                    <h2 className="text-2xl font-bold">
                        🛒 Mi Pedido
                    </h2>

                    <button
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-gray-100"
                    >
                        <X size={24} />
                    </button>

                </header>

                <div className="flex-1 overflow-y-auto p-5">

                    {items.length === 0 ? (

                        <div className="mt-20 text-center text-gray-500">

                            <p className="text-lg font-medium">
                                Tu carrito está vacío.
                            </p>

                        </div>

                    ) : (

                        <div className="space-y-4">

                            {items.map((item, index) => (

                                <CartItem
                                    key={index}
                                    item={item}
                                    index={index}
                                    onRemove={removeFromCart}
                                />

                            ))}

                        </div>

                    )}

                </div>

                <footer className="border-t p-5">

                    {items.length > 0 && (

                        <div className="mb-6 space-y-4">

                            <div>

                                <label className="mb-1 block text-sm font-medium">
                                    👤 Nombre
                                </label>

                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(event) =>
                                        setCustomerName(event.target.value)
                                    }
                                    placeholder="Tu nombre"
                                    className="w-full rounded-xl border border-gray-300 p-3"
                                />

                            </div>

                            <div>

                                <label className="mb-1 block text-sm font-medium">
                                    📍 Dirección
                                </label>

                                <input
                                    type="text"
                                    value={address}
                                    onChange={(event) =>
                                        setAddress(event.target.value)
                                    }
                                    placeholder="Dirección de entrega"
                                    className="w-full rounded-xl border border-gray-300 p-3"
                                />

                            </div>

                            <div>

                                <label className="mb-1 block text-sm font-medium">
                                    💳 Forma de pago
                                </label>

                                <select
                                    value={paymentMethod}
                                    onChange={(event) =>
                                        setPaymentMethod(
                                            event.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-gray-300 p-3"
                                >

                                    <option>Efectivo</option>

                                    <option>Nequi</option>

                                    <option>Bre-B</option>

                                    <option>Transferencia</option>

                                    <option>Datáfono</option>

                                </select>

                            </div>

                            {paymentMethod === "Efectivo" && (

                                <div>

                                    <label className="mb-1 block text-sm font-medium">
                                        💵 ¿Con cuánto vas a pagar?
                                    </label>

                                    <input
                                        type="text"
                                        value={cashChange}
                                        onChange={(event) =>
                                            setCashChange(event.target.value)
                                        }
                                        placeholder="Ej: $50.000 o Sin cambio"
                                        className="w-full rounded-xl border border-gray-300 p-3"
                                    />

                                </div>

                            )}

                            <div>

                                <label className="mb-1 block text-sm font-medium">
                                    📝 Observaciones
                                </label>

                                <textarea
                                    rows={3}
                                    value={observations}
                                    onChange={(event) =>
                                        setObservations(event.target.value)
                                    }
                                    placeholder="Ej: Indicaciones para la entrega de tu pedido...."
                                    className="w-full rounded-xl border border-gray-300 p-3"
                                />

                            </div>

                        </div>

                    )}

                    <div className="mb-4 flex justify-between text-lg font-bold">

                        <span>Total</span>

                        <span className="text-red-600">
                            ${totalPrice.toLocaleString("es-CO")}
                        </span>

                    </div>

                    <button
                        onClick={handleWhatsApp}
                        disabled={items.length === 0}
                        className="w-full rounded-2xl bg-green-600 py-4 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                        📲 Enviar pedido por WhatsApp
                    </button>

                </footer>

            </div>

        </div>

    );

}