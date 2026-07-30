"use client";

import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
                <h1 className="mb-2 text-center text-3xl font-bold">
                    Pedidos360
                </h1>

                <p className="mb-8 text-center text-gray-500">
                    Inicia sesión para continuar
                </p>

                <LoginForm />
            </div>
        </main>
    );
}