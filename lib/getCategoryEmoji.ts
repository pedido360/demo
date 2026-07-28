const CATEGORY_EMOJIS: Record<string, string> = {
    hamburguesa: "🍔",
    hamburguesas: "🍔",

    pizza: "🍕",
    pizzas: "🍕",

    perro: "🌭",
    perros: "🌭",
    "hot dog": "🌭",
    "hot dogs": "🌭",

    bebida: "🥤",
    bebidas: "🥤",
    gaseosa: "🥤",
    gaseosas: "🥤",
    refresco: "🥤",
    refrescos: "🥤",

    jugo: "🧃",
    jugos: "🧃",

    papa: "🍟",
    papas: "🍟",
    acompanamiento: "🍟",
    acompanamientos: "🍟",

    pollo: "🍗",
    pollos: "🍗",

    carne: "🥩",
    carnes: "🥩",

    sushi: "🍣",

    taco: "🌮",
    tacos: "🌮",

    burrito: "🌯",
    burritos: "🌯",

    ensalada: "🥗",
    ensaladas: "🥗",

    postre: "🍰",
    postres: "🍰",

    helado: "🍦",
    helados: "🍦",

    cafe: "☕",
    cafes: "☕",

    desayuno: "🍳",
    desayunos: "🍳",

    pasta: "🍝",
    pastas: "🍝",

    pescado: "🐟",
    pescados: "🐟",

    marisco: "🦐",
    mariscos: "🦐",

    empanada: "🥟",
    empanadas: "🥟",

    arepa: "🫓",
    arepas: "🫓",

    pan: "🥖",
    panaderia: "🥖",

    parrilla: "🔥",

    combo: "🎁",
    combos: "🎁",

    promocion: "⭐",
    promociones: "⭐",
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