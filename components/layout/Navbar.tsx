"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Logo from "@/components/ui/Logo";

const links = [
  { name: "Funciones", href: "#funciones" },
  { name: "Beneficios", href: "#beneficios" },
  { name: "Planes", href: "#planes" },
  { name: "Contacto", href: "#contacto" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 p-4">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between rounded-2xl border bg-white px-6 shadow-md">
        <Logo />

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-gray-600 hover:text-orange-500 transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <Link
          href="/demo"
          className="hidden rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 lg:block"
        >
          Probar Demo
        </Link>

        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden"
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {open && (
        <div className="mx-4 mt-2 rounded-2xl border bg-white p-6 shadow-md lg:hidden">
          <nav className="flex flex-col gap-4">
            {links.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            <Link
              href="/demo"
              className="rounded-xl bg-orange-500 py-3 text-center font-semibold text-white"
            >
              Probar Demo
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}