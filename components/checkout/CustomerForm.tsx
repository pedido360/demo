"use client";

interface CustomerFormProps {
    name: string;
    phone: string;
    address: string;
    notes: string;

    onNameChange: (value: string) => void;
    onPhoneChange: (value: string) => void;
    onAddressChange: (value: string) => void;
    onNotesChange: (value: string) => void;
}

export default function CustomerForm({
    name,
    phone,
    address,
    notes,
    onNameChange,
    onPhoneChange,
    onAddressChange,
    onNotesChange,
}: CustomerFormProps) {

    return (

        <div className="space-y-6">

            {/* Nombre */}

            <div>

                <label className="mb-2 flex items-center gap-1 font-semibold">
                    <span>👤 Nombre *</span>
                    <span className="text-lg font-bold text-red-600">*</span>
                </label>

                <input
                    type="text"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className={`w-full rounded-xl border p-3 outline-none transition-colors ${name.trim()
                        ? "border-gray-300 focus:border-red-600"
                        : "border-red-300 focus:border-red-600"
                        }`}
                />

                {!name.trim() && (
                    <p className="mt-2 ml-1 flex items-center gap-1 text-xs text-red-600">
                        <span>⚠️</span>
                        <span>El nombre es obligatorio.</span>
                    </p>
                )}

            </div>

            {/* Teléfono */}

            <div>

                <label className="mb-2 block font-semibold">
                    📞 Teléfono
                </label>

                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => onPhoneChange(e.target.value)}
                    placeholder="3001234567"
                    className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-red-600"
                />

                <p className="mt-2 ml-1 text-xs text-gray-500">
                    Opcional. Si lo deseas, el restaurante podrá contactarte.
                </p>

            </div>

            {/* Dirección */}

            <div>

                <label className="mb-2 flex items-center gap-1 font-semibold">
                    <span>📍 Dirección *</span>
                    <span className="text-lg font-bold text-red-600">*</span>
                </label>

                <input
                    type="text"
                    value={address}
                    onChange={(e) => onAddressChange(e.target.value)}
                    placeholder="Ej: Calle 10 #25-40, Apto 302, Barrio Centro"
                    className={`w-full rounded-xl border p-3 outline-none transition-colors ${address.trim()
                        ? "border-gray-300 focus:border-red-600"
                        : "border-red-300 focus:border-red-600"
                        }`}
                />

                {!address.trim() && (
                    <p className="mt-2 ml-1 flex items-center gap-1 text-xs text-red-600">
                        <span>⚠️</span>
                        <span>La dirección es obligatoria.</span>
                    </p>
                )}

                <p className="mt-2 ml-1 text-xs text-gray-500">
                    💡 Incluye apartamento, torre, barrio o una referencia si aplica.
                </p>

            </div>

            {/* Comentario */}

            <div>

                <label className="mb-2 block font-semibold">
                    📝 Comentario general
                </label>

                <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => onNotesChange(e.target.value)}
                    placeholder="Ej: Tocar el timbre al llegar..."
                    className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-red-600"
                />

            </div>

        </div>

    );

}