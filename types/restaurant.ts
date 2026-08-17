export type RestaurantStatus = "active" | "paused";

export interface Restaurant {
    id: string;
    slug: string;

    name: string;
    description: string;

    logo: string;
    banner: string;

    whatsapp: string;

    address: string;
    neighborhood?: string;
    city: string;
    department: string;

    isOpen: boolean;

    rating: number;

    categories: string[];

    // Estado administrativo de la cuenta
    status: RestaurantStatus;

    // Motivo de la suspensión (opcional)
    pauseReason: string | null;

    // Fecha de suspensión (opcional)
    pausedAt: string | null;
}