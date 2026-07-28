"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Store,
    Settings,
} from "lucide-react";

const menuItems = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Restaurantes",
        href: "/admin/restaurants",
        icon: Store,
    },
    {
        title: "Configuración",
        href: "/admin/settings",
        icon: Settings,
    },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
            {/* Logo */}
            <div className="border-b border-gray-200 px-6 py-5">
                <h1 className="text-2xl font-bold text-green-600">
                    Pedidos360
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Panel Administrativo
                </p>
            </div>

            {/* Navegación */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        const active =
                            pathname === item.href ||
                            pathname.startsWith(item.href + "/");

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
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

            {/* Footer */}
            <div className="border-t border-gray-200 p-5">
                <p className="text-xs text-gray-500">
                    Pedidos360 Admin
                </p>

                <p className="text-xs text-gray-400">
                    Versión 1.0
                </p>
            </div>
        </aside>
    );
}