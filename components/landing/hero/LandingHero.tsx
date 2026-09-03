import { ArrowRight, CheckCircle2 } from "lucide-react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/LinkButton";
import Container from "@/components/ui/Container";

import HeroBackground from "./HeroBackground";
import PhoneMockup from "./PhoneMockup";

export default function LandingHero() {
    return (

        <section
            id="inicio"
            className="relative overflow-hidden bg-gradient-to-b from-orange-50 via-white to-white"
        >
            <HeroBackground />

            <Container className="relative py-16 lg:py-24">

                <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">

                    {/* =====================================================
                        MENSAJE PRINCIPAL
                    ===================================================== */}

                    <div className="order-2 text-center lg:order-1 lg:text-left">

                        <Badge>
                            📲 Pedidos directamente a tu WhatsApp
                        </Badge>


                        <h1 className="mt-7 text-5xl font-extrabold leading-[1.05] tracking-tight text-gray-900 md:text-6xl xl:text-7xl">

                            Convierte tu menú

                            <br />

                            <span className="text-orange-500">
                                en pedidos.
                            </span>

                        </h1>


                        <p className="mx-auto mt-7 max-w-xl text-lg leading-8 text-gray-600 lg:mx-0">

                            Tu cliente elige desde su celular.
                            Tú recibes el pedido organizado
                            directamente en WhatsApp.

                        </p>


                        <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">

                            <Button href="/demo">

                                Quiero ver Pedidos360

                                <ArrowRight className="ml-2 inline h-5 w-5" />

                            </Button>

                        </div>


                        {/* BENEFICIOS RÁPIDOS */}

                        <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-medium text-gray-500 lg:justify-start">

                            <span>
                                🍽️ Menú digital
                            </span>

                            <span>
                                📲 Pedidos organizados
                            </span>

                            <span>
                                💬 WhatsApp
                            </span>

                        </div>


                        {/* CONFIANZA */}

                        <div className="mt-9 grid gap-3 text-sm text-gray-600">

                            <div className="flex items-center justify-center gap-2 lg:justify-start">

                                <CheckCircle2
                                    className="h-5 w-5 text-orange-500"
                                />

                                Sin comisiones por pedido

                            </div>


                            <div className="flex items-center justify-center gap-2 lg:justify-start">

                                <CheckCircle2
                                    className="h-5 w-5 text-orange-500"
                                />

                                Sin app para tus clientes

                            </div>


                            <div className="flex items-center justify-center gap-2 lg:justify-start">

                                <CheckCircle2
                                    className="h-5 w-5 text-orange-500"
                                />

                                Tu propia marca

                            </div>

                        </div>

                    </div>


                    {/* =====================================================
                        DEMOSTRACIÓN DEL PRODUCTO
                    ===================================================== */}

                    <div className="order-1 lg:order-2">

                        <PhoneMockup />

                    </div>

                </div>

            </Container>

        </section>
    );
}