"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Store,
    Package,
    Tags,
    ShoppingCart,
    Users,
    Settings,
} from "lucide-react";

interface MenuItem {
    title: string;
    href?: string;
    icon: React.ElementType;
    elite?: boolean;
}

const menuItems: MenuItem[] = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Restaurantes",
        href: "/dashboard/restaurants",
        icon: Store,
    },
    {
        title: "Categorías",
        href: "/dashboard/restaurants",
        icon: Tags,
    },
    {
        title: "Productos",
        href: "/dashboard/restaurants",
        icon: Package,
    },
    {
        title: "Pedidos",
        icon: ShoppingCart,
        elite: true,
    },
    {
        title: "Usuarios",
        icon: Users,
        elite: true,
    },
    {
        title: "Configuración",
        icon: Settings,
        elite: true,
    },
];

export default function Sidebar() {

    const pathname = usePathname();

    function handleEliteClick() {

        alert(
            "🚀 Esta funcionalidad estará disponible en la versión ELITE de Pedidos360."
        );

    }

    return (

        <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">

            <div className="border-b border-gray-200 px-6 py-5">

                <h1 className="text-2xl font-bold text-green-600">
                    Pedidos360
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Panel Administrativo
                </p>

            </div>

            <nav className="flex-1 overflow-y-auto p-4">

                <ul className="space-y-2">

                    {menuItems.map((item) => {

                        const Icon = item.icon;

                        if (item.elite) {

                            return (

                                <li key={item.title}>

                                    <button
                                        type="button"
                                        onClick={handleEliteClick}
                                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-gray-500 transition-all hover:bg-gray-100"
                                    >

                                        <Icon size={20} />

                                        <span className="font-medium">
                                            {item.title}
                                        </span>

                                    </button>

                                </li>

                            );

                        }

                        const active =
                            pathname === item.href ||
                            pathname.startsWith(item.href + "/");

                        return (

                            <li key={item.title}>

                                <Link
                                    href={item.href!}
                                    className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${active
                                        ? "bg-green-600 text-white"
                                        : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                >

                                    <Icon size={20} />

                                    <span className="font-medium">
                                        {item.title}
                                    </span>

                                </Link>

                            </li>

                        );

                    })}

                </ul>

            </nav>

            <div className="border-t border-gray-200 p-5">

                <p className="text-xs text-gray-500">
                    Pedidos360 Admin
                </p>

                <p className="text-xs text-gray-400">
                    v0.2.0
                </p>

            </div>

        </aside>

    );

}