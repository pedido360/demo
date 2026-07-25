import { Heart } from "lucide-react";

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="border-t border-gray-200 bg-gray-950 text-gray-300">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">

                <div>
                    <h3 className="text-2xl font-bold text-white">
                        Pedidos360
                    </h3>

                    <p className="mt-2 text-sm text-gray-400">
                        La nueva forma de recibir pedidos.
                    </p>
                </div>

                <div className="text-center md:text-right">
                    <p className="flex items-center justify-center gap-2 text-sm text-gray-400 md:justify-end">
                        Hecho con <Heart className="h-4 w-4 fill-red-500 text-red-500" /> para restaurantes.
                    </p>

                    <p className="mt-2 text-xs text-gray-500">
                        © {year} Pedidos360. Todos los derechos reservados.
                    </p>
                </div>

            </div>
        </footer>
    );
}