"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function WaiterLoginForm() {
    const router = useRouter();
    const supabase = createClient();

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");

        const normalizedIdentifier = identifier.trim().toLowerCase();

        const loginResponse = await fetch("/api/waiters/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                identifier: normalizedIdentifier,
                password,
            }),
        });

        const loginResult = await loginResponse.json().catch(() => null);

        if (!loginResponse.ok || !loginResult?.success) {
            setErrorMessage(
                loginResult?.message || "Usuario/correo o contraseña incorrectos."
            );
            setLoading(false);
            return;
        }

        const validationResponse = await fetch("/api/waiters/session", {
            method: "GET",
            cache: "no-store",
        });

        const validation = await validationResponse.json().catch(() => null);

        if (!validationResponse.ok || !validation?.success) {
            await supabase.auth.signOut();
            setErrorMessage(
                validation?.message || "Tu cuenta no está autorizada para ingresar."
            );
            setLoading(false);
            return;
        }

        router.replace("/mesero");
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label htmlFor="waiter-identifier" className="mb-2 block text-sm font-medium">
                    Correo electrónico o nombre de usuario
                </label>
                <input
                    id="waiter-identifier"
                    type="text"
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                    placeholder="Tu correo o usuario"
                    required
                    disabled={loading}
                />
            </div>

            <div>
                <label htmlFor="waiter-password" className="mb-2 block text-sm font-medium">
                    Contraseña
                </label>
                <input
                    id="waiter-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                    placeholder="Tu contraseña"
                    required
                    disabled={loading}
                />
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
                {loading ? "Ingresando..." : "Ingresar"}
            </button>
        </form>
    );
}
