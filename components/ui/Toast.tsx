"use client";

interface ToastProps {
    open: boolean;
    title: string;
    message: string;
    onClose: () => void;
}

export default function Toast({
    open,
    title,
    message,
    onClose,
}: ToastProps) {

    if (!open) {
        return null;
    }

    return (

        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4">

            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">

                <h2 className="text-xl font-bold">
                    {title}
                </h2>

                <p className="mt-3 text-gray-600">
                    {message}
                </p>

                <button
                    onClick={onClose}
                    className="mt-6 w-full rounded-2xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700"
                >
                    Entendido
                </button>

            </div>

        </div>

    );

}