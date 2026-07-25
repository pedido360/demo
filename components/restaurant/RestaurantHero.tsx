export default function RestaurantHero() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white">

            <div className="px-5 pt-8 pb-12">

                <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
                    ⭐ Los favoritos de nuestros clientes
                </div>

                <h1 className="mt-4 text-3xl font-bold">
                    Restaurante Demo
                </h1>

                <p className="mt-2 text-sm leading-6 text-red-100">
                    Disfruta de hamburguesas, pizzas, perros calientes y mucho más.
                    Pide online de forma rápida y sencilla.
                </p>

            </div>

            {/* Curva */}
            <div className="absolute -bottom-7 left-0 h-14 w-full rounded-t-[36px] bg-white" />
        </section>
    );
}