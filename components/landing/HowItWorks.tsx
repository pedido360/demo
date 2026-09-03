import {
    ArrowRight,
    CheckCircle2,
    MessageCircle,
    QrCode,
    Settings2,
    ShoppingBag,
} from "lucide-react";

const steps = [
    {
        number: "01",
        icon: Settings2,
        title: "Configura",
        description:
            "Crea tu menú, productos y opciones del Menú del Día.",
        detail: "Tu restaurante queda listo para vender.",
    },
    {
        number: "02",
        icon: QrCode,
        title: "Comparte",
        description:
            "Publica tu enlace o código QR en mesas, redes y WhatsApp.",
        detail: "Lleva a tus clientes directamente a tu menú.",
    },
    {
        number: "03",
        icon: ShoppingBag,
        title: "Tu cliente pide",
        description:
            "Elige productos, arma su Menú del Día y confirma su pedido.",
        detail: "Sin descargar ninguna aplicación.",
    },
    {
        number: "04",
        icon: MessageCircle,
        title: "Recibes por WhatsApp",
        description:
            "El pedido llega organizado directamente a tu WhatsApp.",
        detail: "Tú confirmas y continúas la atención.",
    },
];

export default function HowItWorks() {
    return (
        <section
            id="como-funciona"
            className="
                relative
                overflow-hidden
                bg-gray-50
                py-16
                sm:py-20
                lg:py-24
            "
        >

            {/* Separación visual superior */}

            <div className="absolute inset-x-0 top-0 h-px bg-gray-200" />

            <div className="pointer-events-none absolute -right-32 top-20 h-72 w-72 rounded-full bg-orange-100/70 blur-3xl" />

            <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-green-100/60 blur-3xl" />


            <div className="relative mx-auto max-w-7xl px-5 sm:px-6">


                {/* =====================================================
                    ENCABEZADO
                ===================================================== */}

                <div className="mx-auto max-w-3xl text-center">

                    <span
                        className="
                            inline-flex
                            items-center
                            rounded-full
                            border
                            border-orange-200
                            bg-orange-50
                            px-4
                            py-2
                            text-xs
                            font-bold
                            text-orange-600
                            sm:text-sm
                        "
                    >
                        Así funciona
                    </span>


                    <h2
                        className="
                            mt-5
                            text-3xl
                            font-extrabold
                            tracking-tight
                            text-gray-900
                            sm:text-4xl
                            md:text-5xl
                        "
                    >
                        Del menú al pedido.
                    </h2>


                    <p
                        className="
                            mx-auto
                            mt-4
                            max-w-2xl
                            text-base
                            leading-7
                            text-gray-600
                            sm:text-lg
                            sm:leading-8
                        "
                    >
                        Una experiencia sencilla para tu cliente y un flujo
                        claro para tu restaurante.
                    </p>

                </div>


                {/* =====================================================
                    RECORRIDO VISUAL
                ===================================================== */}

                <div className="mt-10 sm:mt-14">


                    {/* Línea de recorrido en desktop */}

                    <div className="relative hidden md:block">

                        <div className="absolute left-[12%] right-[12%] top-9 h-px bg-gray-200" />

                        <div className="relative grid grid-cols-4 gap-5">

                            {steps.map((step) => {

                                const Icon = step.icon;

                                return (

                                    <div
                                        key={step.number}
                                        className="flex flex-col items-center text-center"
                                    >

                                        <div
                                            className="
                                                relative
                                                z-10
                                                flex
                                                h-[72px]
                                                w-[72px]
                                                items-center
                                                justify-center
                                                rounded-3xl
                                                border
                                                border-gray-200
                                                bg-white
                                                text-orange-500
                                                shadow-lg
                                            "
                                        >

                                            <Icon className="h-7 w-7" />

                                        </div>


                                        <span className="mt-5 text-xs font-extrabold tracking-[0.16em] text-orange-500">
                                            PASO {step.number}
                                        </span>


                                        <h3 className="mt-2 text-xl font-extrabold text-gray-900">
                                            {step.title}
                                        </h3>


                                        <p className="mt-2 max-w-xs text-sm leading-6 text-gray-600">
                                            {step.description}
                                        </p>


                                        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm ring-1 ring-gray-100">

                                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />

                                            {step.detail}

                                        </div>

                                    </div>

                                );

                            })}

                        </div>

                    </div>


                    {/* =================================================
                        MOBILE
                    ================================================= */}

                    <div className="space-y-4 md:hidden">

                        {steps.map((step, index) => {

                            const Icon = step.icon;

                            return (

                                <div
                                    key={step.number}
                                    className="
                                        relative
                                        overflow-hidden
                                        rounded-3xl
                                        border
                                        border-gray-200
                                        bg-white
                                        p-5
                                        shadow-sm
                                    "
                                >

                                    <div className="flex gap-4">

                                        <div className="flex flex-col items-center">

                                            <div
                                                className="
                                                    flex
                                                    h-12
                                                    w-12
                                                    flex-shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-2xl
                                                    bg-orange-50
                                                    text-orange-600
                                                "
                                            >
                                                <Icon className="h-6 w-6" />
                                            </div>

                                            {index < steps.length - 1 && (
                                                <div className="mt-3 h-full w-px bg-gray-200" />
                                            )}

                                        </div>


                                        <div className="min-w-0 pb-1">

                                            <div className="flex items-center gap-2">

                                                <span className="text-[10px] font-extrabold tracking-[0.15em] text-orange-500">
                                                    PASO {step.number}
                                                </span>

                                            </div>


                                            <h3 className="mt-1 text-xl font-extrabold text-gray-900">
                                                {step.title}
                                            </h3>


                                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                                {step.description}
                                            </p>


                                            <div className="mt-3 flex items-start gap-1.5 text-xs font-semibold text-gray-700">

                                                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-600" />

                                                <span>
                                                    {step.detail}
                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            );

                        })}

                    </div>

                </div>


                {/* =====================================================
                    RESULTADO FINAL
                ===================================================== */}

                <div
                    className="
                        mx-auto
                        mt-10
                        max-w-3xl
                        rounded-3xl
                        border
                        border-gray-200
                        bg-white
                        p-5
                        text-center
                        shadow-sm
                        sm:mt-14
                        sm:p-7
                    "
                >

                    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">

                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-50 text-green-600">

                            <MessageCircle className="h-5 w-5" />

                        </div>


                        <div className="text-center sm:text-left">

                            <p className="text-sm font-extrabold text-gray-900 sm:text-base">
                                De tu menu digital al WhatsApp de tu negocio
                            </p>

                            <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm">
                                Sin aplicaciones para tus clientes y sin procesos complicados.
                            </p>

                        </div>


                        <ArrowRight className="hidden h-5 w-5 text-gray-300 sm:block" />

                    </div>

                </div>

            </div>

        </section>
    );
}