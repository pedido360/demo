import Link from "next/link";
import {
    ArrowRight,
    CheckCircle2,
    MapPin,
    Users,
    Store,
    TrendingUp,
} from "lucide-react";

const benefits = [
    "Representa Pedidos360 en tu ciudad o zona.",
    "Ayuda a los restaurantes a digitalizar sus pedidos.",
    "Construye una red comercial local.",
    "Obtén beneficios por el crecimiento de tu territorio.",
];

export default function RepresentacionPage() {
    return (
        <main className="min-h-screen bg-gray-50">

            {/* =====================================================
                HERO
            ===================================================== */}

            <section className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 px-5 py-16 text-white sm:py-20">

                <div className="mx-auto max-w-5xl text-center">

                    <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold backdrop-blur">
                        🚀 Oportunidad Pedidos360
                    </span>


                    <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">

                        Representa Pedidos360
                        <br />

                        <span className="text-orange-100">
                            en tu ciudad.
                        </span>

                    </h1>


                    <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-orange-50 sm:text-lg sm:leading-8">

                        Queremos llevar Pedidos360 a más restaurantes
                        de Colombia y estamos creando una red de
                        representantes locales.

                    </p>

                </div>

            </section>


            {/* =====================================================
                PROPUESTA
            ===================================================== */}

            <section className="px-5 py-14 sm:py-20">

                <div className="mx-auto max-w-5xl">

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

                        <BenefitCard
                            icon={<MapPin />}
                            title="Tu territorio"
                            text="Desarrolla una zona comercial asignada."
                        />

                        <BenefitCard
                            icon={<Store />}
                            title="Restaurantes"
                            text="Ayuda a negocios locales a vender mejor."
                        />

                        <BenefitCard
                            icon={<Users />}
                            title="Tu red"
                            text="Construye relaciones comerciales en tu ciudad."
                        />

                        <BenefitCard
                            icon={<TrendingUp />}
                            title="Crecimiento"
                            text="Participa en el crecimiento de Pedidos360."
                        />

                    </div>


                    {/* =================================================
                        MENSAJE
                    ================================================= */}

                    <div className="mt-10 rounded-[32px] bg-gray-950 p-7 text-white shadow-xl sm:p-10">

                        <h2 className="text-2xl font-extrabold sm:text-3xl">
                            ¿Cómo funciona?
                        </h2>


                        <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-300 sm:text-base">

                            Tú desarrollas comercialmente tu ciudad.
                            Nosotros ponemos la tecnología, la plataforma
                            y las herramientas necesarias para que puedas
                            presentar Pedidos360 a los restaurantes.

                        </p>


                        <div className="mt-7 grid gap-3">

                            {benefits.map((item) => (

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

                    </div>


                    {/* =================================================
                        CTA
                    ================================================= */}

                    <div className="mt-10 rounded-[32px] bg-white p-7 text-center shadow-xl ring-1 ring-gray-100 sm:p-10">

                        <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">

                            ¿Quieres representar
                            <br className="sm:hidden" />
                            {" "}Pedidos360?

                        </h2>


                        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-600 sm:text-base">

                            Cuéntanos qué ciudad quieres desarrollar
                            y conversemos sobre la oportunidad.

                        </p>


                        <Link
                            href="/demo"
                            className="
                                mt-7
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
                                font-bold
                                text-white
                                shadow-lg
                                transition
                                hover:bg-orange-600
                                sm:w-auto
                            "
                        >

                            Quiero ser representante

                            <ArrowRight className="h-5 w-5" />

                        </Link>

                    </div>

                </div>

            </section>

        </main>
    );
}


function BenefitCard({
    icon,
    title,
    text,
}: {
    icon: React.ReactNode;
    title: string;
    text: string;
}) {
    return (

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                {icon}
            </div>


            <h3 className="mt-5 text-lg font-bold text-gray-900">
                {title}
            </h3>


            <p className="mt-2 text-sm leading-6 text-gray-600">
                {text}
            </p>

        </div>

    );
}