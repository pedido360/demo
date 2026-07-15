"use client";

interface QuantitySelectorProps {
    quantity: number;
    onDecrease: () => void;
    onIncrease: () => void;
}

export default function QuantitySelector({
    quantity,
    onDecrease,
    onIncrease,
}: QuantitySelectorProps) {
    return (
        <div className="mt-8 rounded-2xl border border-gray-200 p-4">

            <div className="flex items-center justify-between">

                <span className="font-semibold">
                    Cantidad
                </span>

                <div className="flex items-center gap-4">

                    <button
                        type="button"
                        onClick={onDecrease}
                        disabled={quantity <= 1}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-xl font-bold transition hover:bg-gray-100 disabled:opacity-40"
                    >
                        −
                    </button>

                    <span className="min-w-[24px] text-center text-lg font-bold">
                        {quantity}
                    </span>

                    <button
                        type="button"
                        onClick={onIncrease}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-xl font-bold text-white transition hover:bg-red-700"
                    >
                        +
                    </button>

                </div>

            </div>

        </div>
    );
}