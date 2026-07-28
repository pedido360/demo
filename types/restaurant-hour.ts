export interface RestaurantHour {
    id?: string;

    restaurantId?: string;

    dayOfWeek: number;

    isOpen: boolean;

    openTime: string;

    closeTime: string;
}