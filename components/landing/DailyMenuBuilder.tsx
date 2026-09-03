import Image from "next/image";
import DailyMenuFlow from "@/components/demo/DailyMenuFlow";

import {
    ArrowRight,
    CheckCircle2,
    Sparkles,
    Utensils,
} from "lucide-react";


export default function DailyMenuBuilder() {

    return (

        <section
            id="menu-del-dia"
            className="
                relative
                overflow-hidden
                bg-gray-950
                py-16
                text-white
                sm:py-20
                lg:py-28
            "
        >

            {/* Decoración */}

            <div className="pointer-events-none absolute -left-32 top-20 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl sm:h-80 sm:w-80" />

            <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-green-500/10 blur-3xl sm:h-96 sm:w-96" />


            <div className="relative mx-auto max-w-7xl px-5 sm:px-6">

                <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">


                    {/* =====================================================
                        INFORMACIÓN
                    ===================================================== */}

                    <div className="text-center lg:text-left">

                        <span
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-full
                                border
                                border-orange-400/30
                                bg-orange-500/10
                                px-4
                                py-2
                                text-xs
                                font-bold
                                text-orange-300
                                sm:text-sm
                            "
                        >

                            <Sparkles className="h-4 w-4" />

                            NUEVO EN PEDIDOS360

                        </span>


                        <h2
                            className="
                                mt-5
                                text-4xl
                                font-extrabold
                                leading-[1.05]
                                tracking-tight
                                sm:text-5xl
                                lg:text-6xl
                            "
                        >

                            Crea tu

                            <br />

                            <span className="text-orange-400">
                                Menú del Día.
                            </span>

                        </h2>


                        <p
                            className="
                                mx-auto
                                mt-5
                                max-w-xl
                                text-base
                                leading-7
                                text-gray-300
                                sm:text-lg
                                sm:leading-8
                                lg:mx-0
                            "
                        >

                            Configura tus opciones, tamaños y precios.
                            Tu cliente arma su menú y realiza el pedido
                            desde tu menú digital.

                        </p>


                        {/* BENEFICIOS */}

                        <div className="mx-auto mt-7 max-w-md space-y-3 text-left lg:mx-0">

                            {[
                                "Sopas, secos y principios",
                                "Proteínas, bebidas y postres",
                                "Tamaños y precios personalizados",
                                "El sistema configura el menú del dia y crea la imagen para descargar",
                                "El cliente elige sus componentes y hace el pedido",
                            ].map((item) => (

                                <div
                                    key={item}
                                    className="flex items-center gap-3"
                                >

                                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-400" />

                                    <span className="text-sm text-gray-200 sm:text-base">
                                        {item}
                                    </span>

                                </div>

                            ))}

                        </div>


                        {/* CTA */}

                        <div className="mt-8 flex justify-center lg:justify-start">

                            <a
                                href="/demo#menu-del-dia-demo"
                                className="
                                    inline-flex
                                    w-full
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-2xl
                                    bg-orange-500
                                    px-6
                                    py-4
                                    text-base
                                    font-extrabold
                                    text-white
                                    shadow-lg
                                    transition
                                    hover:bg-orange-400
                                    sm:w-auto
                                "
                            >

                                Ver cómo funciona para tus clientes

                                <ArrowRight className="h-5 w-5" />

                            </a>

                        </div>

                        <div className="mt-4">
                            <DailyMenuFlow />
                        </div>

                    </div>


                    {/* =====================================================
                        VISTA DEL PRODUCTO
                    ===================================================== */}

                    <div className="relative mx-auto w-full max-w-md sm:max-w-lg">

                        <div
                            className="
                                overflow-hidden
                                rounded-[28px]
                                border
                                border-white/10
                                bg-white
                                shadow-2xl
                                sm:rounded-[32px]
                            "
                        >

                            {/* IMAGEN DEL MENÚ */}

                            <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">

                                <Image
                                    src="/images/products/daily-menu.jpg"
                                    alt="Menú del Día de Pedidos360"
                                    fill
                                    sizes="(max-width: 640px) 100vw, 520px"
                                    className="object-cover"
                                />

                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent p-5 sm:p-6">

                                    <div className="flex items-end justify-between gap-4">

                                        <div>

                                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
                                                Menú del Día
                                            </p>

                                            <h3 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">
                                                Arma tu menú
                                            </h3>

                                        </div>

                                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-orange-600 shadow-lg">

                                            <Utensils className="h-5 w-5" />

                                        </div>

                                    </div>

                                </div>

                            </div>


                            {/* SELECTOR */}

                            <div className="p-5 sm:p-6">

                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                                            Personaliza
                                        </p>

                                        <h3 className="mt-1 text-lg font-extrabold text-gray-900 sm:text-xl">
                                            Elige tus favoritos
                                        </h3>

                                    </div>

                                    <span className="rounded-full bg-green-50 px-3 py-1.5 text-[10px] font-bold text-green-700 sm:text-xs">
                                        A tu gusto
                                    </span>

                                </div>


                                <div className="mt-4 grid grid-cols-2 gap-2.5">

                                    <MenuChoice
                                        label="Proteína"
                                        value="Pechuga a la plancha"
                                        active
                                    />

                                    <MenuChoice
                                        label="Bebida"
                                        value="Jugo natural"
                                    />

                                    <MenuChoice
                                        label="Principio"
                                        value="Arroz + ensalada"
                                    />

                                    <MenuChoice
                                        label="Postre"
                                        value="Flan casero"
                                    />

                                </div>


                                {/* PRECIO */}

                                <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl bg-orange-50 px-4 py-3.5">

                                    <div>

                                        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
                                            Menú completo
                                        </p>

                                        <p className="mt-0.5 text-xs font-medium text-gray-600">
                                            Desde $22.000
                                        </p>

                                    </div>

                                    <strong className="text-xl font-extrabold text-orange-600 sm:text-2xl">
                                        $25.000
                                    </strong>

                                </div>


                                {/* CTA VISUAL */}

                                <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3.5 text-sm font-extrabold text-white">

                                    <span>
                                        Agregar al pedido
                                    </span>

                                    <ArrowRight className="h-4 w-4" />

                                </div>

                            </div>

                        </div>


                        {/* BADGE */}

                        <div
                            className="
                                absolute
                                -bottom-4
                                left-1/2
                                -translate-x-1/2
                                whitespace-nowrap
                                rounded-2xl
                                bg-green-600
                                px-4
                                py-2.5
                                text-xs
                                font-bold
                                text-white
                                shadow-xl
                                sm:-bottom-5
                                sm:left-auto
                                sm:right-4
                                sm:translate-x-0
                                sm:px-5
                                sm:py-3
                                sm:text-sm
                            "
                        >

                            ✨ Tú decides qué ofrecer

                        </div>

                    </div>

                </div>

            </div>

        </section>
    );
}


function MenuChoice({
    label,
    value,
    active = false,
}: {
    label: string;
    value: string;
    active?: boolean;
}) {

    return (

        <div
            className={`
                rounded-2xl
                border
                px-3
                py-3
                ${active
                    ? "border-orange-200 bg-orange-50"
                    : "border-gray-100 bg-gray-50"
                }
            `}
        >

            <p
                className={`
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-wide
                    ${active
                        ? "text-orange-600"
                        : "text-gray-400"
                    }
                `}
            >
                {label}
            </p>

            <p className="mt-1 line-clamp-1 text-xs font-bold text-gray-800">
                {value}
            </p>

        </div>

    );
}