import { restaurant } from "@/data/restaurant";

export default function Hero() {
    return (
        <section className="bg-gray-100">
            <div className="bg-blue-50 border-b border-blue-100 py-3 px-4">
                <p className="text-center text-sm font-medium text-blue-800">
                    🚀 <strong>BIENVENIDO AL DEMO INTERACTIVO</strong> ·  Personaliza este menu para cualquier restaurante.
                </p>
            </div>

            {/* Banner */}
            <div
                className="h-56 bg-cover bg-center"
                style={{
                    backgroundImage: `url(${restaurant.banner})`,
                }}
            ></div>

            {/* Card principal */}
            <div className="-mt-16 px-5">
                <div className="bg-white rounded-3xl shadow-xl p-6">

                    {/* Logo */}
                    <div className="flex justify-center">
                        <img
                            src="/logo-demo.png"
                            alt="Pedidos360"
                            className="w-28 h-28 rounded-full bg-white shadow-lg border-4 border-white object-cover"
                        />
                    </div>

                    {/* Nombre */}
                    <h1 className="text-3xl font-bold text-center mt-4">
                        {restaurant.name}
                    </h1>

                    {/* Descripción */}
                    <p className="text-center text-gray-500 mt-2">
                        {restaurant.description}
                    </p>

                    {/* Rating */}
                    <div className="flex justify-center items-center gap-2 mt-4">
                        ⭐⭐⭐⭐⭐
                        <span className="font-semibold">
                            {restaurant.rating}
                        </span>
                    </div>

                    {/* Estado */}
                    <div className="flex justify-center mt-4">
                        <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                            🚀 Demo Activo
                        </span>
                    </div>

                    {/* Dirección */}
                    <p className="text-center text-gray-500 mt-4">
                        📍 Personalizable para cualquier restaurante
                    </p>

                    {/* Botón */}
                    <button className="mt-8 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition-all">
                        Explorar Menú
                    </button>

                </div>
            </div>
        </section>
    );
}