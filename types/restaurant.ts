export interface Restaurant {
    id: string;
    slug: string;

    name: string;
    description: string;

    logo: string;
    banner: string;

    whatsapp: string;

    address: string;

    city: string;

    isOpen: boolean;

    rating: number;

    categories: string[];
}