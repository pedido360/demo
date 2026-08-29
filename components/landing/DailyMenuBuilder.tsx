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
                                "El cliente elige sus componentes",
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
                                href="/demo"
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

                                Ver cómo funciona

                                <ArrowRight className="h-5 w-5" />

                            </a>

                        </div>

                    </div>


                    {/* =====================================================
                        CONSTRUCTOR VISUAL
                    ===================================================== */}

                    <div className="relative mx-auto w-full max-w-xl">

                        <div
                            className="
                                rounded-[28px]
                                border
                                border-white/10
                                bg-white
                                p-4
                                shadow-2xl
                                sm:rounded-[32px]
                                sm:p-6
                            "
                        >

                            {/* CABECERA */}

                            <div className="flex items-center justify-between border-b border-gray-100 pb-4 sm:pb-5">

                                <div className="min-w-0">

                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 sm:text-xs">
                                        Pedidos360
                                    </p>

                                    <h3 className="mt-1 truncate text-xl font-extrabold text-gray-900 sm:text-2xl">
                                        Menú del Día
                                    </h3>

                                </div>


                                <div className="ml-3 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 sm:h-12 sm:w-12 sm:rounded-2xl">

                                    <Utensils className="h-5 w-5 sm:h-6 sm:w-6" />

                                </div>

                            </div>


                            {/* OPCIONES */}

                            <div className="mt-4 space-y-2.5 sm:mt-6 sm:space-y-3">

                                <BuilderRow
                                    emoji="🥣"
                                    title="Sopa"
                                    value="Sopa del día"
                                />

                                <BuilderRow
                                    emoji="🍚"
                                    title="Principio"
                                    value="Arroz + ensalada"
                                />

                                <BuilderRow
                                    emoji="🍗"
                                    title="Proteína"
                                    value="Pollo a la plancha"
                                />

                                <BuilderRow
                                    emoji="🥤"
                                    title="Bebida"
                                    value="Jugo natural"
                                />

                                <BuilderRow
                                    emoji="🍮"
                                    title="Postre"
                                    value="Postre del día"
                                />

                            </div>


                            {/* PRECIO */}

                            <div
                                className="
                                    mt-4
                                    flex
                                    items-center
                                    justify-between
                                    gap-3
                                    rounded-2xl
                                    bg-orange-50
                                    px-4
                                    py-3
                                    sm:mt-5
                                    sm:px-5
                                    sm:py-4
                                "
                            >

                                <div className="min-w-0">

                                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500 sm:text-xs">
                                        Menú ejecutivo
                                    </p>

                                    <p className="mt-0.5 truncate text-xs font-medium text-gray-700 sm:text-sm">
                                        Menú completo
                                    </p>

                                </div>


                                <strong className="flex-shrink-0 text-xl font-extrabold text-orange-600 sm:text-2xl">
                                    $25.000
                                </strong>

                            </div>


                            {/* ESTADO */}

                            <div
                                className="
                                    mt-3
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-2xl
                                    bg-green-50
                                    px-3
                                    py-3
                                    text-center
                                    text-xs
                                    font-bold
                                    text-green-700
                                    sm:mt-4
                                    sm:px-4
                                    sm:text-sm
                                "
                            >

                                <CheckCircle2 className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />

                                <span>
                                    Tu cliente puede elegir sus componentes
                                </span>

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


function BuilderRow({
    emoji,
    title,
    value,
}: {
    emoji: string;
    title: string;
    value: string;
}) {
    return (

        <div
            className="
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-gray-100
                bg-gray-50
                px-3
                py-2.5
                sm:gap-4
                sm:rounded-2xl
                sm:px-4
                sm:py-3
            "
        >

            <div
                className="
                    flex
                    h-9
                    w-9
                    flex-shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-white
                    text-lg
                    shadow-sm
                    sm:h-11
                    sm:w-11
                    sm:rounded-xl
                    sm:text-xl
                "
            >
                {emoji}
            </div>


            <div className="min-w-0">

                <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400 sm:text-[10px]">
                    {title}
                </p>

                <p className="truncate text-xs font-bold text-gray-800 sm:text-sm">
                    {value}
                </p>

            </div>

        </div>

    );
}