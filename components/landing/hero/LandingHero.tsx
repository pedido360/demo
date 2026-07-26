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
                    <div className="text-center lg:text-left">
                        <Badge>
                            📲 Ahora tus pedidos, directo a tu WhatsApp.
                        </Badge>

                        <h1 className="mt-8 text-5xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-6xl xl:text-7xl">
                            Automatiza tus pedidos.
                            <br />
                            <span className="text-orange-500">
                                Atiende más rápido.
                            </span>
                            <br />
                            Haz crecer tu restaurante.
                        </h1>

                        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-gray-600 lg:mx-0 lg:max-w-xl">
                            Tus clientes hacen sus pedidos desde un menú digital y tú los
                            recibes organizados por WhatsApp, listos para preparar.
                            Dedica menos tiempo a responder mensajes y más tiempo a lo que
                            realmente importa: atender a tus clientes y hacer crecer tu
                            restaurante.
                        </p>

                        <div className="mt-10 flex justify-center lg:block">
                            <Button href="/demo">
                                Probar Demo
                            </Button>
                        </div>

                        <p className="mt-5 text-sm text-gray-500">
                            Sin comisiones • Configuración rápida • Tu propia marca
                        </p>

                        <div className="mt-12 grid gap-5 text-gray-700">
                            <div className="flex items-center justify-center gap-3 lg:justify-start">
                                <CheckCircle2
                                    className="text-orange-500"
                                    size={22}
                                />
                                Pedidos organizados y listos para preparar
                            </div>

                            <div className="flex items-center justify-center gap-3 lg:justify-start">
                                <CheckCircle2
                                    className="text-orange-500"
                                    size={22}
                                />
                                Menos tiempo respondiendo mensajes
                            </div>

                            <div className="flex items-center justify-center gap-3 lg:justify-start">
                                <CheckCircle2
                                    className="text-orange-500"
                                    size={22}
                                />
                                Tu menú siempre actualizado
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