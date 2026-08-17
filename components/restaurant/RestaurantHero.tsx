import Image from "next/image";

import { Restaurant } from "@/types/restaurant";
import { RestaurantHour } from "@/types/restaurant-hour";
import { isRestaurantOpen } from "@/lib/utils/isRestaurantOpen";

interface RestaurantHeroProps {
    restaurant: Restaurant;
    hours?: RestaurantHour[];
}

export default function RestaurantHero({
    restaurant,
    hours,
}: RestaurantHeroProps) {
    const isDemo = restaurant.slug === "demo";

    const open = isDemo
        ? true
        : isRestaurantOpen(hours ?? []);

    return (
        <section className="bg-gray-100">

            {/* =========================
                AVISO DEMO
            ========================== */}
            {isDemo && (
                <div className="relative z-50 border-b border-blue-100 bg-blue-50 px-4 py-3">
                    <p className="text-center text-sm font-medium text-blue-800">
                        🚀 <strong>BIENVENIDO AL DEMO INTERACTIVO</strong>
                        <strong> - PEDIDOS 360</strong> ·
                        Personaliza este menú para cualquier tipo de negocio.
                    </p>
                </div>
            )}

            {/* =========================
                BANNER
            ========================== */}
            <div className="relative z-0 h-56 w-full">

                {isDemo ? (
                    <Image
                        src={restaurant.banner}
                        alt={restaurant.name}
                        fill
                        priority
                        sizes="100vw"
                        className="absolute inset-0 z-0 object-cover object-center"
                    />
                ) : (
                    <div
                        className="absolute inset-0 z-0 bg-cover bg-center"
                        style={{
                            backgroundImage: `url(${restaurant.banner})`,
                        }}
                    />
                )}

            </div>

            {/* =========================
                CONTENIDO SOBRE EL BANNER
            ========================== */}
            <div className="relative z-30 -mt-16 px-5">

                {/* =========================
                    TARJETA BLANCA
                ========================== */}
                <div className="relative z-30 rounded-3xl bg-white p-6 shadow-xl">

                    {/* LOGO */}
                    <div className="relative z-40 flex justify-center">

                        {isDemo ? (
                            <Image
                                src={restaurant.logo}
                                alt={restaurant.name}
                                width={112}
                                height={112}
                                priority
                                sizes="112px"
                                className="relative z-40 h-28 w-28 rounded-full border-4 border-white bg-white object-cover shadow-lg"
                            />
                        ) : (
                            <img
                                src={restaurant.logo}
                                alt={restaurant.name}
                                className="relative z-40 h-28 w-28 rounded-full border-4 border-white bg-white object-cover shadow-lg"
                            />
                        )}

                    </div>

                    {/* NOMBRE */}
                    <h1 className="relative z-40 mt-4 text-center text-3xl font-bold">
                        {restaurant.name}
                    </h1>

                    {/* DESCRIPCIÓN */}
                    <p className="relative z-40 mt-2 text-center text-gray-500">
                        {restaurant.description}
                    </p>

                    {/* ESTADO */}
                    <div className="relative z-40 mt-4 flex justify-center">

                        <span
                            className={`rounded-full px-4 py-2 text-sm font-semibold ${open
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                                }`}
                        >
                            {open
                                ? "🟢 Abierto ahora"
                                : "🔴 Cerrado"}
                        </span>

                    </div>

                    {/* RATING */}
                    <div className="relative z-40 mt-4 flex items-center justify-center gap-2">
                        ⭐⭐⭐⭐⭐

                        <span className="font-semibold">
                            {restaurant.rating}
                        </span>
                    </div>

                    {/* DEMO ACTIVO */}
                    {isDemo && (
                        <div className="relative z-40 mt-4 flex justify-center">

                            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
                                🚀 Demo Activo
                            </span>

                        </div>
                    )}

                </div>

                {/* =========================
                    UBICACIÓN
                ========================== */}
                <div className="relative z-30 mt-6 text-center text-gray-500">

                    <div className="mb-3 text-2xl">
                        📍
                    </div>

                    <p className="font-medium text-gray-700">
                        {restaurant.address}
                    </p>

                    {restaurant.neighborhood && (
                        <p className="mt-2 text-base font-medium text-gray-700">
                            Barrio {restaurant.neighborhood}
                        </p>
                    )}

                    <p className="mt-2 text-base">
                        {restaurant.city}
                    </p>

                    <p className="mt-1 text-sm">
                        {restaurant.department}
                    </p>

                </div>

                {/* =========================
                    BOTÓN PEDIDO
                ========================== */}
                <button
                    onClick={() =>
                        document
                            .getElementById("menu")
                            ?.scrollIntoView({
                                behavior: "smooth",
                            })
                    }
                    className="relative z-30 mt-8 w-full rounded-2xl bg-red-600 py-4 text-lg font-bold text-white transition-all hover:bg-red-700"
                >
                    🛒 Haz tu pedido
                </button>

            </div>

        </section>
    );
}