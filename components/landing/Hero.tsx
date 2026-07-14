import { restaurant } from "@/data/restaurant";

export default function Hero() {
    return (
        <section className="min-h-screen bg-gray-100">
            {/* Banner */}
            <div className="h-56 bg-gradient-to-r from-red-600 to-red-700"></div>

            {/* Card principal */}
            <div className="-mt-16 px-5">
                <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-6">

                    {/* Logo */}
                    <div className="flex justify-center">
                        <div className="w-28 h-28 rounded-full bg-white shadow-lg border-4 border-white flex items-center justify-center text-4xl">
                            🍔
                        </div>
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
                        <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                            {restaurant.isOpen ? "🟢 Abierto" : "🔴 Cerrado"}
                        </span>
                    </div>

                    {/* Dirección */}
                    <p className="text-center text-gray-500 mt-4">
                        📍 {restaurant.address}
                    </p>

                    {/* Botón */}
                    <button className="mt-8 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition-all">
                        Ver Menú
                    </button>

                </div>
            </div>
        </section>
    );
}