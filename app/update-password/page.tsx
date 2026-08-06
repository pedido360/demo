"use client";

import UpdatePasswordForm from "@/components/auth/UpdatePasswordForm";

export default function UpdatePasswordPage() {

    return (

        <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">

            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">

                <h1 className="mb-2 text-center text-3xl font-bold">
                    Nueva contraseña
                </h1>

                <p className="mb-8 text-center text-gray-500">
                    Escribe tu nueva contraseña para continuar.
                </p>

                <UpdatePasswordForm />

            </div>

        </main>

    );

}