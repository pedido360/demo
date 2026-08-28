import sharp from "sharp";

import {
    readFile,
} from "fs/promises";

import path from "path";

import {
    DailyMenu,
    DailyMenuSection,
} from "@/types/daily-menu";

import {
    Restaurant,
} from "@/types/restaurant";

import {
    getDailyMenuOptions,
} from "@/lib/repositories/daily-menu-option.repository";

import {
    supabase,
} from "@/lib/supabase";

import {
    uploadImage,
} from "@/lib/repositories/storage.repository";


/*
 * ============================================================
 * CONFIGURACIÓN VISUAL
 * ============================================================
 */

export type DailyMenuImageTheme =
    | "green"
    | "orange"
    | "red"
    | "blue";


interface DailyMenuTheme {

    primary: string;

    primaryDark: string;

    primaryLight: string;

    background: string;

    surface: string;

    border: string;

    text: string;

    muted: string;

    price: string;

}


const DAILY_MENU_THEMES:
    Record<
        DailyMenuImageTheme,
        DailyMenuTheme
    > = {

    green: {

        primary: "#15803d",

        primaryDark: "#166534",

        primaryLight: "#dcfce7",

        background: "#f0fdf4",

        surface: "#ffffff",

        border: "#bbf7d0",

        text: "#172018",

        muted: "#64748b",

        price: "#166534",

    },

    orange: {

        primary: "#ea580c",

        primaryDark: "#c2410c",

        primaryLight: "#ffedd5",

        background: "#fff7ed",

        surface: "#ffffff",

        border: "#fed7aa",

        text: "#1c1917",

        muted: "#78716c",

        price: "#c2410c",

    },

    red: {

        primary: "#dc2626",

        primaryDark: "#b91c1c",

        primaryLight: "#fee2e2",

        background: "#fef2f2",

        surface: "#ffffff",

        border: "#fecaca",

        text: "#1f1717",

        muted: "#78716c",

        price: "#b91c1c",

    },

    blue: {

        primary: "#2563eb",

        primaryDark: "#1d4ed8",

        primaryLight: "#dbeafe",

        background: "#eff6ff",

        surface: "#ffffff",

        border: "#bfdbfe",

        text: "#172033",

        muted: "#64748b",

        price: "#1d4ed8",

    },

};


/*
 * ============================================================
 * SECCIONES
 * ============================================================
 */

const SECTION_LABELS:
    Record<
        DailyMenuSection,
        string
    > = {

    soup:
        "SOPA",

    seco:
        "SECOS",

    principle:
        "PRINCIPIO",

    protein:
        "PROTEÍNA",

    drink:
        "BEBIDA",

    dessert:
        "POSTRE",

};


const SECTION_ORDER:
    DailyMenuSection[] = [

        "soup",

        "seco",

        "principle",

        "protein",

        "drink",

        "dessert",

    ];


/*
 * ============================================================
 * UTILIDADES
 * ============================================================
 */

function escapeXml(
    value: string
): string {

    return value

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&apos;"
        );

}


function formatPrice(
    price: number
): string {

    return `$${price.toLocaleString(
        "es-CO"
    )}`;

}


function formatDate(
    date: string
): string {

    const parsed =
        new Date(
            `${date}T12:00:00`
        );


    const formatted =
        new Intl.DateTimeFormat(
            "es-CO",
            {
                weekday:
                    "long",

                day:
                    "numeric",

                month:
                    "long",
            }
        ).format(
            parsed
        );


    return formatted
        .replace(
            /^./,
            character =>
                character.toUpperCase()
        );

}


function wrapText(
    text: string,
    maxCharacters: number
): string[] {

    const words =
        text
            .trim()
            .split(
                /\s+/
            );


    const lines:
        string[] = [];


    let current =
        "";


    for (
        const word
        of words
    ) {

        const candidate =
            current
                ? `${current} ${word}`
                : word;


        if (
            candidate.length >
            maxCharacters
        ) {

            if (
                current
            ) {

                lines.push(
                    current
                );

            }


            current =
                word;

        } else {

            current =
                candidate;

        }

    }


    if (
        current
    ) {

        lines.push(
            current
        );

    }


    return lines;

}


/*
 * ============================================================
 * IMÁGENES REMOTAS
 * ============================================================
 */

async function getImageDataUri(
    imageUrl?: string | null
): Promise<string | null> {

    if (
        !imageUrl
    ) {

        return null;

    }


    try {

        const response =
            await fetch(
                imageUrl
            );


        if (
            !response.ok
        ) {

            console.error(
                "No fue posible descargar la imagen:",
                response.status,
                imageUrl
            );

            return null;

        }


        const sourceBuffer =
            Buffer.from(
                await response.arrayBuffer()
            );


        /*
         * Convertimos la imagen remota
         * a PNG antes de incrustarla
         * en el SVG.
         */

        const pngBuffer =
            await sharp(
                sourceBuffer
            )
                .png()
                .toBuffer();


        return (
            "data:image/png;base64," +
            pngBuffer.toString(
                "base64"
            )
        );


    } catch (
    error
    ) {

        console.error(
            "Error descargando o convirtiendo imagen:",
            error
        );

        return null;

    }

}


/*
 * ============================================================
 * BIBLIOTECA DE IMÁGENES
 * ============================================================
 *
 * Podemos agregar:
 *
 * daily-menu-07.webp
 * daily-menu-08.webp
 * daily-menu-09.webp
 *
 * etc.
 *
 * El generador las detectará automáticamente
 * dentro del rango preparado.
 *
 * ============================================================
 */

const DAILY_MENU_IMAGE_DIRECTORY =
    path.join(
        process.cwd(),
        "public",
        "images",
        "daily-menu"
    );


async function getDailyMenuLibraryImages():
    Promise<string[]> {

    const possibleNames =
        Array.from(
            {
                length: 30,
            },
            (
                _,
                index
            ) =>
                `daily-menu-${String(
                    index + 1
                ).padStart(
                    2,
                    "0"
                )}.webp`
        );


    const available:
        string[] = [];


    for (
        const fileName
        of possibleNames
    ) {

        try {

            await readFile(
                path.join(
                    DAILY_MENU_IMAGE_DIRECTORY,
                    fileName
                )
            );


            available.push(
                fileName
            );


        } catch {

            // La imagen todavía no existe.

        }

    }


    return available;

}


/*
 * ============================================================
 * SELECCIÓN DETERMINISTA
 * ============================================================
 */

function getStableLibraryIndex(
    menuId: string,
    length: number
): number {

    if (
        length <= 0
    ) {

        return 0;

    }


    let hash =
        0;


    for (
        let index = 0;
        index < menuId.length;
        index++
    ) {

        hash =
            (
                (
                    hash << 5
                ) -
                hash
            ) +
            menuId.charCodeAt(
                index
            );


        hash |= 0;

    }


    return Math.abs(
        hash
    ) % length;

}


/*
 * ============================================================
 * FOTO PREDETERMINADA
 * ============================================================
 */

async function getDefaultDailyMenuImageDataUri(
    menuId: string
): Promise<string | null> {

    const images =
        await getDailyMenuLibraryImages();


    if (
        images.length === 0
    ) {

        console.warn(
            "No hay imágenes predeterminadas disponibles para Menú del Día."
        );

        return null;

    }


    const index =
        getStableLibraryIndex(
            menuId,
            images.length
        );


    const selectedFile =
        images[index];


    try {

        const buffer =
            await readFile(
                path.join(
                    DAILY_MENU_IMAGE_DIRECTORY,
                    selectedFile
                )
            );


        return (
            "data:image/webp;base64," +
            buffer.toString(
                "base64"
            )
        );


    } catch (
    error
    ) {

        console.error(
            "No fue posible cargar la imagen predeterminada:",
            error
        );

        return null;

    }

}


/*
 * ============================================================
 * FOTO DEL MENÚ
 * ============================================================
 *
 * Prioridad:
 *
 * 1. Foto personalizada del restaurante/menú.
 * 2. Imagen predeterminada Pedidos360.
 *
 * ============================================================
 */

async function getDailyMenuPhotoDataUri(
    restaurantId: string,
    menu: DailyMenu
): Promise<string | null> {

    const coverPath =
        `restaurants/${restaurantId}/daily-menu/${menu.id}/cover.webp`;


    const {
        data,
    } =
        supabase.storage
            .from(
                "restaurant-images"
            )
            .getPublicUrl(
                coverPath
            );



    const customImage =
        await getImageDataUri(
            data.publicUrl
        );


    if (
        customImage
    ) {

        return customImage;

    }


    return getDefaultDailyMenuImageDataUri(
        menu.id
    );

}


/*
 * ============================================================
 * TEMA
 * ============================================================
 */

function getDailyMenuTheme(
    restaurant: Restaurant
): DailyMenuTheme {

    const restaurantWithTheme =
        restaurant as
        Restaurant & {
            dailyMenuImageTheme?:
            DailyMenuImageTheme;
        };


    const selectedTheme =
        restaurantWithTheme
            .dailyMenuImageTheme ??
        "green";


    return (
        DAILY_MENU_THEMES[
        selectedTheme
        ] ??
        DAILY_MENU_THEMES.green
    );

}


/*
 * ============================================================
 * GENERADOR PRINCIPAL
 * ============================================================
 */

export async function generateDailyMenuImage(
    restaurant: Restaurant,
    menu: DailyMenu
): Promise<string> {

    /*
     * Tema actual.
     */

    const theme =
        getDailyMenuTheme(
            restaurant
        );


    /*
     * Opciones del restaurante.
     */

    const options =
        await getDailyMenuOptions(
            menu.restaurantId
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


    /*
     * Agrupamos los componentes
     * reales seleccionados en el menú.
     */

    const grouped =
        new Map<
            DailyMenuSection,
            string[]
        >();


    for (
        const item
        of menu.items
    ) {

        const option =
            optionsById.get(
                item.optionId
            );


        if (
            !option
        ) {

            continue;

        }


        const list =
            grouped.get(
                item.section
            ) ??
            [];


        list.push(
            option.name
        );


        grouped.set(
            item.section,
            list
        );

    }


    /*
     * Tamaños disponibles.
     */

    const activeSizes =
        menu.sizes
            .filter(
                size =>
                    size.isAvailable
            )
            .sort(
                (
                    a,
                    b
                ) =>
                    a.sortOrder -
                    b.sortOrder
            );


    /*
     * Secciones con contenido.
     */

    const sections =
        SECTION_ORDER.filter(
            section =>
                (
                    grouped.get(
                        section
                    ) ??
                    []
                ).length > 0
        );


    /*
     * Recursos.
     */

    const [
        logoDataUri,
        photoDataUri,
    ] =
        await Promise.all([

            getImageDataUri(
                restaurant.logo
            ),

            getDailyMenuPhotoDataUri(
                restaurant.id,
                menu
            ),

        ]);


    /*
     * ========================================================
     * LIENZO
     * ========================================================
     */

    const width =
        1080;

    const height =
        1920;


    const outerMargin =
        34;

    const innerMargin =
        68;


    /*
     * ========================================================
     * CABECERA
     * ========================================================
     */

    const logoWidth =
        130;

    const logoHeight =
        84;


    const logoSvg =
        logoDataUri

            ? `

                <image
                    href="${escapeXml(
                logoDataUri
            )}"
                    x="${(
                width -
                logoWidth
            ) / 2}"
                    y="58"
                    width="${logoWidth}"
                    height="${logoHeight}"
                    preserveAspectRatio="xMidYMid meet"
                />

            `

            : `

                <circle
                    cx="${width / 2}"
                    cy="100"
                    r="42"
                    fill="${theme.primaryLight}"
                />

                <text
                    x="${width / 2}"
                    y="112"
                    text-anchor="middle"
                    font-size="27"
                    font-weight="900"
                    fill="${theme.primary}"
                >
                    P360
                </text>

            `;


    const restaurantName =
        restaurant.name.trim();


    const formattedDate =
        formatDate(
            menu.menuDate
        );


    /*
     * ========================================================
     * FOTO PRINCIPAL
     * ========================================================
     *
     * Ahora ocupa prácticamente todo
     * el ancho de la pieza.
     *
     * La foto es protagonista.
     *
     * ========================================================
     */

    const photoX =
        innerMargin;

    const photoY =
        330;

    const photoWidth =
        width -
        (
            innerMargin *
            2
        );

    const photoHeight =
        560;


    const photoRadius =
        34;


    const photoSvg =
        photoDataUri

            ? `

                <defs>

                    <clipPath
                        id="dailyMenuPhotoClip"
                    >

                        <rect
                            x="${photoX}"
                            y="${photoY}"
                            width="${photoWidth}"
                            height="${photoHeight}"
                            rx="${photoRadius}"
                        />

                    </clipPath>

                </defs>


                <rect
                    x="${photoX - 8}"
                    y="${photoY - 8}"
                    width="${photoWidth + 16}"
                    height="${photoHeight + 16}"
                    rx="${photoRadius + 8}"
                    fill="${theme.primaryLight}"
                />


                <image
                    href="${escapeXml(
                photoDataUri
            )}"
                    x="${photoX}"
                    y="${photoY}"
                    width="${photoWidth}"
                    height="${photoHeight}"
                    preserveAspectRatio="xMidYMid slice"
                    clip-path="url(#dailyMenuPhotoClip)"
                />


                <!-- Capa inferior -->

                <rect
                    x="${photoX}"
                    y="${photoY + photoHeight - 92}"
                    width="${photoWidth}"
                    height="92"
                    fill="#000000"
                    opacity="0.38"
                    clip-path="url(#dailyMenuPhotoClip)"
                />


                <text
                    x="${photoX + 30}"
                    y="${photoY + photoHeight - 53}"
                    font-size="25"
                    font-weight="900"
                    fill="#ffffff"
                >
                    MENÚ DEL DÍA
                </text>


                <text
                    x="${photoX + 30}"
                    y="${photoY + photoHeight - 22}"
                    font-size="17"
                    fill="#ffffff"
                >
                    ${escapeXml(
                restaurantName
            )}
                </text>

            `

            : `

                <rect
                    x="${photoX}"
                    y="${photoY}"
                    width="${photoWidth}"
                    height="${photoHeight}"
                    rx="${photoRadius}"
                    fill="${theme.primaryLight}"
                    stroke="${theme.border}"
                    stroke-width="3"
                />


                <text
                    x="${photoX + (
                photoWidth /
                2
            )}"
                    y="${photoY + (
                photoHeight /
                2
            ) - 12}"
                    text-anchor="middle"
                    font-size="32"
                    font-weight="900"
                    fill="${theme.primaryDark}"
                >
                    MENÚ DEL DÍA
                </text>


                <text
                    x="${photoX + (
                photoWidth /
                2
            )}"
                    y="${photoY + (
                photoHeight /
                2
            ) + 32}"
                    text-anchor="middle"
                    font-size="20"
                    fill="${theme.muted}"
                >
                    ${escapeXml(
                restaurantName
            )}
                </text>

            `;

    /*
* ============================================================
* COMPOSICIÓN VISUAL DEFINITIVA
* ============================================================
*
* Una sola composición SVG.
*
* Fondo verde
* Tarjeta crema
* Cabecera
* Fotografía
* Lo que incluye
* 2 columnas x 3 filas
* Precios dinámicos
* Decoración vegetal
* Footer Pedidos360
*
* La lógica de datos NO se modifica.
* ============================================================
*/

    const contentX =
        innerMargin;

    const contentWidth =
        width -
        (
            innerMargin *
            2
        );


    /*
     * ============================================================
     * PREPARACIÓN DE SECCIONES
     * ============================================================
     */

    const preparedSections =
        sections.map(
            section => {

                const names =
                    grouped.get(
                        section
                    ) ??
                    [];

                return {

                    section,

                    lines:
                        wrapText(
                            names.join(
                                " • "
                            ),
                            30
                        ),

                };

            }
        );


    /*
     * ============================================================
     * TARJETAS DE COMPONENTES
     * ============================================================
     */

    const cardGap =
        18;

    const cardWidth =
        (
            contentWidth -
            cardGap
        ) / 2;

    const cardHeight =
        140;

    const cardStartY =
        980;

    const cardRowGap =
        16;


    /*
     * ============================================================
     * COLORES
     * ============================================================
     */

    function getSectionColor(
        section: DailyMenuSection
    ): string {

        return section === "soup"
            ? "#16834b"
            : section === "seco"
                ? "#e56b22"
                : section === "principle"
                    ? "#d62839"
                    : section === "protein"
                        ? "#d99416"
                        : section === "drink"
                            ? "#2474bd"
                            : "#853cab";

    }


    function getSectionSymbol(
        section: DailyMenuSection
    ): string {

        return section === "soup"
            ? "S"
            : section === "seco"
                ? "C"
                : section === "principle"
                    ? "P"
                    : section === "protein"
                        ? "R"
                        : section === "drink"
                            ? "B"
                            : "P";

    }


    /*
     * ============================================================
     * TARJETAS
     * ============================================================
     */

    const sectionSvg =
        preparedSections
            .map(
                (
                    {
                        section,
                        lines,
                    },
                    index
                ) => {

                    const column =
                        index % 2;

                    const row =
                        Math.floor(
                            index / 2
                        );


                    const cardX =
                        contentX +
                        (
                            column *
                            (
                                cardWidth +
                                cardGap
                            )
                        );


                    const cardY =
                        cardStartY +
                        (
                            row *
                            (
                                cardHeight +
                                cardRowGap
                            )
                        );


                    const iconColor =
                        getSectionColor(
                            section
                        );


                    const iconSymbol =
                        getSectionSymbol(
                            section
                        );


                    const iconX =
                        cardX + 54;


                    const iconY =
                        cardY + 70;


                    const textX =
                        cardX + 108;


                    const titleY =
                        cardY + 43;


                    const bodyStartY =
                        cardY + 78;


                    const bodySvg =
                        lines
                            .slice(
                                0,
                                2
                            )
                            .map(
                                (
                                    line,
                                    lineIndex
                                ) => `

                                <text
                                    x="${textX}"
                                    y="${bodyStartY + (
                                        lineIndex *
                                        25
                                    )}"
                                    font-size="19"
                                    font-weight="600"
                                    fill="${theme.text}"
                                >
                                    ${escapeXml(
                                        line
                                    )}
                                </text>

                            `
                            )
                            .join("");


                    return `

                    <!-- TARJETA -->

                    <rect
                        x="${cardX}"
                        y="${cardY}"
                        width="${cardWidth}"
                        height="${cardHeight}"
                        rx="26"
                        fill="#fffdf5"
                        stroke="${theme.border}"
                        stroke-width="2"
                        filter="url(#dailyMenuShadow)"
                    />


                    <!-- Acento lateral -->

                    <rect
                        x="${cardX}"
                        y="${cardY}"
                        width="7"
                        height="${cardHeight}"
                        rx="3.5"
                        fill="${iconColor}"
                    />


                    <!-- Icono -->

                    <circle
                        cx="${iconX}"
                        cy="${iconY}"
                        r="39"
                        fill="${iconColor}"
                    />


                    <text
                        x="${iconX}"
                        y="${iconY + 10}"
                        text-anchor="middle"
                        font-size="27"
                        font-weight="900"
                        fill="#ffffff"
                    >
                        ${iconSymbol}
                    </text>


                    <!-- Título -->

                    <text
                        x="${textX}"
                        y="${titleY}"
                        font-size="25"
                        font-weight="900"
                        letter-spacing="0.3"
                        fill="${iconColor}"
                    >
                        ${escapeXml(
                        SECTION_LABELS[
                        section
                        ]
                    )}
                    </text>


                    <!-- Línea -->

                    <line
                        x1="${textX}"
                        y1="${cardY + 56}"
                        x2="${cardX + cardWidth - 25}"
                        y2="${cardY + 56}"
                        stroke="${iconColor}"
                        stroke-width="2"
                        opacity="0.22"
                    />


                    <!-- Componentes -->

                    ${bodySvg}

                `;

                }
            )
            .join("");


    /*
     * ============================================================
     * SVG COMPLETO
     * ============================================================
     */

    const svg = `

    <svg
        width="${width}"
        height="${height}"
        viewBox="0 0 ${width} ${height}"
        xmlns="http://www.w3.org/2000/svg"
    >

        <defs>

            <!-- Fondo verde -->

            <linearGradient
                id="dailyMenuBackground"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
            >

                <stop
                    offset="0%"
                    stop-color="${theme.primaryDark}"
                />

                <stop
                    offset="100%"
                    stop-color="${theme.primary}"
                />

            </linearGradient>


            <!-- Fondo crema -->

            <linearGradient
                id="dailyMenuCream"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
            >

                <stop
                    offset="0%"
                    stop-color="#fffdf5"
                />

                <stop
                    offset="100%"
                    stop-color="#f7f0dc"
                />

            </linearGradient>


            <!-- Sombra -->

            <filter
                id="dailyMenuShadow"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
            >

                <feDropShadow
                    dx="0"
                    dy="5"
                    stdDeviation="8"
                    flood-color="#000000"
                    flood-opacity="0.14"
                />

            </filter>


            <!-- Clip foto -->

            <clipPath
                id="dailyMenuPhotoClip"
            >

                <rect
                    x="${innerMargin}"
                    y="330"
                    width="${width - (innerMargin * 2)}"
                    height="560"
                    rx="34"
                />

            </clipPath>

        </defs>


        <!-- ==================================================
             FONDO VERDE
             ================================================== -->

        <rect
            width="${width}"
            height="${height}"
            fill="url(#dailyMenuBackground)"
        />


                <!-- ==================================================
             TARJETA PRINCIPAL CREMA
             ================================================== -->

        <rect
            x="${outerMargin}"
            y="${outerMargin}"
            width="${width - (outerMargin * 2)}"
            height="1715"
            rx="48"
            fill="url(#dailyMenuCream)"
            stroke="#ffffff"
            stroke-width="5"
            filter="url(#dailyMenuShadow)"
        />


        <!-- Borde verde interior -->

        <rect
            x="${outerMargin + 18}"
            y="${outerMargin + 18}"
            width="${width - ((outerMargin + 18) * 2)}"
            height="1679"
            rx="36"
            fill="none"
            stroke="${theme.primary}"
            stroke-width="3"
        />


        <!-- ==================================================
             FRANJA VERDE INFERIOR
             ================================================== -->

        <rect
            x="${outerMargin}"
            y="1748"
            width="${width - (outerMargin * 2)}"
            height="138"
            fill="${theme.primaryDark}"
        />

        <!-- ==================================================
             DECORACIÓN SUPERIOR
             ================================================== -->

        <path
            d="
                M 90 105
                C 125 72, 165 72, 198 104
            "
            fill="none"
            stroke="${theme.primary}"
            stroke-width="5"
            stroke-linecap="round"
        />


        <path
            d="
                M 882 104
                C 915 72, 955 72, 990 105
            "
            fill="none"
            stroke="${theme.primary}"
            stroke-width="5"
            stroke-linecap="round"
        />


        <!-- ==================================================
             CABECERA
             ================================================== -->

        ${logoSvg}


        <text
            x="${width / 2}"
            y="182"
            text-anchor="middle"
            font-size="29"
            font-weight="900"
            letter-spacing="0.6"
            fill="${theme.text}"
        >
            ${escapeXml(
        restaurantName
    )}
        </text>


        <text
            x="${width / 2}"
            y="244"
            text-anchor="middle"
            font-size="62"
            font-weight="900"
            letter-spacing="1.2"
            fill="${theme.primaryDark}"
        >
            MENÚ DEL DÍA
        </text>


        <!-- Fecha -->

        <rect
            x="${width / 2 - 190}"
            y="270"
            width="380"
            height="54"
            rx="27"
            fill="${theme.primaryDark}"
        />


        <text
            x="${width / 2}"
            y="305"
            text-anchor="middle"
            font-size="22"
            font-weight="800"
            fill="#ffffff"
        >
            ${escapeXml(
        formattedDate
    )}
        </text>


        <!-- ==================================================
             FOTO
             ================================================== -->

        ${photoSvg}


        <!-- ==================================================
             LO QUE INCLUYE
             ================================================== -->

        <line
            x1="${innerMargin}"
            y1="930"
            x2="${width - innerMargin}"
            y2="930"
            stroke="${theme.primary}"
            stroke-width="3"
        />


        <rect
            x="${width / 2 - 235}"
            y="899"
            width="470"
            height="64"
            rx="32"
            fill="${theme.primaryDark}"
            stroke="#fffdf5"
            stroke-width="7"
        />


        <text
            x="${width / 2}"
            y="941"
            text-anchor="middle"
            font-size="29"
            font-weight="900"
            letter-spacing="0.8"
            fill="#ffffff"
        >
            LO QUE INCLUYE
        </text>


        <!-- ==================================================
             DETALLES LATERALES
             ================================================== -->

        <circle
            cx="${width / 2 - 266}"
            cy="931"
            r="7"
            fill="${theme.primaryDark}"
        />

        <circle
            cx="${width / 2 + 266}"
            cy="931"
            r="7"
            fill="${theme.primaryDark}"
        />


        <!-- ==================================================
             SEIS COMPONENTES
             ================================================== -->

        ${sectionSvg}


        <!-- ==================================================
             PRECIOS
             ================================================== -->

        <line
            x1="${innerMargin}"
            y1="1470"
            x2="${width - innerMargin}"
            y2="1470"
            stroke="${theme.primary}"
            stroke-width="3"
        />


        <rect
            x="${width / 2 - 180}"
            y="1440"
            width="360"
            height="64"
            rx="32"
            fill="${theme.primaryDark}"
            stroke="#fffdf5"
            stroke-width="7"
        />


        <text
            x="${width / 2}"
            y="1482"
            text-anchor="middle"
            font-size="29"
            font-weight="900"
            letter-spacing="1"
            fill="#ffffff"
        >
            PRECIOS
        </text>


        <!-- ==================================================
             PANEL DE PRECIOS
             ================================================== -->

        <rect
            x="${contentX}"
            y="1520"
            width="${contentWidth}"
            height="250"
            rx="34"
            fill="#fffdf5"
            stroke="${theme.border}"
            stroke-width="3"
            filter="url(#dailyMenuShadow)"
        />


        <!-- Decoración superior -->

        <circle
            cx="${contentX + 35}"
            cy="1555"
            r="7"
            fill="${theme.primary}"
        />

        <line
            x1="${contentX + 55}"
            y1="1555"
            x2="${width / 2 - 80}"
            y2="1555"
            stroke="${theme.border}"
            stroke-width="2"
        />


        <line
            x1="${width / 2 + 80}"
            y1="1555"
            x2="${contentX + contentWidth - 55}"
            y2="1555"
            stroke="${theme.border}"
            stroke-width="2"
        />

        <circle
            cx="${contentX + contentWidth - 35}"
            cy="1555"
            r="7"
            fill="${theme.primary}"
        />


        ${activeSizes.length > 0
            ? activeSizes
                .map(
                    (
                        size,
                        index
                    ) => {

                        const columnWidth =
                            contentWidth /
                            activeSizes.length;


                        const centerX =
                            contentX +
                            (
                                index *
                                columnWidth
                            ) +
                            (
                                columnWidth /
                                2
                            );


                        const dividerX =
                            contentX +
                            (
                                index *
                                columnWidth
                            );


                        return `

                                ${index > 0
                                ? `

                                            <line
                                                x1="${dividerX}"
                                                y1="1585"
                                                x2="${dividerX}"
                                                y2="1725"
                                                stroke="${theme.border}"
                                                stroke-width="3"
                                                stroke-dasharray="4 8"
                                            />

                                        `
                                : ""
                            }


                                <text
                                    x="${centerX}"
                                    y="1615"
                                    text-anchor="middle"
                                    font-size="25"
                                    font-weight="900"
                                    fill="${theme.text}"
                                >
                                    ${escapeXml(
                                size.label
                            )}
                                </text>


                                <rect
                                    x="${centerX - 70}"
                                    y="1635"
                                    width="140"
                                    height="6"
                                    rx="3"
                                    fill="${theme.primary}"
                                    opacity="0.25"
                                />


                                <text
                                    x="${centerX}"
                                    y="1708"
                                    text-anchor="middle"
                                    font-size="43"
                                    font-weight="900"
                                    fill="${theme.primaryDark}"
                                >
                                    $${Number(
                                size.price
                            ).toLocaleString(
                                "es-CO"
                            )}
                                </text>

                            `;

                    }
                )
                .join("")
            : ""
        }


                <!-- ==================================================
             DECORACIÓN VEGETAL INFERIOR
             ================================================== -->

        <!-- Planta izquierda -->

        <g>

            <path
                d="
                    M 20 1915
                    C 48 1860, 85 1810, 145 1760
                "
                fill="none"
                stroke="#0b4f2a"
                stroke-width="9"
                stroke-linecap="round"
            />


            <ellipse
                cx="45"
                cy="1875"
                rx="24"
                ry="62"
                fill="${theme.primary}"
                transform="rotate(-42 45 1875)"
            />


            <ellipse
                cx="75"
                cy="1835"
                rx="25"
                ry="68"
                fill="${theme.primaryDark}"
                transform="rotate(-55 75 1835)"
            />


            <ellipse
                cx="110"
                cy="1800"
                rx="24"
                ry="65"
                fill="${theme.primary}"
                transform="rotate(-62 110 1800)"
            />


            <ellipse
                cx="145"
                cy="1775"
                rx="21"
                ry="58"
                fill="${theme.primaryDark}"
                transform="rotate(-70 145 1775)"
            />

        </g>


        <!-- Planta derecha -->

        <g>

            <path
                d="
                    M 1060 1915
                    C 1032 1860, 995 1810, 935 1760
                "
                fill="none"
                stroke="#0b4f2a"
                stroke-width="9"
                stroke-linecap="round"
            />


            <ellipse
                cx="1035"
                cy="1875"
                rx="24"
                ry="62"
                fill="${theme.primary}"
                transform="rotate(42 1035 1875)"
            />


            <ellipse
                cx="1005"
                cy="1835"
                rx="25"
                ry="68"
                fill="${theme.primaryDark}"
                transform="rotate(55 1005 1835)"
            />


            <ellipse
                cx="970"
                cy="1800"
                rx="24"
                ry="65"
                fill="${theme.primary}"
                transform="rotate(62 970 1800)"
            />


            <ellipse
                cx="935"
                cy="1775"
                rx="21"
                ry="58"
                fill="${theme.primaryDark}"
                transform="rotate(70 935 1775)"
            />

        </g>


                <!-- ==================================================
             FOOTER PEDIDOS360
             ================================================== -->

        <rect
            x="${width / 2 - 210}"
            y="1788"
            width="420"
            height="96"
            rx="34"
            fill="#06391d"
            stroke="#fffdf5"
            stroke-width="4"
        />


        <text
            x="${width / 2}"
            y="1822"
            text-anchor="middle"
            font-size="18"
            font-weight="600"
            fill="#ffffff"
        >
            Creado con
        </text>


        <text
            x="${width / 2}"
            y="1862"
            text-anchor="middle"
            font-size="31"
            font-weight="900"
            fill="#ffffff"
        >
            Pedidos360
        </text>


    </svg>

`;



    /*
     * ========================================================
     * WEBP
     * ========================================================
     */

    const imageBuffer =
        await sharp(
            Buffer.from(
                svg
            )
        )
            .resize(
                width,
                height
            )
            .webp({
                quality:
                    88,
            })
            .toBuffer();


    const file =
        new File(
            [
                new Uint8Array(
                    imageBuffer
                ),
            ],
            "daily-menu.webp",
            {
                type:
                    "image/webp",
            }
        );


    /*
     * ========================================================
     * STORAGE
     * ========================================================
     *
     * Conservamos exactamente
     * la ruta que ya utiliza
     * el sistema.
     * ========================================================
     */

    const storagePath =
        `restaurants/${restaurant.id}/daily-menu/${menu.id}.webp`;


    return uploadImage(
        file,
        storagePath
    );

}