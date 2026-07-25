import { restaurant } from "@/data/restaurant";

export default function RestaurantHero() {
    return (
        <section className="bg-gray-100">
            <div className="border-b border-blue-100 bg-blue-50 px-4 py-3">
                <p className="text-center text-sm font-medium text-blue-800">
                    🚀 <strong>BIENVENIDO AL DEMO INTERACTIVO</strong> ·
                    Personaliza este menú para cualquier restaurante.
                </p>
            </div>

            {/* Banner */}
            <div
                className="h-56 bg-cover bg-center"
                style={{
                    backgroundImage: `url(${restaurant.banner})`,
                }}
            />

            {/* Tarjeta principal */}
            <div className="-mt-16 px-5">
                <div className="rounded-3xl bg-white p-6 shadow-xl">

                    {/* Logo */}
                    <div className="flex justify-center">
                        <img
                            src={restaurant.logo}
                            alt={restaurant.name}
                            className="h-28 w-28 rounded-full border-4 border-white bg-white object-cover shadow-lg"
                        />
                    </div>

                    {/* Nombre */}
                    <h1 className="mt-4 text-center text-3xl font-bold">
                        {restaurant.name}
                    </h1>

                    {/* Descripción */}
                    <p className="mt-2 text-center text-gray-500">
                        {restaurant.description}
                    </p>

                    {/* Rating */}
                    <div className="mt-4 flex items-center justify-center gap-2">
                        ⭐⭐⭐⭐⭐
                        <span className="font-semibold">
                            {restaurant.rating}
                        </span>
                    </div>

                    {/* Estado */}
                    <div className="mt-4 flex justify-center">
                        <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
                            🚀 Demo Activo
                        </span>
                    </div>

                    {/* Dirección */}
                    <p className="mt-4 text-center text-gray-500">
                        📍 {restaurant.city}
                    </p>

                    {/* Botón */}
                    <button className="mt-8 w-full rounded-2xl bg-red-600 py-4 font-bold text-white transition-all hover:bg-red-700">
                        Explorar Menú
                    </button>

                </div>
            </div>
        </section>
    );
}