"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginForm() {
    const router = useRouter();
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        setLoading(true);
        setErrorMessage("");

        const { error } =
            await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

        setLoading(false);

        if (error) {
            setErrorMessage(error.message);
            return;
        }

        // Obtener el usuario autenticado
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setErrorMessage("No fue posible obtener el usuario.");
            return;
        }

        // Buscar el perfil
        const { data: profile, error: profileError } =
            await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

        if (profileError || !profile) {
            setErrorMessage("No fue posible obtener el perfil.");
            return;
        }

        // Redireccionar según el rol
        if (profile.role === "super_admin") {

            router.push("/dashboard");

        } else if (profile.role === "restaurant_admin") {

            router.push("/restaurant");

        } else {

            setErrorMessage("Rol no reconocido.");
            return;

        }

        router.refresh();
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-5"
        >
            <div>
                <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium"
                >
                    Correo electrónico
                </label>

                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                    placeholder="correo@empresa.com"
                    required
                />
            </div>

            <div>
                <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium"
                >
                    Contraseña
                </label>

                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                    placeholder="********"
                    required
                />

                <div className="mt-2 text-right">

                    <Link
                        href="/reset-password"
                        className="text-sm text-blue-600 hover:underline"
                    >
                        ¿Olvidaste tu contraseña?
                    </Link>

                </div>
            </div>

            {errorMessage && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {errorMessage}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {loading
                    ? "Iniciando sesión..."
                    : "Iniciar sesión"}
            </button>
        </form>
    );
}