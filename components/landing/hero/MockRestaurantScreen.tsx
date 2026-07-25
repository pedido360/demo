"use client";

import Image from "next/image";
import Link from "next/link";

export default function MockRestaurantScreen() {
    return (
        <Link
            href="/demo"
            className="group block h-full w-full"
            aria-label="Abrir demo interactivo"
        >
            <div className="relative h-full w-full overflow-hidden bg-white">
                <Image
                    src="/demo-phone2.png"
                    alt="Demo interactivo de Pedidos360"
                    fill
                    priority
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                />

                {/* Ligero efecto al pasar el mouse */}
                <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/[0.03]" />
            </div>
        </Link>
    );
}