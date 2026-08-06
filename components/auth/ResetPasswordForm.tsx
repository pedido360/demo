"use client";

import { useState } from "react";

import Link from "next/link";

import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordForm() {

    const supabase = createClient();

    const [email, setEmail] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [success, setSuccess] =
        useState(false);

    const [errorMessage, setErrorMessage] =
        useState("");

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {

        event.preventDefault();

        setLoading(true);

        setErrorMessage("");

        const { error } =
            await supabase.auth.resetPasswordForEmail(
                email.trim(),
                {
                    redirectTo:
                        `${window.location.origin}/update-password`,
                }
            );

        setLoading(false);

        if (error) {

            setErrorMessage(error.message);

            return;

        }

        setSuccess(true);

    }

    if (success) {

        return (

            <div className="space-y-6">

                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">

                    Hemos enviado un enlace de recuperación a tu correo electrónico.

                </div>

                <Link
                    href="/login"
                    className="block text-center text-blue-600 hover:underline"
                >
                    Volver al inicio de sesión
                </Link>

            </div>

        );

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
                    required
                    value={email}
                    onChange={(event) =>
                        setEmail(event.target.value)
                    }
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                    placeholder="correo@empresa.com"
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
                className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
                {loading
                    ? "Enviando..."
                    : "Enviar enlace"}
            </button>

        </form>

    );

}