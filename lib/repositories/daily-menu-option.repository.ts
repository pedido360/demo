import { supabase } from "@/lib/supabase";

import {
    DailyMenuOption,
    DailyMenuSection,
} from "@/types/daily-menu";


function mapDailyMenuOption(
    data: any
): DailyMenuOption {

    return {

        id:
            data.id,

        restaurantId:
            data.restaurant_id,

        section:
            data.section as DailyMenuSection,

        name:
            data.name,

        isActive:
            data.is_active,

        sortOrder:
            data.sort_order,

        createdAt:
            data.created_at,

    };

}


/**
 * Obtiene todas las opciones
 * de un restaurante.
 */
export async function getDailyMenuOptions(
    restaurantId: string
): Promise<DailyMenuOption[]> {

    const { data, error } =
        await supabase
            .from("daily_menu_options")
            .select("*")
            .eq(
                "restaurant_id",
                restaurantId
            )
            .order("section", {
                ascending: true,
            })
            .order("sort_order", {
                ascending: true,
            });


    if (error) {

        console.error(error);

        throw new Error(
            error.message
        );

    }


    return (
        data ?? []
    ).map(
        mapDailyMenuOption
    );

}


/**
 * Obtiene las opciones de una sección.
 */
export async function getDailyMenuOptionsBySection(
    restaurantId: string,
    section: DailyMenuSection
): Promise<DailyMenuOption[]> {

    const options =
        await getDailyMenuOptions(
            restaurantId
        );


    return options.filter(
        option =>
            option.section ===
            section
    );

}


/**
 * Crea una opción.
 */
export async function createDailyMenuOption(
    option: DailyMenuOption
): Promise<DailyMenuOption> {

    const { data, error } =
        await supabase
            .from("daily_menu_options")
            .insert({

                restaurant_id:
                    option.restaurantId,

                section:
                    option.section,

                name:
                    option.name.trim(),

                is_active:
                    option.isActive,

                sort_order:
                    option.sortOrder,

            })
            .select()
            .single();


    if (error) {

        console.error(error);

        throw new Error(
            error.message
        );

    }


    return mapDailyMenuOption(
        data
    );

}


/**
 * Actualiza una opción.
 */
export async function updateDailyMenuOption(
    option: DailyMenuOption
): Promise<DailyMenuOption> {

    const { data, error } =
        await supabase
            .from("daily_menu_options")
            .update({

                section:
                    option.section,

                name:
                    option.name.trim(),

                is_active:
                    option.isActive,

                sort_order:
                    option.sortOrder,

            })
            .eq(
                "id",
                option.id
            )
            .select()
            .single();


    if (error) {

        console.error(error);

        throw new Error(
            error.message
        );

    }


    return mapDailyMenuOption(
        data
    );

}


/**
 * Elimina una opción.
 */
export async function deleteDailyMenuOption(
    id: string
): Promise<void> {

    const { error } =
        await supabase
            .from("daily_menu_options")
            .delete()
            .eq(
                "id",
                id
            );


    if (error) {

        console.error(error);

        throw new Error(
            error.message
        );

    }

}