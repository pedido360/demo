import { RestaurantHour } from "@/types/restaurant-hour";

export function isRestaurantOpen(
    hours: RestaurantHour[]
): boolean {

    const now = new Date();

    const day = now.getDay();


    const today = hours.find(hour => {

        console.log(
            "Comparando:",
            hour.dayOfWeek,
            typeof hour.dayOfWeek,
            "==",
            day,
            typeof day
        );

        return Number(hour.dayOfWeek) === day;

    });



    if (!today) {



        return false;

    }

    if (!today.isOpen) {



        return false;

    }

    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();

    const [openHour, openMinute] =
        today.openTime
            .split(":")
            .map(Number);

    const [closeHour, closeMinute] =
        today.closeTime
            .split(":")
            .map(Number);

    const openMinutes =
        openHour * 60 +
        openMinute;

    const closeMinutes =
        closeHour * 60 +
        closeMinute;



    const isOpen =
        currentMinutes >= openMinutes &&
        currentMinutes <= closeMinutes;



    return isOpen;

}