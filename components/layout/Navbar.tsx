"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Logo from "@/components/ui/Logo";

const links = [
  { name: "¿Qué es?", href: "#inicio" },
  { name: "Funciones", href: "#funciones" },
  { name: "Menú del Día", href: "#menu-del-dia" },
  { name: "Cómo funciona", href: "#como-funciona" },
  { name: "Representación", href: "/representacion" },
];

export default function Navbar() {

  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4">

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between rounded-2xl border border-gray-200 bg-white/95 px-4 shadow-md backdrop-blur sm:h-20 sm:px-6">

        <Logo />


        {/* =====================================================
                    DESKTOP
                ===================================================== */}

        <nav className="hidden items-center gap-6 lg:flex">

          {links.map((item) => (

            <Link
              key={item.name}
              href={item.href}
              className="
                                text-sm
                                font-medium
                                text-gray-600
                                transition-colors
                                hover:text-orange-500
                            "
            >
              {item.name}
            </Link>

          ))}

        </nav>


        {/* CTA DESKTOP */}

        <Link
          href="/demo"
          className="
                        hidden
                        rounded-xl
                        bg-orange-500
                        px-5
                        py-3
                        text-sm
                        font-bold
                        text-white
                        shadow-sm
                        transition
                        hover:bg-orange-600
                        lg:block
                    "
        >
          Ver Demo
        </Link>


        {/* =====================================================
                    MOBILE
                ===================================================== */}

        <button
          type="button"
          aria-label={
            open
              ? "Cerrar menú"
              : "Abrir menú"
          }
          onClick={() => setOpen(!open)}
          className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        text-gray-700
                        transition
                        hover:bg-gray-100
                        lg:hidden
                    "
        >

          {open
            ? <X size={25} />
            : <Menu size={25} />
          }

        </button>

      </div>


      {/* =========================================================
                MENÚ MOBILE
            ========================================================= */}

      {open && (

        <div
          className="
                        mx-3
                        mt-2
                        rounded-2xl
                        border
                        border-gray-200
                        bg-white
                        p-4
                        shadow-xl
                        sm:mx-4
                        sm:p-5
                        lg:hidden
                    "
        >

          <nav className="flex flex-col">

            {links.map((item) => (

              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className="
                                    rounded-xl
                                    px-4
                                    py-3.5
                                    text-sm
                                    font-semibold
                                    text-gray-700
                                    transition
                                    hover:bg-orange-50
                                    hover:text-orange-600
                                "
              >
                {item.name}
              </Link>

            ))}


            <Link
              href="/demo"
              onClick={() => setOpen(false)}
              className="
                                mt-3
                                flex
                                items-center
                                justify-center
                                rounded-xl
                                bg-orange-500
                                px-5
                                py-3.5
                                text-sm
                                font-bold
                                text-white
                                shadow-sm
                                transition
                                hover:bg-orange-600
                            "
            >
              Ver Demo
            </Link>

          </nav>

        </div>

      )}

    </header>
  );
}