import {
    DailyMenu,
    DailyMenuClient,
    DailyMenuItem,
    DailyMenuSection,
} from "@/types/daily-menu";

import {
    createDailyMenu,
    deleteDailyMenu,
    getDailyMenuById,
    getDailyMenus,
    getPublishedDailyMenu,
    saveDailyMenu,
    setDailyMenuPublished,
} from "@/lib/repositories/daily-menu.repository";

import {
    getDailyMenuOptions,
} from "@/lib/repositories/daily-menu-option.repository";


/**
 * Obtiene todos los menús configurados
 * para un restaurante.
 */
export async function getRestaurantDailyMenus(
    restaurantId: string
): Promise<DailyMenu[]> {

    return getDailyMenus(
        restaurantId
    );

}


/**
 * Obtiene el menú publicado para una fecha.
 */
export async function getRestaurantDailyMenu(
    restaurantId: string,
    menuDate: string
): Promise<DailyMenu | null> {

    return getPublishedDailyMenu(
        restaurantId,
        menuDate
    );

}


/**
 * Obtiene un menú por ID.
 */
export async function getDailyMenu(
    id: string
): Promise<DailyMenu> {

    return getDailyMenuById(
        id
    );

}


/**
 * Valida que todas las opciones
 * pertenezcan al restaurante.
 */
function validateMenuItems(
    options: Awaited<
        ReturnType<typeof getDailyMenuOptions>
    >,
    items: DailyMenuItem[]
): void {

    const optionIds =
        new Set(
            options.map(
                option =>
                    option.id
            )
        );


    for (
        const item
        of items
    ) {

        if (
            !optionIds.has(
                item.optionId
            )
        ) {

            throw new Error(
                "Una de las opciones seleccionadas no pertenece al restaurante."
            );

        }

    }

}


/**
 * Valida las reglas del Menú del Día.
 *
 * SOPA:
 * opcional; una opción queda fija y varias permiten
 * que el cliente elija una.
 *
 * SECO:
 * componentes fijos configurados por el restaurante,
 * sin mínimo ni máximo artificial.
 *
 * PRINCIPIO, PROTEÍNA, BEBIDA Y POSTRE:
 * opcionales; cuando hay opciones disponibles,
 * el cliente puede elegir una.
 *
 * TAMAÑOS:
 * debe existir al menos uno, con nombre y precio válido.
 */
async function validateDailyMenu(
    restaurantId: string,
    menu: DailyMenu
): Promise<void> {

    if (
        !menu.menuDate
    ) {

        throw new Error(
            "El menú debe tener una fecha."
        );

    }


    if (
        menu.items.length === 0
    ) {

        throw new Error(
            "El menú debe tener componentes."
        );

    }


    const options =
        await getDailyMenuOptions(
            restaurantId
        );


    validateMenuItems(
        options,
        menu.items
    );


    const soups =
        menu.items.filter(
            item =>
                item.section ===
                "soup"
        );


    const secos =
        menu.items.filter(
            item =>
                item.section ===
                "seco"
        );


    const proteins =
        menu.items.filter(
            item =>
                item.section ===
                "protein"
        );


    const drinks =
        menu.items.filter(
            item =>
                item.section ===
                "drink"
        );


    const desserts =
        menu.items.filter(
            item =>
                item.section ===
                "dessert"
        );


    /*
     * SOPA
     *
     * Puede no configurarse, configurarse una opción fija
     * o varias opciones para que el cliente elija una.
     */

    /*
     * SECO
     *
     * Los componentes son fijos y no tienen un mínimo
     * ni un máximo artificial de opciones.
     */

    /*
     * PROTEÍNA
     *
     * Es opcional. Si hay opciones disponibles,
     * el cliente podrá elegir una.
     */

    /*
     * BEBIDA
     *
     * Es opcional. Si hay opciones disponibles,
     * el cliente podrá elegir una.
     */


    /*
     * POSTRE
     *
     * Es opcional. Si hay opciones disponibles,
     * el cliente podrá elegir una.
     */

    if (
        desserts.length === 0
    ) {

        // El postre es opcional.
    }


    /*
     * TAMAÑOS
     */

    if (
        menu.sizes.length === 0
    ) {

        throw new Error(
            "El Menú del Día debe tener al menos un tamaño."
        );

    }


    for (
        const size
        of menu.sizes
    ) {

        if (
            !size.label.trim()
        ) {

            throw new Error(
                "Todos los tamaños deben tener un nombre."
            );

        }


        if (
            size.price < 0
        ) {

            throw new Error(
                "El precio de un tamaño no puede ser negativo."
            );

        }

    }

}


/**
 * Crea un nuevo menú para un día.
 */
export async function createRestaurantDailyMenu(
    restaurantId: string,
    menuProductId: string,
    menuDate: string
): Promise<DailyMenu> {

    return createDailyMenu(
        restaurantId,
        menuProductId,
        menuDate
    );

}


/**
 * Guarda completamente un menú.
 */
export async function saveRestaurantDailyMenu(
    restaurantId: string,
    menu: DailyMenu
): Promise<DailyMenu> {

    if (
        menu.restaurantId !==
        restaurantId
    ) {

        throw new Error(
            "El menú no pertenece al restaurante."
        );

    }


    await validateDailyMenu(
        restaurantId,
        menu
    );


    return saveDailyMenu(
        menu
    );

}


/**
 * Publica o despublica un menú.
 */
export async function publishRestaurantDailyMenu(
    restaurantId: string,
    menuId: string,
    isPublished: boolean
): Promise<void> {

    const menu =
        await getDailyMenuById(
            menuId
        );




    if (
        menu.restaurantId !==
        restaurantId
    ) {

        throw new Error(
            "El menú no pertenece al restaurante."
        );

    }


    if (
        isPublished
    ) {

        await validateDailyMenu(
            restaurantId,
            menu
        );

    }


    await setDailyMenuPublished(
        menuId,
        isPublished
    );

}


/**
 * Elimina un menú.
 */
export async function deleteRestaurantDailyMenu(
    restaurantId: string,
    menuId: string
): Promise<void> {

    const menu =
        await getDailyMenuById(
            menuId
        );

    if (
        menu.restaurantId !==
        restaurantId
    ) {

        throw new Error(
            "El menú no pertenece al restaurante."
        );

    }


    await deleteDailyMenu(
        menuId
    );

}

export async function getRestaurantDailyMenuClient(
    restaurantId: string,
    menuDate: string
): Promise<DailyMenuClient | null> {

    const menu =
        await getPublishedDailyMenu(
            restaurantId,
            menuDate
        );

    if (!menu) {
        return null;
    }

    const options =
        await getDailyMenuOptions(
            restaurantId
        );

    const optionsById =
        new Map(
            options.map(
                option => [
                    option.id,
                    option,
                ]
            )
        );

    const clientOptions =
        menu.items
            .map(item => {

                const option =
                    optionsById.get(
                        item.optionId
                    );

                if (!option) {
                    return null;
                }

                return {
                    id: option.id,
                    section: item.section,
                    name: option.name,
                    sortOrder: item.sortOrder,
                };

            })
            .filter(
                (
                    option
                ): option is {
                    id: string;
                    section: DailyMenuSection;
                    name: string;
                    sortOrder: number;
                } =>
                    option !== null
            );

    return {

        id:
            menu.id,

        restaurantId:
            menu.restaurantId,

        menuProductId:
            menu.menuProductId,

        menuDate:
            menu.menuDate,

        isPublished:
            menu.isPublished,

        image:
            menu.image,

        sizes:
            menu.sizes,

        sizeProteinPrices:
            menu.sizeProteinPrices,

        options:
            clientOptions,

    };

}