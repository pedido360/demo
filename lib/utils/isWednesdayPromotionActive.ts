export const WEDNESDAY_PROMOTION_PRODUCT_ID =
    "65dff65e-6b8d-495a-abbf-77343ec11169";

export function isWednesdayPromotionActive(): boolean {
    const now = new Date();

    const parts = new Intl.DateTimeFormat(
        "en-US",
        {
            timeZone: "America/Bogota",
            month: "numeric",
            weekday: "short",
            hour: "numeric",
            minute: "numeric",
            hour12: false,
        }
    ).formatToParts(now);

    const values: Record<string, string> = {};

    for (const part of parts) {
        if (part.type !== "literal") {
            values[part.type] = part.value;
        }
    }

    const month =
        Number(values.month);

    const hour =
        Number(values.hour);

    const minute =
        Number(values.minute);

    const isJanuary =
        month === 1;

    const isDecember =
        month === 12;

    if (isJanuary || isDecember) {
        return false;
    }

    const isWednesday =
        values.weekday === "Wed";

    if (!isWednesday) {
        return false;
    }

    const currentMinutes =
        hour * 60 + minute;

    const promotionStart =
        14 * 60;

    return currentMinutes >= promotionStart;
}