import {
    ArrowRight,
    Check,
    ChevronDown,
    MessageCircle,
    Sparkles,
    Users,
    Wallet,
    Zap,
} from "lucide-react";
const steps = [
    {
        number: "01",
        title: "Piensa en un restaurante",
        text: "Puede ser un negocio que conoces, frecuentas o que ya hace parte de tu comunidad.",
    },
    {
        number: "02",
        title: "Haz la conexión",
        text: "Nos compartes el contacto o haces una presentación. No tienes que vender nada.",
    },
    {
        number: "03",
        title: "Nosotros hacemos el resto",
        text: "Presentamos Pedidos360, resolvemos las dudas y acompañamos al restaurante.",
    },
    {
        number: "04",
        title: "Tú ganas",
        text: "Si el restaurante contrata gracias a tu recomendación, recibes tu comisión.",
    },
];

const faqs = [
    {
        q: "¿Tengo que vender Pedidos360?",
        a: "No. Tu papel es conectar restaurantes con nosotros. Nuestro equipo se encarga de explicar la plataforma, resolver dudas, cerrar y acompañar la implementación.",
    },
    {
        q: "¿Necesito tener miles de seguidores?",
        a: "No necesariamente. Nos interesa más la confianza que tienes con tu comunidad y tus conexiones reales con restaurantes y negocios locales.",
    },
    {
        q: "¿Puedo recomendar restaurantes que ya conozco?",
        a: "Sí. De hecho, esa es la idea: empezar por restaurantes de tu entorno, contactos y negocios con los que ya existe una relación.",
    },
    {
        q: "¿Cuándo recibo mi comisión?",
        a: "La comisión se genera cuando el restaurante referido contrata Pedidos360. Los detalles y condiciones del esquema se explican al momento de vincularte como creador aliado.",
    },
];

export default function CreadoresPage() {
    return (
        <main className="min-h-screen overflow-hidden bg-[#07130f] text-white selection:bg-emerald-400 selection:text-[#07130f]">
            {/* Ambient background */}
            <div className="pointer-events-none fixed inset-0 -z-0">
                <div className="absolute left-1/2 top-[-18rem] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-[120px]" />
                <div className="absolute right-[-12rem] top-[28rem] h-[30rem] w-[30rem] rounded-full bg-lime-300/10 blur-[120px]" />
            </div>

            {/* Minimal private-page header */}
            <header className="relative z-20 border-b border-white/10 bg-[#07130f]/75 backdrop-blur-xl">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 lg:px-8">
                    <div className="flex items-center gap-2">
                        <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-400 text-[#07130f]">
                            <Zap className="h-5 w-5 fill-current" />
                        </div>
                        <span className="text-lg font-black tracking-tight">Pedidos360</span>
                    </div>
                    <span className="hidden rounded-full border border-emerald-300/20 bg-emerald-300/5 px-4 py-2 text-xs font-semibold text-emerald-200 sm:block">
                        Invitación para creadores
                    </span>
                </div>
            </header>

            {/* HERO */}
            <section className="relative z-10">
                <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-28 lg:pt-24">
                    <div>
                        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/5 px-4 py-2 text-sm font-semibold text-emerald-200">
                            <Sparkles className="h-4 w-4" />
                            Estamos seleccionando nuestros primeros aliados
                        </div>

                        <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                            Tu comunidad
                            <span className="block text-emerald-300">puede pagarte.</span>
                        </h1>

                        <p className="mt-7 max-w-xl text-lg leading-8 text-white/65 sm:text-xl">
                            Conecta restaurantes que ya conoces con Pedidos360 y crea una
                            nueva fuente de ingresos por cada negocio que llegue gracias a ti.
                        </p>

                        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                            <a
                                href="#quiero-entrar"
                                className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-emerald-300 px-6 py-4 font-black text-[#07130f] shadow-[0_15px_60px_rgba(110,231,183,.18)] transition hover:-translate-y-0.5 hover:bg-emerald-200"
                            >
                                Quiero conocer la oportunidad
                                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </a>
                            <a
                                href="#como-funciona"
                                className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] px-6 py-4 font-bold text-white transition hover:bg-white/[0.08]"
                            >
                                Ver cómo funciona
                            </a>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/45">
                            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-300" />Sin vender la plataforma</span>
                            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-300" />Sin implementación técnica</span>
                            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-300" />Comisión por restaurante</span>
                        </div>
                    </div>

                    {/* Hero opportunity card */}
                    <div className="relative">
                        <div className="absolute -inset-6 rounded-[3rem] bg-emerald-300/10 blur-3xl" />
                        <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl backdrop-blur-xl sm:p-7">
                            <div className="rounded-[1.5rem] border border-white/10 bg-[#0c1d17] p-6 sm:p-8">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-white/45">Tu oportunidad</p>
                                        <p className="mt-1 text-2xl font-black">Conexiones → ingresos</p>
                                    </div>
                                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-300/10 text-emerald-300">
                                        <Wallet className="h-6 w-6" />
                                    </div>
                                </div>

                                <div className="mt-8 space-y-3">
                                    {[
                                        ["1 restaurante", "1 comisión"],
                                        ["5 restaurantes", "5 comisiones"],
                                        ["10 restaurantes", "10 comisiones"],
                                    ].map(([left, right], index) => (
                                        <div
                                            key={left}
                                            className={`flex items-center justify-between rounded-2xl border p-4 ${index === 2
                                                ? "border-emerald-300/25 bg-emerald-300/[0.08]"
                                                : "border-white/8 bg-white/[0.03]"
                                                }`}
                                        >
                                            <span className="font-bold">{left}</span>
                                            <span className="font-black text-emerald-300">{right}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 rounded-2xl bg-white/[0.04] p-5">
                                    <p className="text-sm leading-6 text-white/55">
                                        La comisión exacta y las condiciones del programa se
                                        presentan antes de comenzar. Queremos construir un modelo
                                        que sea atractivo para ti y sostenible para Pedidos360.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* POSITIONING */}
            <section className="relative z-10 border-y border-white/8 bg-white/[0.025]">
                <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
                    <div className="max-w-2xl">
                        <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-300">La idea es simple</p>
                        <h2 className="mt-4 text-4xl font-black tracking-[-0.03em] sm:text-5xl">
                            Tú no necesitas convertirte en vendedor.
                        </h2>
                        <p className="mt-5 text-lg leading-8 text-white/55">
                            Ya tienes algo difícil de construir: atención, confianza y
                            conexiones. Nosotros ponemos la tecnología y el equipo comercial.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-4 md:grid-cols-3">
                        {[
                            {
                                icon: Users,
                                title: "Tú",
                                text: "Encuentras negocios que podrían beneficiarse de Pedidos360.",
                            },
                            {
                                icon: MessageCircle,
                                title: "Nosotros",
                                text: "Presentamos la solución, resolvemos dudas y acompañamos al restaurante.",
                            },
                            {
                                icon: Wallet,
                                title: "Ambos ganamos",
                                text: "El restaurante obtiene una herramienta útil y tú recibes una comisión por tu recomendación.",
                            },
                        ].map(({ icon: Icon, title, text }) => (
                            <div key={title} className="rounded-3xl border border-white/8 bg-[#0b1b15] p-7">
                                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-300/10 text-emerald-300">
                                    <Icon className="h-6 w-6" />
                                </div>
                                <h3 className="mt-6 text-2xl font-black">{title}</h3>
                                <p className="mt-3 leading-7 text-white/50">{text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* WHY CREATOR */}
            <section className="relative z-10">
                <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
                    <div>
                        <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-300">Piensa en tu círculo</p>
                        <h2 className="mt-4 text-4xl font-black tracking-[-0.03em] sm:text-5xl">
                            Probablemente ya conoces a tus primeros clientes.
                        </h2>
                        <p className="mt-5 text-lg leading-8 text-white/55">
                            No necesitas salir a tocar puertas. Empieza por los restaurantes
                            que ya hacen parte de tu mundo.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        {[
                            "El restaurante de un amigo",
                            "La cafetería que frecuentas",
                            "Un negocio que aparece en tus contenidos",
                            "Un restaurante que ya te conoce",
                            "El negocio de tu barrio",
                            "Un contacto que siempre te pide recomendaciones",
                        ].map((item) => (
                            <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-5">
                                <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-300" />
                                <span className="font-semibold text-white/75">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="como-funciona" className="relative z-10 bg-[#f4f7f4] text-[#07130f]">
                <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-28">
                    <div className="max-w-2xl">
                        <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">Cómo funciona</p>
                        <h2 className="mt-4 text-4xl font-black tracking-[-0.03em] sm:text-5xl">
                            Cuatro pasos. Cero complicaciones.
                        </h2>
                    </div>

                    <div className="mt-14 grid gap-4 md:grid-cols-2">
                        {steps.map((step) => (
                            <div key={step.number} className="rounded-3xl border border-black/8 bg-white p-7 shadow-sm">
                                <span className="text-sm font-black text-emerald-700">{step.number}</span>
                                <h3 className="mt-5 text-2xl font-black">{step.title}</h3>
                                <p className="mt-3 max-w-md leading-7 text-black/55">{step.text}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 rounded-3xl bg-[#07130f] p-7 text-white sm:p-9">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xl font-black">Tu única misión: abrir la puerta.</p>
                                <p className="mt-2 text-white/50">Nosotros nos encargamos de entrar y hacer el resto.</p>
                            </div>
                            <ArrowRight className="hidden h-7 w-7 text-emerald-300 sm:block" />
                        </div>
                    </div>
                </div>
            </section>

            {/* PEDIDOS360 VALUE */}
            <section className="relative z-10">
                <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-28">
                    <div className="grid items-center gap-12 lg:grid-cols-[.8fr_1.2fr]">
                        <div>
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/5 px-4 py-2 text-sm font-bold text-emerald-200">
                                <Sparkles className="h-4 w-4" />
                                ¿Qué estás recomendando?
                            </div>
                            <h2 className="text-4xl font-black tracking-[-0.03em] sm:text-5xl">
                                Una herramienta que el restaurante realmente puede usar.
                            </h2>
                            <p className="mt-5 text-lg leading-8 text-white/55">
                                Pedidos360 ayuda a restaurantes a mostrar su menú digital,
                                organizar su catálogo y recibir pedidos directamente por WhatsApp.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            {[
                                "Menú digital profesional",
                                "Pedidos por WhatsApp",
                                "Catálogo organizado",
                                "Presencia digital propia",
                                "Menú del Día",
                                "Experiencia sencilla para el cliente",
                            ].map((item) => (
                                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-5">
                                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-300 text-[#07130f]">
                                        <Check className="h-4 w-4 stroke-[3]" />
                                    </div>
                                    <span className="font-bold text-white/80">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* EXCLUSIVITY */}
            <section className="relative z-10 px-5 lg:px-8">
                <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-emerald-300/15 bg-gradient-to-br from-emerald-300/[0.12] to-white/[0.03] p-8 sm:p-12 lg:p-16">
                    <div className="max-w-3xl">
                        <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-300">Primera etapa</p>
                        <h2 className="mt-4 text-4xl font-black tracking-[-0.03em] sm:text-5xl lg:text-6xl">
                            No estamos buscando cientos de creadores.
                        </h2>
                        <p className="mt-6 text-lg leading-8 text-white/60">
                            Queremos comenzar con un grupo pequeño de creadores locales en
                            Bucaramanga, trabajar de cerca, medir resultados y construir una
                            alianza que pueda crecer contigo.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            {["Grupo reducido", "Alianza comercial", "Bucaramanga", "Potencial de crecimiento"].map((item) => (
                                <span key={item} className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-bold text-white/70">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section id="quiero-entrar" className="relative z-10">
                <div className="mx-auto max-w-5xl px-5 py-24 text-center lg:px-8 lg:py-32">
                    <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-300">Tu siguiente paso</p>
                    <h2 className="mx-auto mt-5 max-w-4xl text-5xl font-black leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                        ¿Cuántos restaurantes podrías conectar?
                    </h2>
                    <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-white/55">
                        Si tienes una comunidad, contactos o simplemente buenas relaciones
                        con negocios locales, queremos hablar contigo.
                    </p>

                    <a
                        href="https://wa.me/573184377576?text=Hola%20%F0%9F%91%8B%20Vi%20la%20invitaci%C3%B3n%20de%20Pedidos360%20para%20Creadores%20Aliados%20y%20me%20interesa%20conocer%20la%20propuesta%2C%20el%20modelo%20de%20comisi%C3%B3n%20y%20c%C3%B3mo%20puedo%20participar.%20%F0%9F%9A%80"
                        className="group mt-9 inline-flex items-center justify-center gap-3 rounded-2xl bg-emerald-300 px-7 py-4 text-base font-black text-[#07130f] shadow-[0_15px_60px_rgba(110,231,183,.18)] transition hover:-translate-y-0.5 hover:bg-emerald-200"
                    >
                        Quiero ser creador aliado
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </a>

                    <p className="mt-5 text-xs text-white/35">
                        Al hacer clic, te explicaremos el modelo de comisión, condiciones y próximos pasos.
                    </p>
                </div>
            </section>

            {/* FAQ */}
            <section className="relative z-10 border-t border-white/8 bg-black/10">
                <div className="mx-auto max-w-3xl px-5 py-20 lg:px-8">
                    <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Antes de empezar...</h2>
                    <div className="mt-8 divide-y divide-white/10 rounded-3xl border border-white/8 bg-white/[0.025] px-6">
                        {faqs.map((faq) => (
                            <details key={faq.q} className="group py-6">
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-bold">
                                    {faq.q}
                                    <ChevronDown className="h-5 w-5 shrink-0 text-white/40 transition group-open:rotate-180" />
                                </summary>
                                <p className="mt-4 max-w-2xl pr-8 leading-7 text-white/50">{faq.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="relative z-10 border-t border-white/8 px-5 py-8 text-center text-xs text-white/30">
                Pedidos360 · Programa de Creadores Aliados
            </footer>
        </main>
    );
}