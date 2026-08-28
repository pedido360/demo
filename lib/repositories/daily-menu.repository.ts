import { supabase } from "@/lib/supabase";

import {
    DailyMenu,
    DailyMenuItem,
    DailyMenuSection,
    DailyMenuSize,
} from "@/types/daily-menu";


function mapDailyMenuItem(
    data: any
): DailyMenuItem {

    return {

        id:
            data.id,

        dailyMenuId:
            data.daily_menu_id,

        optionId:
            data.option_id,

        section:
            data.section as DailyMenuSection,

        sortOrder:
            data.sort_order,

    };

}

function mapDailyMenuSize(
    data: any
): DailyMenuSize {

    return {

        id: data.id,

        dailyMenuId:
            data.daily_menu_id,

        label:
            data.label,

        price:
            Number(data.price),

        isAvailable:
            data.is_available,

        sortOrder:
            data.sort_order,

    };

}


function mapDailyMenu(
    data: any,
    items: DailyMenuItem[] = [],
    sizes: DailyMenuSize[] = []
): DailyMenu {

    return {

        id:
            data.id,

        restaurantId:
            data.restaurant_id,

        menuProductId:
            data.menu_product_id,

        menuDate:
            data.menu_date,

        image:
            data.image ?? null,

        isPublished:
            data.is_published,

        createdAt:
            data.created_at,

        updatedAt:
            data.updated_at,

        items,

        sizes,

    };

}


/**
 * Obtiene los componentes de un menú.
 */
async function getDailyMenuItems(
    dailyMenuId: string
): Promise<DailyMenuItem[]> {

    const { data, error } =
        await supabase
            .from("daily_menu_items")
            .select("*")
            .eq(
                "daily_menu_id",
                dailyMenuId
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

    return (data ?? []).map(
        mapDailyMenuItem
    );

}


/**
 * Obtiene los tamaños de un menú.
 */
async function getDailyMenuSizes(
    dailyMenuId: string
): Promise<DailyMenuSize[]> {

    const { data, error } =
        await supabase
            .from("daily_menu_sizes")
            .select("*")
            .eq(
                "daily_menu_id",
                dailyMenuId
            )
            .order("sort_order", {
                ascending: true,
            });

    if (error) {

        console.error(error);

        throw new Error(
            error.message
        );

    }

    return (data ?? []).map(
        mapDailyMenuSize
    );

}


/**
 * Obtiene todos los menús de un restaurante.
 */
export async function getDailyMenus(
    restaurantId: string
): Promise<DailyMenu[]> {

    const { data, error } =
        await supabase
            .from("daily_menus")
            .select("*")
            .eq(
                "restaurant_id",
                restaurantId
            )
            .order("menu_date", {
                ascending: true,
            });

    if (error) {

        console.error(error);

        throw new Error(
            error.message
        );

    }

    const menus =
        data ?? [];

    if (menus.length === 0) {

        return [];

    }

    const result:
        DailyMenu[] = [];

    for (const menu of menus) {

        const [
            items,
            sizes,
        ] = await Promise.all([

            getDailyMenuItems(
                menu.id
            ),

            getDailyMenuSizes(
                menu.id
            ),

        ]);

        result.push(
            mapDailyMenu(
                menu,
                items,
                sizes
            )
        );

    }

    return result;

}


/**
 * Obtiene un menú específico.
 */
export async function getDailyMenuById(
    id: string
): Promise<DailyMenu> {

    const { data, error } =
        await supabase
            .from("daily_menus")
            .select("*")
            .eq("id", id)
            .single();

    if (error) {

        console.error(error);

        throw new Error(
            error.message
        );

    }

    const [
        items,
        sizes,
    ] = await Promise.all([

        getDailyMenuItems(
            id
        ),

        getDailyMenuSizes(
            id
        ),

    ]);

    return mapDailyMenu(
        data,
        items,
        sizes
    );

}


/**
 * Obtiene el menú publicado para una fecha.
 */
export async function getPublishedDailyMenu(
    restaurantId: string,
    menuDate: string
): Promise<DailyMenu | null> {

    const { data, error } =
        await supabase
            .from("daily_menus")
            .select("*")
            .eq(
                "restaurant_id",
                restaurantId
            )
            .eq(
                "menu_date",
                menuDate
            )
            .eq(
                "is_published",
                true
            )
            .maybeSingle();

    if (error) {

        console.error(error);

        throw new Error(
            error.message
        );

    }

    if (!data) {

        return null;

    }

    const [
        items,
        sizes,
    ] = await Promise.all([

        getDailyMenuItems(
            data.id
        ),

        getDailyMenuSizes(
            data.id
        ),

    ]);

    return mapDailyMenu(
        data,
        items,
        sizes
    );

}


/**
 * Crea un menú para una fecha.
 */
export async function createDailyMenu(
    restaurantId: string,
    menuProductId: string,
    menuDate: string
): Promise<DailyMenu> {

    const { data, error } =
        await supabase
            .from("daily_menus")
            .insert({

                restaurant_id:
                    restaurantId,

                menu_product_id:
                    menuProductId,

                menu_date:
                    menuDate,

                is_published:
                    false,

            })
            .select()
            .single();

    if (error) {

        console.error(error);

        throw new Error(
            error.message
        );

    }

    return mapDailyMenu(
        data
    );

}


/**
 * Actualiza los datos principales
 * de un menú.
 */
export async function updateDailyMenu(
    id: string,
    menuDate: string,
    isPublished: boolean,
    image: string | null
): Promise<DailyMenu> {

    const { data, error } =
        await supabase
            .from("daily_menus")
            .update({

                menu_date:
                    menuDate,

                is_published:
                    isPublished,

                image:
                    image,

                updated_at:
                    new Date().toISOString(),

            })
            .eq("id", id)
            .select()
            .single();

    if (error) {

        console.error(error);

        throw new Error(
            error.message
        );

    }

    return mapDailyMenu(
        data
    );

}


/**
 * Publica o despublica un menú.
 */
export async function setDailyMenuPublished(
    id: string,
    isPublished: boolean
): Promise<void> {

    const { error } =
        await supabase
            .from("daily_menus")
            .update({

                is_published:
                    isPublished,

                updated_at:
                    new Date().toISOString(),

            })
            .eq("id", id);

    if (error) {

        console.error(error);

        throw new Error(
            error.message
        );

    }

}


/**
 * Elimina un menú.
 *
 * Sus items y tamaños se eliminan
 * automáticamente por ON DELETE CASCADE.
 */
export async function deleteDailyMenu(
    id: string
): Promise<void> {

    const { error } =
        await supabase
            .from("daily_menus")
            .delete()
            .eq("id", id);

    if (error) {

        console.error(error);

        throw new Error(
            error.message
        );

    }

}


/**
 * Reemplaza completamente los componentes
 * de un menú.
 */
export async function replaceDailyMenuItems(
    dailyMenuId: string,
    items: DailyMenuItem[]
): Promise<void> {

    const { error: deleteError } =
        await supabase
            .from("daily_menu_items")
            .delete()
            .eq(
                "daily_menu_id",
                dailyMenuId
            );

    if (deleteError) {

        console.error(deleteError);

        throw new Error(
            deleteError.message
        );

    }

    if (items.length === 0) {

        return;

    }

    const { error: insertError } =
        await supabase
            .from("daily_menu_items")
            .insert(

                items.map(
                    (item) => ({

                        daily_menu_id:
                            dailyMenuId,

                        option_id:
                            item.optionId,

                        section:
                            item.section,

                        sort_order:
                            item.sortOrder,

                    })
                )

            );

    if (insertError) {

        console.error(insertError);

        throw new Error(
            insertError.message
        );

    }

}


/**
 * Reemplaza completamente los tamaños
 * de un menú.
 */
export async function replaceDailyMenuSizes(
    dailyMenuId: string,
    sizes: DailyMenuSize[]
): Promise<void> {

    const { error: deleteError } =
        await supabase
            .from("daily_menu_sizes")
            .delete()
            .eq(
                "daily_menu_id",
                dailyMenuId
            );

    if (deleteError) {

        console.error(deleteError);

        throw new Error(
            deleteError.message
        );

    }

    if (sizes.length === 0) {

        return;

    }

    const { error: insertError } =
        await supabase
            .from("daily_menu_sizes")
            .insert(

                sizes.map(
                    (size) => ({

                        daily_menu_id:
                            dailyMenuId,

                        label:
                            size.label,

                        price:
                            size.price,

                        is_available:
                            size.isAvailable,

                        sort_order:
                            size.sortOrder,

                    })
                )

            );

    if (insertError) {

        console.error(insertError);

        throw new Error(
            insertError.message
        );

    }

}


/**
 * Guarda completamente un menú:
 * datos principales + items + tamaños.
 */
export async function saveDailyMenu(
    menu: DailyMenu
): Promise<DailyMenu> {

    await updateDailyMenu(
        menu.id,
        menu.menuDate,
        menu.isPublished,
        menu.image
    );

    await replaceDailyMenuItems(
        menu.id,
        menu.items
    );

    await replaceDailyMenuSizes(
        menu.id,
        menu.sizes
    );

    return getDailyMenuById(
        menu.id
    );

}