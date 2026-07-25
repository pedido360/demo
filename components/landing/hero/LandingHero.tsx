import { CheckCircle2 } from "lucide-react";

import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";

import HeroBackground from "./HeroBackground";
import PhoneMockup from "./PhoneMockup";

export default function LandingHero() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-orange-50 via-white to-white">
            <HeroBackground />

            <Container className="relative py-20 lg:py-28">
                <div className="grid items-center gap-16 lg:grid-cols-2">
                    {/* Texto */}
                    <div>
                        <Badge>
                            🚀 Plataforma para restaurantes
                        </Badge>

                        <h1 className="mt-8 text-5xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-6xl xl:text-7xl">
                            Convierte más pedidos
                            <br />
                            <span className="text-orange-500">
                                en clientes felices.
                            </span>
                        </h1>

                        <p className="mt-8 max-w-xl text-lg leading-8 text-gray-600">
                            Pedidos360 permite a tu restaurante recibir pedidos online,
                            gestionar tu menú fácilmente y ofrecer una experiencia moderna
                            sin depender de WhatsApp.
                        </p>

                        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                            <Button href="/demo">
                                Probar Demo
                            </Button>

                            <Button
                                href="#contacto"
                                variant="secondary"
                            >
                                Solicitar demostración
                            </Button>
                        </div>

                        <p className="mt-5 text-sm text-gray-500">
                            Sin comisiones • Configuración rápida • Tu propia marca
                        </p>

                        <div className="mt-12 grid gap-5 text-gray-700">
                            <div className="flex items-center gap-3">
                                <CheckCircle2
                                    className="text-orange-500"
                                    size={22}
                                />
                                Sin comisiones por pedido
                            </div>

                            <div className="flex items-center gap-3">
                                <CheckCircle2
                                    className="text-orange-500"
                                    size={22}
                                />
                                Configuración en minutos
                            </div>

                            <div className="flex items-center gap-3">
                                <CheckCircle2
                                    className="text-orange-500"
                                    size={22}
                                />
                                Tu restaurante con su propia marca
                            </div>
                        </div>
                    </div>

                    {/* Teléfono */}
                    <PhoneMockup />
                </div>
            </Container>
        </section>
    );
}