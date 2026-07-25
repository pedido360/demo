export default function MockRestaurantScreen() {
    const products = [
        {
            emoji: "🍔",
            name: "Burger Clásica",
            desc: "Carne 180g • Papas",
            price: "$9.90",
        },
        {
            emoji: "🍕",
            name: "Pizza Pepperoni",
            desc: "Masa artesanal",
            price: "$14.50",
        },
        {
            emoji: "🌮",
            name: "Tacos BBQ",
            desc: "3 unidades",
            price: "$8.50",
        },
        {
            emoji: "🥗",
            name: "Caesar Salad",
            desc: "Pollo grillado",
            price: "$7.90",
        },
    ];

    return (
        <div className="h-full overflow-hidden bg-gray-50">

            {/* Status bar */}
            <div className="flex items-center justify-between px-6 pt-12 pb-3 text-[11px] font-semibold">
                <span>9:41</span>
                <span>📶 📡 🔋</span>
            </div>

            {/* Header */}
            <div className="px-5">
                <div className="rounded-2xl bg-white p-4 shadow-sm">

                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-2xl">
                            🍔
                        </div>

                        <div>
                            <h3 className="font-bold text-gray-900">
                                Burger House
                            </h3>

                            <p className="text-xs text-gray-500">
                                ★ 4.9 · 20-30 min
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-400">
                        🔍 Buscar hamburguesas...
                    </div>

                </div>
            </div>

            {/* Banner */}
            <div className="px-5 pt-4">
                <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 p-5 text-white shadow-lg">
                    <p className="text-xs uppercase opacity-80">
                        Promoción
                    </p>

                    <h2 className="mt-1 text-lg font-bold">
                        30% OFF
                    </h2>

                    <p className="text-sm opacity-90">
                        En tu primer pedido
                    </p>
                </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-hidden px-5 pt-4 text-sm">
                <div className="rounded-full bg-orange-500 px-4 py-2 font-medium text-white">
                    Burgers
                </div>

                <div className="rounded-full bg-white px-4 py-2 shadow">
                    Pizza
                </div>

                <div className="rounded-full bg-white px-4 py-2 shadow">
                    Tacos
                </div>

                <div className="rounded-full bg-white px-4 py-2 shadow">
                    Ensaladas
                </div>
            </div>

            {/* Products */}
            <div className="space-y-3 px-5 py-4">

                {products.map((item) => (

                    <div
                        key={item.name}
                        className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm"
                    >
                        <div className="flex items-center gap-3">

                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange-100 text-3xl">
                                {item.emoji}
                            </div>

                            <div>
                                <h4 className="font-semibold text-gray-900">
                                    {item.name}
                                </h4>

                                <p className="text-xs text-gray-500">
                                    {item.desc}
                                </p>

                                <p className="mt-1 font-bold text-orange-600">
                                    {item.price}
                                </p>
                            </div>

                        </div>

                        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-xl font-bold text-white">
                            +
                        </button>

                    </div>

                ))}

            </div>

            {/* Floating Cart */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                <div className="flex items-center gap-3 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-xl">
                    <span>🛒</span>
                    <span>3 productos</span>
                </div>
            </div>

        </div>
    );
}