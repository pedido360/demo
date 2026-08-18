const CATEGORY_EMOJIS: Record<string, string> = {
    // 🍔 Comida rápida
    hamburguesa: "🍔",
    hamburguesas: "🍔",

    pizza: "🍕",
    pizzas: "🍕",

    perro: "🌭",
    perros: "🌭",
    "hot dog": "🌭",
    "hot dogs": "🌭",

    sandwich: "🥪",
    sandwiches: "🥪",

    wrap: "🌯",
    wraps: "🌯",

    taco: "🌮",
    tacos: "🌮",

    burrito: "🌯",
    burritos: "🌯",

    // 🍗 Carnes y platos fuertes
    pollo: "🍗",
    pollos: "🍗",

    carne: "🥩",
    carnes: "🥩",

    parrilla: "🔥",
    parrillada: "🔥",
    parrilladas: "🔥",

    costilla: "🍖",
    costillas: "🍖",

    pescado: "🐟",
    pescados: "🐟",

    marisco: "🦐",
    mariscos: "🦐",

    // 🍚 Arroces y comida oriental
    arroz: "🍚",
    arroces: "🍚",

    sushi: "🍣",

    oriental: "🥢",
    orientales: "🥢",

    asiatico: "🥢",
    asiaticos: "🥢",

    // 🍝 Pastas
    pasta: "🍝",
    pastas: "🍝",

    lasana: "🍝",
    lasanas: "🍝",

    // 🥗 Ensaladas y acompañamientos
    ensalada: "🥗",
    ensaladas: "🥗",

    papa: "🍟",
    papas: "🍟",

    acompanamiento: "🍟",
    acompanamientos: "🍟",

    entrada: "🥗",
    entradas: "🥗",

    // 🫓 Comida colombiana / latinoamericana
    arepa: "🫓",
    arepas: "🫓",

    empanada: "🥟",
    empanadas: "🥟",

    tamal: "🫔",
    tamales: "🫔",

    // 🍳 Desayunos
    desayuno: "🍳",
    desayunos: "🍳",

    brunch: "🍳",

    // 🥖 Panadería
    pan: "🥖",
    panes: "🥖",

    panaderia: "🥖",

    bakery: "🥖",

    // 🍰 Postres
    postre: "🍰",
    postres: "🍰",

    torta: "🍰",
    tortas: "🍰",

    pastel: "🍰",
    pasteles: "🍰",

    helado: "🍦",
    helados: "🍦",

    // ☕ Cafetería
    cafe: "☕",
    cafes: "☕",

    capuchino: "☕",
    capuchinos: "☕",

    // 🥤 Bebidas
    bebida: "🥤",
    bebidas: "🥤",

    gaseosa: "🥤",
    gaseosas: "🥤",

    refresco: "🥤",
    refrescos: "🥤",

    jugo: "🧃",
    jugos: "🧃",

    limonada: "🍋",
    limonadas: "🍋",

    cerveza: "🍺",
    cervezas: "🍺",

    vino: "🍷",
    vinos: "🍷",

    // 🎁 Combos y promociones
    combo: "🍱",
    combos: "🍱",

    promocion: "⭐",
    promociones: "⭐",

    promo: "⭐",
    promos: "⭐",

    especial: "✨",
    especiales: "✨",

    // 🍽️ Categorías generales
    plato: "🍽️",
    platos: "🍽️",

    menu: "🍽️",
    menus: "🍽️",

    almuerzo: "🍛",
    almuerzos: "🍛",

    cena: "🍽️",
    cenas: "🍽️",
};

function normalize(text: string): string {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

export function getCategoryEmoji(name: string): string {
    const value = normalize(name);

    for (const keyword of Object.keys(CATEGORY_EMOJIS)) {
        if (value.includes(keyword)) {
            return CATEGORY_EMOJIS[keyword];
        }
    }

    return "🍽️";
}