"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordForm() {

    const router = useRouter();

    const supabase = createClient();

    const [password, setPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [errorMessage, setErrorMessage] =
        useState("");

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {

        event.preventDefault();

        setErrorMessage("");

        if (password !== confirmPassword) {

            setErrorMessage(
                "Las contraseñas no coinciden."
            );

            return;

        }

        setLoading(true);

        const { error } =
            await supabase.auth.updateUser({
                password,
            });

        setLoading(false);

        if (error) {

            setErrorMessage(error.message);

            return;

        }

        alert(
            "Contraseña actualizada correctamente."
        );

        router.push("/login");

    }

    return (

        <form
            onSubmit={handleSubmit}
            className="space-y-5"
        >

            <div>

                <label className="mb-2 block text-sm font-medium">
                    Nueva contraseña
                </label>

                <input
                    type="password"
                    required
                    value={password}
                    onChange={(event) =>
                        setPassword(event.target.value)
                    }
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                />

            </div>

            <div>

                <label className="mb-2 block text-sm font-medium">
                    Confirmar contraseña
                </label>

                <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(event) =>
                        setConfirmPassword(event.target.value)
                    }
                    className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
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
                    ? "Guardando..."
                    : "Actualizar contraseña"}
            </button>

        </form>

    );

}