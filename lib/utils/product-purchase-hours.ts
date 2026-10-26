import { Product } from "@/types/product";

export function isProductPurchaseAllowed(
    product: Product,
    date: Date = new Date()
): boolean {
    if (!product.restrictPurchaseHours) {
        return true;
    }

    const weekday = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Bogota",
        weekday: "short",
    }).format(date);

    const dayMap: Record<string, number> = {
        Sun: 0,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6,
    };

    const today = dayMap[weekday];
    const availableDays = product.availableDays ?? [];
    const availableHours = product.availableHours ?? [];

    if (availableDays.length > 0 && !availableDays.includes(today)) {
        return false;
    }

    const hours = availableHours.find(hour => hour.dayOfWeek === today);

    if (!hours) {
        return availableDays.length === 0 && availableHours.length === 0;
    }

    const now = new Intl.DateTimeFormat("en-GB", {
        timeZone: "America/Bogota",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(date);

    const currentTime = now === "24:00" ? "00:00" : now;

    return currentTime >= hours.startTime.slice(0, 5)
        && currentTime < hours.endTime.slice(0, 5);
}
