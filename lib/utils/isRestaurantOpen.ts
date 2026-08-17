import { RestaurantHour } from "@/types/restaurant-hour";

const COLOMBIA_TIME_ZONE = "America/Bogota";

function getColombiaDateParts() {
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: COLOMBIA_TIME_ZONE,
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    });

    const parts = formatter.formatToParts(new Date());

    const weekday = parts.find(
        part => part.type === "weekday"
    )?.value;

    const hour = Number(
        parts.find(part => part.type === "hour")?.value ?? 0
    );

    const minute = Number(
        parts.find(part => part.type === "minute")?.value ?? 0
    );

    const weekdayMap: Record<string, number> = {
        Sun: 0,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6,
    };

    return {
        dayOfWeek: weekdayMap[weekday ?? "Sun"],
        currentMinutes: hour * 60 + minute,
    };
}

function timeToMinutes(time: string): number {
    const [hour, minute] = time.split(":").map(Number);

    return hour * 60 + minute;
}

export function isRestaurantOpen(
    hours: RestaurantHour[]
): boolean {

    if (!hours.length) {
        return false;
    }

    const {
        dayOfWeek,
        currentMinutes,
    } = getColombiaDateParts();

    const previousDay =
        dayOfWeek === 0
            ? 6
            : dayOfWeek - 1;

    const today = hours.find(
        hour =>
            Number(hour.dayOfWeek) === dayOfWeek
    );

    const yesterday = hours.find(
        hour =>
            Number(hour.dayOfWeek) === previousDay
    );

    /*
     * ============================================================
     * 1. HORARIO DEL DÍA ACTUAL
     * ============================================================
     */

    if (today?.isOpen) {

        const openMinutes =
            timeToMinutes(today.openTime);

        const closeMinutes =
            timeToMinutes(today.closeTime);

        /*
         * Horario normal:
         *
         * 08:00 → 18:00
         */

        if (openMinutes < closeMinutes) {

            if (
                currentMinutes >= openMinutes &&
                currentMinutes <= closeMinutes
            ) {
                return true;
            }
        }

        /*
         * Horario que cruza medianoche:
         *
         * 18:00 → 02:00
         *
         * Durante el mismo día estamos abiertos
         * desde las 18:00 hasta las 23:59.
         */

        if (openMinutes > closeMinutes) {

            if (currentMinutes >= openMinutes) {
                return true;
            }
        }
    }

    /*
     * ============================================================
     * 2. HORARIO DEL DÍA ANTERIOR
     * ============================================================
     *
     * Ejemplo:
     *
     * Domingo:
     * 18:00 → 02:00
     *
     * Lunes 01:00:
     * todavía debemos considerar abierto.
     */

    if (yesterday?.isOpen) {

        const openMinutes =
            timeToMinutes(yesterday.openTime);

        const closeMinutes =
            timeToMinutes(yesterday.closeTime);

        /*
         * Solo nos interesa el horario anterior
         * cuando cruza medianoche.
         */

        if (openMinutes > closeMinutes) {

            if (currentMinutes <= closeMinutes) {
                return true;
            }
        }
    }

    return false;
}