import {
    DailyMenuOption,
    DailyMenuSection,
} from "@/types/daily-menu";

import {
    getDailyMenuOptions,
    createDailyMenuOption,
    updateDailyMenuOption,
    deleteDailyMenuOption,
} from "@/lib/repositories/daily-menu-option.repository";


const VALID_SECTIONS:
    DailyMenuSection[] = [
        "soup",
        "seco",
        "protein",
        "drink",
        "dessert",
    ];


/**
 * Obtiene todas las opciones
 * de un restaurante.
 */
export async function getRestaurantDailyMenuOptions(
    restaurantId: string
): Promise<DailyMenuOption[]> {

    return getDailyMenuOptions(
        restaurantId
    );

}


/**
 * Valida una opción antes de guardarla.
 */
function validateDailyMenuOption(
    option: DailyMenuOption
): void {

    if (
        !option.restaurantId
    ) {

        throw new Error(
            "La opción debe pertenecer a un restaurante."
        );

    }


    if (
        !VALID_SECTIONS.includes(
            option.section
        )
    ) {

        throw new Error(
            "La sección del Menú del Día no es válida."
        );

    }


    if (
        !option.name.trim()
    ) {

        throw new Error(
            "El nombre de la opción es obligatorio."
        );

    }


    if (
        option.sortOrder < 0
    ) {

        throw new Error(
            "El orden de la opción no puede ser negativo."
        );

    }

}


/**
 * Crea una nueva opción.
 */
export async function createRestaurantDailyMenuOption(
    restaurantId: string,
    section: DailyMenuSection,
    name: string,
    sortOrder: number = 0
): Promise<DailyMenuOption> {

    const option: DailyMenuOption = {

        id: "",

        restaurantId,

        section,

        name:
            name.trim(),

        isActive:
            true,

        sortOrder,

        createdAt:
            new Date().toISOString(),

    };


    validateDailyMenuOption(
        option
    );


    return createDailyMenuOption(
        option
    );

}


/**
 * Actualiza una opción.
 */
export async function updateRestaurantDailyMenuOption(
    restaurantId: string,
    option: DailyMenuOption
): Promise<DailyMenuOption> {

    if (
        option.restaurantId !==
        restaurantId
    ) {

        throw new Error(
            "La opción no pertenece al restaurante."
        );

    }


    validateDailyMenuOption(
        option
    );


    return updateDailyMenuOption(
        option
    );

}


/**
 * Elimina una opción.
 */
export async function deleteRestaurantDailyMenuOption(
    restaurantId: string,
    optionId: string
): Promise<void> {

    const options =
        await getDailyMenuOptions(
            restaurantId
        );


    const option =
        options.find(
            item =>
                item.id ===
                optionId
        );


    if (!option) {

        throw new Error(
            "La opción no pertenece al restaurante."
        );

    }


    await deleteDailyMenuOption(
        optionId
    );

}