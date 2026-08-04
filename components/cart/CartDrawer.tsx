"use client";

import { useState } from "react";
import { X, ArrowLeft } from "lucide-react";

import { Restaurant } from "@/types/restaurant";

import { buildWhatsAppMessage } from "@/lib/whatsapp";

import { useCart } from "@/hooks/useCart";

import CartItem from "./CartItem";
import OrderSentModal from "./OrderSentModal";

interface CartDrawerProps {
    restaurant: Restaurant;
    open: boolean;
    onClose: () => void;
}

export default function CartDrawer({
    restaurant,
    open,
    onClose,
}: CartDrawerProps) {

    const {
        items,
        totalPrice,
        removeFromCart,
        clearCart,
    } = useCart();

    const [checkoutStep, setCheckoutStep] =
        useState<"cart" | "customer">("cart");

    const [sendingOrder, setSendingOrder] =
        useState(false);

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

    const [orderSentOpen, setOrderSentOpen] =
        useState(false);


    function handleWhatsApp() {

        if (sendingOrder) {
            return;
        }

        setSendingOrder(true);

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

        let whatsapp = restaurant.whatsapp
            .replace(/\D/g, "")
            .trim();

        if (whatsapp.length === 10) {
            whatsapp = `57${whatsapp}`;
        }

        const url =
            `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;

        window.open(url, "_blank");

        setTimeout(() => {
            setOrderSentOpen(true);
        }, 500);

    }

    if (!open) return null;

    return (

        <>

            <OrderSentModal
                open={orderSentOpen}
                restaurantName={restaurant.name}
                onClose={() => {

                    setOrderSentOpen(false);

                    setCheckoutStep("cart");

                    clearCart();

                    setCustomerName("");

                    setAddress("");

                    setPaymentMethod("Efectivo");

                    setCashChange("");

                    setObservations("");

                    setSendingOrder(false);

                    setTimeout(() => {

                        onClose();

                        window.scrollTo({
                            top: 0,
                            behavior: "smooth",
                        });

                    }, 100);

                }}
            />

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

                        ) : checkoutStep === "cart" ? (

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

                        ) : (

                            <div className="space-y-4">

                                <div>

                                    <label className="mb-1 block text-sm font-medium">
                                        👤 Nombre
                                    </label>

                                    <input
                                        type="text"
                                        value={customerName}
                                        onChange={(e) =>
                                            setCustomerName(e.target.value)
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
                                        onChange={(e) =>
                                            setAddress(e.target.value)
                                        }
                                        placeholder="Dirección de entrega"
                                        className="w-full rounded-xl border border-gray-300 p-3"
                                    />

                                </div>

                                <div>

                                    <label className="mb-1 block text-sm font-medium">
                                        💳 Selecciona tu Forma de pago (Efectivo, Nequi, Llave...)
                                    </label>

                                    <select
                                        value={paymentMethod}
                                        onChange={(e) =>
                                            setPaymentMethod(e.target.value)
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
                                            onChange={(e) =>
                                                setCashChange(e.target.value)
                                            }
                                            placeholder="Ej: $50.000"
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
                                        onChange={(e) =>
                                            setObservations(e.target.value)
                                        }
                                        placeholder="Indicaciones para el pedido..."
                                        className="w-full rounded-xl border border-gray-300 p-3"
                                    />

                                </div>

                            </div>

                        )}

                    </div>

                    <footer className="border-t p-5">

                        <div className="mb-4 flex justify-between text-lg font-bold">

                            <span>Total</span>

                            <span className="text-red-600">
                                ${totalPrice.toLocaleString("es-CO")}
                            </span>

                        </div>

                        {items.length > 0 && checkoutStep === "cart" && (

                            <div className="flex gap-3">

                                <button
                                    onClick={onClose}
                                    className="flex-1 rounded-2xl border border-gray-300 py-4 font-semibold transition hover:bg-gray-100"
                                >
                                    ← Seguir comprando
                                </button>

                                <button
                                    onClick={() =>
                                        setCheckoutStep("customer")
                                    }
                                    className="flex-1 rounded-2xl bg-red-600 py-4 font-bold text-white transition hover:bg-red-700"
                                >
                                    Continuar →
                                </button>

                            </div>

                        )}

                        {items.length > 0 && checkoutStep === "customer" && (

                            <div className="space-y-3">

                                <button
                                    onClick={() =>
                                        setCheckoutStep("cart")
                                    }
                                    className="flex w-full items-center justify-center gap-2 rounded-2xl border py-3 font-semibold"
                                >
                                    <ArrowLeft size={18} />
                                    Volver al carrito
                                </button>

                                <button
                                    onClick={handleWhatsApp}
                                    disabled={sendingOrder}
                                    className="w-full rounded-2xl bg-green-600 py-4 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                                >
                                    {sendingOrder
                                        ? "⏳ Abriendo WhatsApp..."
                                        : "📲 Enviar pedido por WhatsApp"}
                                </button>

                            </div>

                        )}

                    </footer>

                </div>

            </div>
        </>

    );

}