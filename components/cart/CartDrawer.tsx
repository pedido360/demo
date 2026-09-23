"use client";

import { useState } from "react";
import { X, ArrowLeft } from "lucide-react";

import { Restaurant } from "@/types/restaurant";

import { buildWhatsAppMessage } from "@/lib/whatsapp";
import { recordRestaurantMetric } from "@/lib/repositories/restaurant-metrics.repository";

import { useCart } from "@/hooks/useCart";

import CartItem from "./CartItem";
import OrderSentModal from "./OrderSentModal";

import { RestaurantHour } from "@/types/restaurant-hour";

interface CartDrawerProps {
    restaurant: Restaurant;
    hours?: RestaurantHour[];
    isOpen: boolean;
    open: boolean;
    onClose: () => void;
}

type CheckoutStep =
    | "cart"
    | "customer"
    | "payment";

type DeliveryMethod =
    | "Domicilio"
    | "Recoger";

const paymentMethods = [
    "Efectivo",
    "Nequi",
    "Bre-B",
    "Transferencia",
    "Datáfono",
];

export default function CartDrawer({
    restaurant,
    hours,
    isOpen,
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
        useState<CheckoutStep>("cart");

    const [sendingOrder, setSendingOrder] =
        useState(false);

    const [customerName, setCustomerName] =
        useState("");

    const [address, setAddress] =
        useState("");

    const [deliveryMethod, setDeliveryMethod] =
        useState<DeliveryMethod>("Domicilio");

    const [paymentMethod, setPaymentMethod] =
        useState("Efectivo");

    const [cashChange, setCashChange] =
        useState("");

    const [observations, setObservations] =
        useState("");

    const [orderSentOpen, setOrderSentOpen] =
        useState(false);

    const canContinueToPayment =
        customerName.trim() !== "" &&
        (
            deliveryMethod === "Recoger" ||
            address.trim() !== ""
        );

    const canSend =
        canContinueToPayment &&
        paymentMethod.trim() !== "";

    async function handleWhatsApp() {
        if (!canSend) {
            return;
        }

        if (!isOpen) {
            alert(
                "🔴 Lo sentimos. El restaurante se encuentra cerrado en este momento y no está recibiendo pedidos."
            );

            return;
        }

        if (sendingOrder) {
            return;
        }

        setSendingOrder(true);

        const message = buildWhatsAppMessage(
            items,
            totalPrice,
            {
                customerName,
                address:
                    deliveryMethod === "Domicilio"
                        ? address
                        : "",
                restaurantAddress: restaurant.address,
                deliveryMethod,
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

        await recordRestaurantMetric(
            restaurant.id,
            "whatsapp_order"
        );

        window.open(url, "_blank");

        setTimeout(() => {
            setOrderSentOpen(true);
        }, 500);
    }

    if (!open) {
        return null;
    }

    function StepIndicator() {
        return (
            <div className="sticky top-0 z-10 border-b bg-white px-5 py-4">
                <div className="flex items-center justify-center gap-2 text-sm font-bold">
                    <span
                        className={`rounded-full px-4 py-2 ${
                            checkoutStep === "cart"
                                ? "bg-red-600 text-white"
                                : "bg-red-50 text-red-700"
                        }`}
                    >
                        1. PEDIDO
                    </span>

                    <span className="text-gray-300">
                        ›
                    </span>

                    <span
                        className={`rounded-full px-4 py-2 ${
                            checkoutStep === "customer"
                                ? "bg-red-600 text-white"
                                : checkoutStep === "payment"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-gray-100 text-gray-400"
                        }`}
                    >
                        2. DATOS
                    </span>

                    <span className="text-gray-300">
                        ›
                    </span>

                    <span
                        className={`rounded-full px-4 py-2 ${
                            checkoutStep === "payment"
                                ? "bg-red-600 text-white"
                                : "bg-gray-100 text-gray-400"
                        }`}
                    >
                        3. PAGO
                    </span>
                </div>
            </div>
        );
    }

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
                    setDeliveryMethod("Domicilio");
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
                            {checkoutStep === "cart"
                                ? "🛒 Tu pedido"
                                : checkoutStep === "customer"
                                    ? "👤 Tus datos"
                                    : "💳 ¿Cómo pagas?"}
                        </h2>

                        <button
                            onClick={onClose}
                            className="rounded-full p-2 hover:bg-gray-100"
                        >
                            <X size={24} />
                        </button>
                    </header>

                    <StepIndicator />

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
                        ) : checkoutStep === "customer" ? (
                            <div className="space-y-5">
                                <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
                                    <p className="text-sm leading-6 text-blue-800">
                                        Completa tus datos para continuar
                                        al paso de pago.
                                    </p>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        👤 Nombre
                                        <span className="text-red-600">
                                            {" "}*
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        value={customerName}
                                        onChange={(e) =>
                                            setCustomerName(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Ej: Juan Pérez"
                                        className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        ¿Cómo quieres recibir tu pedido?
                                    </label>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setDeliveryMethod(
                                                    "Domicilio"
                                                )
                                            }
                                            className={`rounded-2xl border-2 p-4 text-left transition ${
                                                deliveryMethod ===
                                                "Domicilio"
                                                    ? "border-red-600 bg-red-50"
                                                    : "border-gray-200 bg-white hover:border-gray-300"
                                            }`}
                                        >
                                            <div className="text-xl">
                                                🛵
                                            </div>

                                            <div className="mt-2 font-semibold">
                                                Domicilio
                                            </div>

                                            <div className="mt-1 text-xs text-gray-500">
                                                Recíbelo en tu dirección
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setDeliveryMethod(
                                                    "Recoger"
                                                )
                                            }
                                            className={`rounded-2xl border-2 p-4 text-left transition ${
                                                deliveryMethod ===
                                                "Recoger"
                                                    ? "border-red-600 bg-red-50"
                                                    : "border-gray-200 bg-white hover:border-gray-300"
                                            }`}
                                        >
                                            <div className="text-xl">
                                                🏪
                                            </div>

                                            <div className="mt-2 font-semibold">
                                                Recoger
                                            </div>

                                            <div className="mt-1 text-xs text-gray-500">
                                                Recógelo en el restaurante
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {deliveryMethod ===
                                    "Domicilio" && (
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            📍 Dirección
                                            <span className="text-red-600">
                                                {" "}*
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            value={address}
                                            onChange={(e) =>
                                                setAddress(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Agrega tu dirección de entrega 📍"
                                            className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        📝 Observaciones
                                    </label>

                                    <textarea
                                        rows={4}
                                        value={observations}
                                        onChange={(e) =>
                                            setObservations(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Indicaciones para el pedido..."
                                        className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                                    <p className="text-sm leading-6 text-amber-800">
                                        Selecciona cómo quieres pagar.
                                        El restaurante recibirá esta
                                        información junto con tu pedido.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    {paymentMethods.map(
                                        (method) => (
                                            <button
                                                key={method}
                                                type="button"
                                                onClick={() =>
                                                    setPaymentMethod(
                                                        method
                                                    )
                                                }
                                                className={`w-full rounded-2xl border-2 p-4 text-left transition ${
                                                    paymentMethod ===
                                                    method
                                                        ? "border-red-600 bg-red-50"
                                                        : "border-gray-200 bg-white hover:border-gray-300"
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                                                            paymentMethod ===
                                                            method
                                                                ? "border-red-600"
                                                                : "border-gray-300"
                                                        }`}
                                                    >
                                                        {paymentMethod ===
                                                            method && (
                                                            <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                                                        )}
                                                    </span>

                                                    <span className="font-semibold">
                                                        {method}
                                                    </span>
                                                </div>
                                            </button>
                                        )
                                    )}
                                </div>

                                {paymentMethod ===
                                    "Efectivo" && (
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            💵 ¿Con cuánto vas a pagar?
                                        </label>

                                        <input
                                            type="text"
                                            value={cashChange}
                                            onChange={(e) =>
                                                setCashChange(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Ej: $50.000"
                                            className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <footer className="border-t bg-white p-5">
                        <div className="mb-4 flex items-center justify-between text-lg font-bold">
                            <span>Total</span>

                            <span className="text-2xl text-red-600">
                                $
                                {totalPrice.toLocaleString(
                                    "es-CO"
                                )}
                            </span>
                        </div>

                        <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-xs leading-5 text-amber-800">
                            💡 El valor del pedido no incluye
                            el costo del domicilio. En seguida
                            te informaremos el valor para
                            confirmar el despacho.
                        </p>

                        {items.length > 0 &&
                            checkoutStep === "cart" && (
                                <div className="space-y-3">
                                    <button
                                        onClick={() =>
                                            setCheckoutStep(
                                                "customer"
                                            )
                                        }
                                        className="w-full rounded-2xl bg-red-600 py-4 font-bold text-white transition hover:bg-red-700"
                                    >
                                        Continuar → tus datos
                                    </button>

                                    <button
                                        onClick={onClose}
                                        className="w-full rounded-2xl border border-gray-300 py-4 font-semibold transition hover:bg-gray-100"
                                    >
                                        Seguir comprando
                                    </button>
                                </div>
                            )}

                        {items.length > 0 &&
                            checkoutStep === "customer" && (
                                <div className="space-y-3">
                                    <button
                                        onClick={() =>
                                            setCheckoutStep(
                                                "payment"
                                            )
                                        }
                                        disabled={
                                            !canContinueToPayment
                                        }
                                        className={`w-full rounded-2xl py-4 font-bold text-white transition ${
                                            canContinueToPayment
                                                ? "bg-red-600 hover:bg-red-700"
                                                : "cursor-not-allowed bg-gray-300"
                                        }`}
                                    >
                                        {canContinueToPayment
                                            ? "Continuar → pago"
                                            : "Completa nombre y dirección"}
                                    </button>

                                    <button
                                        onClick={() =>
                                            setCheckoutStep(
                                                "cart"
                                            )
                                        }
                                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-300 py-3 font-semibold transition hover:bg-gray-100"
                                    >
                                        <ArrowLeft size={18} />
                                        Volver al pedido
                                    </button>
                                </div>
                            )}

                        {items.length > 0 &&
                            checkoutStep === "payment" && (
                                <div className="space-y-3">
                                    <button
                                        onClick={handleWhatsApp}
                                        disabled={
                                            sendingOrder ||
                                            !canSend
                                        }
                                        className={`w-full rounded-2xl py-4 font-bold text-white transition ${
                                            canSend &&
                                            !sendingOrder
                                                ? "bg-green-600 hover:bg-green-700"
                                                : "cursor-not-allowed bg-gray-300"
                                        }`}
                                    >
                                        {sendingOrder
                                            ? "⏳ Abriendo WhatsApp..."
                                            : "📲 Confirmar y enviar por WhatsApp"}
                                    </button>

                                    <button
                                        onClick={() =>
                                            setCheckoutStep(
                                                "customer"
                                            )
                                        }
                                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-300 py-3 font-semibold transition hover:bg-gray-100"
                                    >
                                        <ArrowLeft size={18} />
                                        Volver a mis datos
                                    </button>
                                </div>
                            )}
                    </footer>
                </div>
            </div>
        </>
    );
}
