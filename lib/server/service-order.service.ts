import "server-only";

import { supabaseAdmin } from "@/lib/supabase/admin";

export type ServiceOrderType = "dine_in" | "takeaway";

export interface ServiceOrderRequest {
    orderType: ServiceOrderType;
    tableSessionId: string | null;
    customerName: string | null;
    idempotencyKey: string;
    items: unknown[];
    notes?: string | null;
}

export interface ValidatedServiceOrder {
    restaurantId: string;
    waiterId: string;
    orderType: ServiceOrderType;
    tableSessionId: string | null;
    idempotencyKey: string;
    items: Record<string, unknown>[];
    subtotal: number;
    total: number;
    notes: string | null;
    cashierPayload: Record<string, unknown>;
    kitchenPayload: Record<string, unknown>;
}

function fail(message: string): never {
    throw new Error(message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredId(value: unknown, label: string): string {
    if (typeof value !== "string" || !/^[0-9a-f-]{36}$/i.test(value)) {
        fail(`${label} no es válido.`);
    }

    return value;
}

function requiredQuantity(value: unknown): number {
    const quantity = Number(value);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        fail("La cantidad de un producto no es válida.");
    }

    return quantity;
}

function money(value: unknown): number {
    if (typeof value !== "string" && typeof value !== "number") {
        fail("Se encontró un precio no válido en el catálogo.");
    }

    if (typeof value === "number" && !Number.isSafeInteger(value)) {
        fail("Los precios de Pedidos360 deben ser pesos enteros.");
    }

    const raw = String(value).trim();
    const match = /^(\d+)(?:\.(\d+))?$/.exec(raw);

    if (!match || (match[2] !== undefined && /[1-9]/.test(match[2]))) {
        fail("Los precios de Pedidos360 deben ser pesos enteros.");
    }

    const integerValue = BigInt(match[1]);

    if (integerValue > BigInt(Number.MAX_SAFE_INTEGER)) {
        fail("El precio supera el límite numérico permitido.");
    }

    return Number(integerValue);
}

/**
 * Comprueba que el mesero esté activo y vinculado al restaurante.
 * El restaurantId debe proceder del contexto autenticado del servidor,
 * nunca de un valor enviado libremente por el teléfono.
 */
export async function getActiveWaiter(
    profileId: string,
    restaurantId: string
): Promise<{ waiterId: string; restaurantId: string }> {
    const { data: account, error: accountError } = await supabaseAdmin
        .from("waiter_accounts")
        .select("id, restaurant_id, status, profile_id")
        .eq("profile_id", profileId)
        .eq("restaurant_id", restaurantId)
        .eq("status", "active")
        .maybeSingle();

    if (accountError) {
        console.error("Error verificando cuenta del mesero:", accountError);
        fail("No fue posible verificar la cuenta del mesero.");
    }

    if (!account) {
        fail("La cuenta del mesero está inactiva o no pertenece a este restaurante.");
    }

    const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id, role, restaurant_id")
        .eq("id", profileId)
        .maybeSingle();

    if (profileError) {
        console.error("Error verificando perfil del mesero:", profileError);
        fail("No fue posible verificar la cuenta del mesero.");
    }

    if (
        !profile ||
        profile.role !== "waiter" ||
        profile.restaurant_id !== restaurantId ||
        account.profile_id !== profileId ||
        account.restaurant_id !== restaurantId
    ) {
        fail("La cuenta del mesero está inactiva o no pertenece a este restaurante.");
    }

    return {
        waiterId: account.id,
        restaurantId: account.restaurant_id,
    };
}

/**
 * Valida el tipo y la estructura básica de una solicitud.
 * Los precios, nombres y tickets se construirán posteriormente
 * consultando el catálogo desde el servidor.
 */
export function validateServiceOrderRequest(
    input: unknown
): ServiceOrderRequest {
    if (!isRecord(input)) {
        fail("La solicitud del pedido no es válida.");
    }

    if (input.orderType !== "dine_in" && input.orderType !== "takeaway") {
        fail("El tipo de pedido no es válido.");
    }

    const tableSessionId =
        input.orderType === "dine_in" || input.tableSessionId != null
            ? requiredId(input.tableSessionId, "La cuenta de la mesa")
            : null;

    const customerName =
        input.orderType === "takeaway" && tableSessionId === null
            ? typeof input.customerName === "string"
                ? input.customerName.trim().slice(0, 80)
                : ""
            : null;

    if (input.orderType === "takeaway" && tableSessionId === null && !customerName) {
        fail("El nombre del cliente es obligatorio para pedidos independientes.");
    }

    const idempotencyKey = requiredId(
        input.idempotencyKey,
        "La clave de confirmación"
    );

    if (!Array.isArray(input.items) || input.items.length === 0) {
        fail("Agrega al menos un producto al pedido.");
    }

    if (input.items.length > 100) {
        fail("El pedido supera el límite permitido de productos.");
    }

    const notes =
        input.notes == null
            ? null
            : typeof input.notes === "string"
                ? input.notes.trim().slice(0, 1000) || null
                : fail("Las observaciones del pedido no son válidas.");

    return {
        orderType: input.orderType,
        tableSessionId,
        customerName,
        idempotencyKey,
        items: input.items,
        notes,
    };
}

export { requiredId, requiredQuantity, money, fail, isRecord };



async function validateProductSchedule(
    productId: string,
    restrictPurchaseHours: boolean
): Promise<void> {
    const [daysResult, hoursResult] = await Promise.all([
        supabaseAdmin
            .from("product_available_days")
            .select("day_of_week")
            .eq("product_id", productId),
        supabaseAdmin
            .from("product_available_hours")
            .select("day_of_week, start_time, end_time")
            .eq("product_id", productId),
    ]);

    if (daysResult.error || hoursResult.error) {
        console.error("Error consultando disponibilidad del producto:", {
            days: daysResult.error,
            hours: hoursResult.error,
        });
        fail("No fue posible verificar el horario del producto.");
    }

    const weekday = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Bogota",
        weekday: "short",
    }).format(new Date());

    const dayMap: Record<string, number> = {
        Sun: 0, Mon: 1, Tue: 2, Wed: 3,
        Thu: 4, Fri: 5, Sat: 6,
    };

    const today = dayMap[weekday];
    const availableDays = (daysResult.data ?? []).map(
        row => Number(row.day_of_week)
    );
    const availableHours = hoursResult.data ?? [];

    if (availableDays.length > 0 && !availableDays.includes(today)) {
        fail("Este producto no está disponible para compra hoy.");
    }

    // Sin restricción de compra, se replica la visibilidad normal del menú:
    // si no hay días configurados, está disponible todos los días.
    if (!restrictPurchaseHours && availableDays.length === 0) {
        return;
    }

    const todayHours = availableHours.find(
        hour => Number(hour.day_of_week) === today
    );

    if (!todayHours) {
        if (
            !restrictPurchaseHours ||
            (availableDays.length === 0 && availableHours.length === 0)
        ) {
            return;
        }

        fail("Este producto no tiene un horario de compra configurado para hoy.");
    }

    const now = new Intl.DateTimeFormat("en-GB", {
        timeZone: "America/Bogota",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(new Date());

    const currentTime = now === "24:00" ? "00:00" : now;
    const startTime = String(todayHours.start_time).slice(0, 5);
    const endTime = String(todayHours.end_time).slice(0, 5);

    if (currentTime < startTime || currentTime >= endTime) {
        if (!restrictPurchaseHours) {
            fail("Este producto no está disponible en este horario.");
        }

        const formatTime = (value: string) => {
            const [hour, minute] = value.split(":").map(Number);
            return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour < 12 ? "a. m." : "p. m."}`;
        };

        fail(
            `Este producto solo se puede pedir de ${formatTime(startTime)} a ${formatTime(endTime)}.`
        );
    }
}

export async function validateNormalProductSelection(
    restaurantId: string,
    selection: unknown
): Promise<{ item: Record<string, unknown>; total: number }> {
    if (!isRecord(selection) || !isRecord(selection.product)) {
        fail("La selección del producto no es válida.");
    }

    const productId = requiredId(selection.product.id, "El producto");
    const quantity = requiredQuantity(selection.quantity);

    const { data: product, error: productError } = await supabaseAdmin
        .from("products")
        .select("id, restaurant_id, name, price, is_available, product_type, restrict_purchase_hours")
        .eq("id", productId)
        .eq("restaurant_id", restaurantId)
        .maybeSingle();

    if (productError) {
        console.error("Error consultando producto:", productError);
        fail("No fue posible consultar el catálogo.");
    }

    if (!product || !product.is_available) {
        fail("Uno de los productos ya no está disponible.");
    }

    if (product.product_type === "daily_menu") {
        fail("El menú del día debe validarse mediante su configuración publicada.");
    }

    await validateProductSchedule(
        productId,
        Boolean(product.restrict_purchase_hours)
    );

    let unitPrice = money(product.price);
    let variantSnapshot: Record<string, unknown> | null = null;

    if (selection.variant != null) {
        if (!isRecord(selection.variant)) {
            fail("La variante seleccionada no es válida.");
        }

        const variantId = requiredId(selection.variant.id, "La variante");
        const { data: variant, error } = await supabaseAdmin
            .from("product_variants")
            .select("id, product_id, label, price, is_available")
            .eq("id", variantId)
            .eq("product_id", productId)
            .maybeSingle();

        if (error) {
            console.error("Error consultando variante:", error);
            fail("No fue posible validar la variante.");
        }

        if (!variant || !variant.is_available) {
            fail("La variante seleccionada no está disponible.");
        }

        unitPrice = money(variant.price);
        variantSnapshot = {
            id: variant.id,
            label: variant.label,
            price: unitPrice,
        };
    }

    const selectedIngredients = Array.isArray(selection.ingredients)
        ? selection.ingredients
        : [];

    const ingredientIds = selectedIngredients.map((item) => {
        if (!isRecord(item)) fail("La selección de ingredientes no es válida.");
        return requiredId(item.id, "El ingrediente");
    });

    if (new Set(ingredientIds).size !== ingredientIds.length) {
        fail("Hay ingredientes repetidos en el pedido.");
    }

    let ingredientSnapshot: Record<string, unknown>[] = [];

    if (ingredientIds.length > 0) {
        const { data, error } = await supabaseAdmin
            .from("ingredients")
            .select("id, product_id, name, is_active")
            .eq("product_id", productId)
            .in("id", ingredientIds);

        if (error) {
            console.error("Error consultando ingredientes:", error);
            fail("No fue posible validar los ingredientes.");
        }

        if ((data ?? []).length !== ingredientIds.length ||
            data?.some((item) => !item.is_active)) {
            fail("Uno de los ingredientes ya no pertenece al producto o está inactivo.");
        }

        ingredientSnapshot = (data ?? []).map((item) => ({
            id: item.id,
            name: item.name,
        }));
    }

    const selectedExtras = Array.isArray(selection.extras)
        ? selection.extras
        : [];

    const extraIds = selectedExtras.map((item) => {
        if (!isRecord(item)) fail("La selección de extras no es válida.");
        return requiredId(item.id, "El extra");
    });

    if (new Set(extraIds).size !== extraIds.length) {
        fail("Hay extras repetidos en el pedido.");
    }

    const extraSnapshot: Record<string, unknown>[] = [];

    if (extraIds.length > 0) {
        const [directResult, assignmentsResult, selectionGroupsResult] =
            await Promise.all([
                supabaseAdmin
                    .from("extras")
                    .select("id, product_id, name, price, is_active")
                    .eq("product_id", productId)
                    .in("id", extraIds),
                supabaseAdmin
                    .from("product_extra_groups")
                    .select("group_id")
                    .eq("product_id", productId),
                supabaseAdmin
                    .from("product_extra_selection_groups")
                    .select("id, min_selections, max_selections, is_active")
                    .eq("product_id", productId)
                    .eq("is_active", true),
            ]);

        if (directResult.error || assignmentsResult.error || selectionGroupsResult.error) {
            console.error(
                "Error consultando extras:",
                directResult.error || assignmentsResult.error || selectionGroupsResult.error
            );
            fail("No fue posible validar los extras.");
        }

        const directExtras = directResult.data ?? [];
        const groupIds = (assignmentsResult.data ?? []).map((row) => row.group_id);

        const [groupItemsResult, reusableExtrasResult, selectionItemsResult] =
            await Promise.all([
                groupIds.length
                    ? supabaseAdmin
                        .from("extra_group_items")
                        .select("group_id, extra_id")
                        .in("group_id", groupIds)
                    : Promise.resolve({ data: [], error: null }),
                supabaseAdmin
                    .from("extra_catalog")
                    .select("id, name, price, is_active")
                    .eq("restaurant_id", restaurantId)
                    .in("id", extraIds),
                (selectionGroupsResult.data ?? []).length
                    ? supabaseAdmin
                        .from("product_extra_selection_group_items")
                        .select("group_id, extra_id")
                        .in("group_id", (selectionGroupsResult.data ?? []).map((row) => row.id))
                    : Promise.resolve({ data: [], error: null }),
            ]);

        if (groupItemsResult.error || reusableExtrasResult.error || selectionItemsResult.error) {
            console.error(
                "Error consultando grupos de extras:",
                groupItemsResult.error || reusableExtrasResult.error || selectionItemsResult.error
            );
            fail("No fue posible validar los grupos de extras.");
        }

        const allowedReusableIds = new Set(
            (groupItemsResult.data ?? []).map((row) => row.extra_id)
        );
        const reusableById = new Map(
            (reusableExtrasResult.data ?? []).map((row) => [row.id, row])
        );
        const directById = new Map(directExtras.map((row) => [row.id, row]));

        for (const id of extraIds) {
            const direct = directById.get(id);
            const reusable = reusableById.get(id);

            if (direct && !direct.is_active) {
                fail("Uno de los extras está inactivo.");
            }

            if (reusable && !reusable.is_active) {
                fail("Uno de los extras del catálogo está inactivo.");
            }

            if (!direct && !allowedReusableIds.has(id)) {
                fail("Uno de los extras no está habilitado para este producto.");
            }

            if (!direct && !reusable) {
                fail("No se encontró el precio de uno de los extras.");
            }

            const extra = direct ?? reusable!;
            extraSnapshot.push({
                id: extra.id,
                name: extra.name,
                price: money(extra.price),
            });
        }

        const activeGroups = selectionGroupsResult.data ?? [];
        const selectedGroupItems = selectionItemsResult.data ?? [];

        for (const group of activeGroups) {
            const allowedIds = new Set(
                selectedGroupItems
                    .filter((row) => row.group_id === group.id)
                    .map((row) => row.extra_id)
            );
            const count = extraIds.filter((id) => allowedIds.has(id)).length;

            if (count < Number(group.min_selections) ||
                count > Number(group.max_selections)) {
                fail(`La selección del grupo de extras "${group.id}" no cumple sus límites.`);
            }
        }
    } else {
        // Aunque no se envíen extras, los grupos obligatorios deben cumplirse.
        const { data: activeGroups, error } = await supabaseAdmin
            .from("product_extra_selection_groups")
            .select("id, min_selections")
            .eq("product_id", productId)
            .eq("is_active", true);

        if (error) {
            console.error("Error consultando grupos de selección:", error);
            fail("No fue posible validar los grupos de selección.");
        }

        for (const group of activeGroups ?? []) {
            if (Number(group.min_selections) > 0) {
                fail("Debes completar las opciones obligatorias del producto.");
            }
        }
    }

    const extrasTotal = extraSnapshot.reduce(
        (sum, extra) => sum + Number(extra.price),
        0
    );

    const total = money((unitPrice + extrasTotal) * quantity);

    const item = {
        product: {
            id: product.id,
            name: product.name,
            productType: product.product_type,
            price: money(product.price),
        },
        variant: variantSnapshot,
        quantity,
        ingredients: ingredientSnapshot,
        extras: extraSnapshot,
        notes: typeof selection.notes === "string"
            ? selection.notes.trim().slice(0, 500)
            : "",
        unitPrice: money(unitPrice + extrasTotal),
        total,
    };

    return { item, total };
}


/**
 * Valida una selección de menú del día contra la configuración publicada.
 * menuDate debe ser calculada por el servidor usando la zona horaria
 * configurada para el restaurante.
 */
export async function validateDailyMenuSelection(
    restaurantId: string,
    selection: unknown,
    menuDate: string
): Promise<{ item: Record<string, unknown>; total: number }> {
    if (!isRecord(selection) || !isRecord(selection.product) ||
        !isRecord(selection.dailyMenu)) {
        fail("La selección del menú del día no es válida.");
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(menuDate)) {
        fail("La fecha del menú no es válida.");
    }

    const productId = requiredId(selection.product.id, "El producto del menú");
    const quantity = requiredQuantity(selection.quantity);
    const dailySelection = selection.dailyMenu;

    const { data: product, error: productError } = await supabaseAdmin
        .from("products")
        .select("id, restaurant_id, name, product_type, is_available")
        .eq("id", productId)
        .eq("restaurant_id", restaurantId)
        .eq("product_type", "daily_menu")
        .maybeSingle();

    if (productError) {
        console.error("Error consultando producto del menú:", productError);
        fail("No fue posible consultar el producto del menú.");
    }

    if (!product || !product.is_available) {
        fail("El producto del menú del día no está disponible.");
    }

    const { data: menu, error: menuError } = await supabaseAdmin
        .from("daily_menus")
        .select("id, restaurant_id, menu_product_id, menu_date, is_published")
        .eq("restaurant_id", restaurantId)
        .eq("menu_product_id", productId)
        .eq("menu_date", menuDate)
        .eq("is_published", true)
        .maybeSingle();

    if (menuError) {
        console.error("Error consultando menú publicado:", menuError);
        fail("No fue posible consultar el menú publicado.");
    }

    if (!menu) {
        fail("Este restaurante no tiene un menú del día publicado para la fecha actual.");
    }

    const [itemsResult, sizesResult, pricesResult, optionsResult] =
        await Promise.all([
            supabaseAdmin
                .from("daily_menu_items")
                .select("option_id, section, sort_order")
                .eq("daily_menu_id", menu.id)
                .order("sort_order"),
            supabaseAdmin
                .from("daily_menu_sizes")
                .select("id, label, price, pricing_mode, is_available")
                .eq("daily_menu_id", menu.id)
                .order("sort_order"),
            supabaseAdmin
                .from("daily_menu_size_protein_prices")
                .select("size_id, option_id, price, is_available")
                .eq("daily_menu_id", menu.id),
            supabaseAdmin
                .from("daily_menu_options")
                .select("id, section, name, is_active")
                .eq("restaurant_id", restaurantId)
                .eq("is_active", true),
        ]);

    const queryError =
        itemsResult.error || sizesResult.error ||
        pricesResult.error || optionsResult.error;

    if (queryError) {
        console.error("Error consultando configuración del menú:", queryError);
        fail("No fue posible validar la configuración del menú del día.");
    }

    const configuredItems = itemsResult.data ?? [];
    const availableSizes = sizesResult.data ?? [];
    const proteinPrices = pricesResult.data ?? [];
    const activeOptions = optionsResult.data ?? [];

    const sizeId = requiredId(
        isRecord(dailySelection.size) ? dailySelection.size.id : null,
        "El tamaño del menú"
    );

    const size = availableSizes.find(
        (candidate) => candidate.id === sizeId && candidate.is_available
    );

    if (!size) {
        fail("El tamaño seleccionado no está disponible.");
    }

    const optionsById = new Map(
        activeOptions.map((option) => [option.id, option])
    );

    const configuredBySection = new Map<string, string[]>();

    for (const row of configuredItems) {
        const ids = configuredBySection.get(row.section) ?? [];
        ids.push(row.option_id);
        configuredBySection.set(row.section, ids);
    }

    const configuredOptions = (section: string) =>
        (configuredBySection.get(section) ?? [])
            .map((id) => optionsById.get(id))
            .filter((option) => option !== undefined);

    const snapshotOption = (
        value: unknown,
        section: string,
        required: boolean
    ): Record<string, unknown> | null => {
        const configured = configuredOptions(section);

        if (configured.length === 0) {
            if (value != null) {
                fail(`El menú no tiene opciones configuradas para ${section}.`);
            }
            if (required) {
                fail(`Falta la opción obligatoria de ${section}.`);
            }
            return null;
        }

        if (value == null) {
            if (required) {
                fail(`Debes seleccionar una opción de ${section}.`);
            }
            return null;
        }

        if (!isRecord(value)) {
            fail(`La selección de ${section} no es válida.`);
        }

        const id = requiredId(value.id, `La opción de ${section}`);
        const option = configured.find((candidate) => candidate.id === id);

        if (!option) {
            fail(`La opción seleccionada de ${section} no está habilitada en este menú.`);
        }

        return {
            id: option.id,
            name: option.name,
            section: option.section,
        };
    };

    const soupOptions = configuredOptions("soup");
    const soup = soupOptions.length === 1
        ? {
            id: soupOptions[0].id,
            name: soupOptions[0].name,
            section: "soup",
        }
        : snapshotOption(dailySelection.soup, "soup", soupOptions.length > 1);

    // Los secos son fijos: se incluyen todos los configurados y activos.
    const secos = configuredOptions("seco").map((option) => ({
        id: option.id,
        name: option.name,
        section: "seco",
    }));

    const principle = snapshotOption(
        dailySelection.principle, "principle", false
    );
    const protein = snapshotOption(
        dailySelection.protein, "protein", false
    );
    const drink = snapshotOption(
        dailySelection.drink, "drink", false
    );
    const dessert = snapshotOption(
        dailySelection.dessert, "dessert", false
    );

    let unitPrice = money(size.price);

    if (size.pricing_mode === "protein") {
        if (!protein) {
            fail("Este tamaño requiere una proteína para calcular su precio.");
        }

        const proteinPrice = proteinPrices.find(
            (row) =>
                row.size_id === size.id &&
                row.option_id === protein.id &&
                row.is_available
        );

        if (!proteinPrice) {
            fail("La combinación de tamaño y proteína no tiene un precio disponible.");
        }

        unitPrice = money(proteinPrice.price);
    } else if (size.pricing_mode !== "fixed" && size.pricing_mode != null) {
        fail("El menú tiene una modalidad de precio no reconocida.");
    }

    const total = money(unitPrice * quantity);

    const dailyMenuSnapshot = {
        menuId: menu.id,
        menuDate: menu.menu_date,
        size: {
            id: size.id,
            label: size.label,
            price: unitPrice,
            pricingMode: size.pricing_mode ?? "fixed",
        },
        soup,
        secos,
        principle,
        protein,
        drink,
        dessert,
        quantity,
        notes: typeof dailySelection.notes === "string"
            ? dailySelection.notes.trim().slice(0, 500)
            : "",
    };

    return {
        item: {
            product: {
                id: product.id,
                name: product.name,
                productType: "daily_menu",
            },
            quantity,
            dailyMenu: dailyMenuSnapshot,
            unitPrice,
            total,
        },
        total,
    };
}


/**
 * Valida el pedido completo, construye los tickets en el servidor
 * y confirma el pedido junto con sus dos trabajos de impresión.
 */
export async function confirmWaiterServiceOrder(
    restaurantId: string,
    waiterId: string,
    input: unknown,
    menuDate: string
) {
    const request = validateServiceOrderRequest(input);

    const validatedItems: Record<string, unknown>[] = [];
    let subtotal = 0;

    for (const selection of request.items) {
        if (!isRecord(selection) || !isRecord(selection.product)) {
            fail("Uno de los productos del pedido no es válido.");
        }

        const result =
            selection.product.productType === "daily_menu"
                ? await validateDailyMenuSelection(
                    restaurantId,
                    selection,
                    menuDate
                )
                : await validateNormalProductSelection(
                    restaurantId,
                    selection
                );

        validatedItems.push(result.item);
        subtotal = money(subtotal + result.total);
    }

    if (validatedItems.length === 0 || subtotal < 0) {
        fail("El pedido no contiene productos válidos.");
    }

    const cashierPayload = {
        ticket_type: "CASHIER_CONTROL",
        title: "COPIA DE CONTROL - CAJA",
        warning: "NO ES PEDIDO NUEVO - NO PREPARAR - SOLO CONTROL DE CAJA",
        items: validatedItems,
        subtotal,
        total: subtotal,
        notes: request.notes,
        customer_name: request.customerName,
    };

    const kitchenPayload = {
        ticket_type: "KITCHEN_ORDER",
        title: request.orderType === "dine_in"
            ? "COMANDA DE MESA"
            : "PEDIDO PARA LLEVAR",
        items: validatedItems,
        notes: request.notes,
        customer_name: request.customerName,
    };

    const { data, error } = await supabaseAdmin.rpc(
        "confirm_service_order",
        {
            p_restaurant_id: restaurantId,
            p_waiter_id: waiterId,
            p_order_type: request.orderType,
            p_table_session_id: request.tableSessionId,
            p_customer_name: request.customerName,
            p_items: validatedItems,
            p_subtotal: subtotal,
            p_total: subtotal,
            p_notes: request.notes,
            p_idempotency_key: request.idempotencyKey,
            p_cashier_payload: cashierPayload,
            p_kitchen_payload: kitchenPayload,
        }
    );

    if (error) {
        console.error("Error confirmando pedido de mesero:", error);
        fail("No fue posible confirmar el pedido. No vuelvas a enviarlo con una clave nueva; verifica su estado antes de reintentar.");
    }

    const confirmation = Array.isArray(data) ? data[0] : data;

    if (!confirmation?.order_id || !confirmation?.order_number) {
        console.error("Respuesta inesperada de confirm_service_order:", data);
        fail("El servidor no recibió una confirmación válida del pedido.");
    }

    return {
        orderId: confirmation.order_id,
        orderNumber: confirmation.order_number,
        accumulatedTableTotal:
            confirmation.accumulated_table_total == null
                ? null
                : Number(confirmation.accumulated_table_total),
        wasDuplicate: Boolean(confirmation.was_duplicate),
        subtotal,
        total: subtotal,
        printStatus: "queued" as const,
    };
}
