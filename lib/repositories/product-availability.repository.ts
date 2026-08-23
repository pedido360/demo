import { supabase } from "@/lib/supabase";


export const PRODUCT_DAYS = [
    {
        value: 0,
        label: "Domingo",
        shortLabel: "Dom",
    },
    {
        value: 1,
        label: "Lunes",
        shortLabel: "Lun",
    },
    {
        value: 2,
        label: "Martes",
        shortLabel: "Mar",
    },
    {
        value: 3,
        label: "Miércoles",
        shortLabel: "Mié",
    },
    {
        value: 4,
        label: "Jueves",
        shortLabel: "Jue",
    },
    {
        value: 5,
        label: "Viernes",
        shortLabel: "Vie",
    },
    {
        value: 6,
        label: "Sábado",
        shortLabel: "Sáb",
    },
] as const;


/**
 * Obtiene los días de disponibilidad
 * configurados para un producto.
 */
export async function getProductAvailableDays(
    productId: string
): Promise<number[]> {

    const { data, error } =
        await supabase
            .from("product_available_days")
            .select("day_of_week")
            .eq(
                "product_id",
                productId
            )
            .order(
                "day_of_week",
                {
                    ascending: true,
                }
            );


    if (error) {

        console.error(error);

        throw new Error(
            error.message
        );

    }


    return (
        data ?? []
    ).map(
        row =>
            Number(
                row.day_of_week
            )
    );

}


/**
 * Guarda los días de disponibilidad
 * de un producto.
 *
 * Reemplaza completamente
 * la configuración anterior.
 */
export async function replaceProductAvailableDays(
    productId: string,
    days: number[]
): Promise<number[]> {

    const uniqueDays =
        Array.from(
            new Set(
                days
                    .map(Number)
                    .filter(
                        day =>
                            Number.isInteger(day) &&
                            day >= 0 &&
                            day <= 6
                    )
            )
        ).sort(
            (a, b) =>
                a - b
        );


    const { error:
        deleteError
    } =
        await supabase
            .from(
                "product_available_days"
            )
            .delete()
            .eq(
                "product_id",
                productId
            );


    if (deleteError) {

        console.error(
            deleteError
        );

        throw new Error(
            deleteError.message
        );

    }


    if (
        uniqueDays.length === 0
    ) {

        return [];

    }


    const rows =
        uniqueDays.map(
            day => ({

                product_id:
                    productId,

                day_of_week:
                    day,

            })
        );


    const { error:
        insertError
    } =
        await supabase
            .from(
                "product_available_days"
            )
            .insert(
                rows
            );


    if (insertError) {

        console.error(
            insertError
        );

        throw new Error(
            insertError.message
        );

    }


    return uniqueDays;

}