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

            <div>

                <label className="mb-2 block font-semibold">
                    👤 Nombre
                </label>

                <input
                    type="text"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-red-600"
                />

            </div>

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

            </div>

            <div>

                <label className="mb-2 block font-semibold">
                    📍 Dirección
                </label>

                <input
                    type="text"
                    value={address}
                    onChange={(e) => onAddressChange(e.target.value)}
                    placeholder="Calle 10 #25-40"
                    className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-red-600"
                />

            </div>

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