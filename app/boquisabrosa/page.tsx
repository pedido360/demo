"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { recordGuideMetric } from "@/lib/repositories/guide-metrics.repository";

const demoFoodGallery = [
  "/images/products/burrito.jpg",
  "/images/products/hamburger.jpg",
  "/images/products/meat.jpg",
  "/images/products/fries.jpg",
  "/images/products/hotdog.jpg",
];

const places: Array<{
  number: string;
  name: string;
  type: string;
  schedule: string;
  address: string;
  phone: string;
  description: string;
  featured?: boolean;
  instagram?: string;
  facebook?: string;
  pedidosUrl?: string;
  whatsapp?: string;
  image?: string;
  gallery?: string[];
  videoUrl?: string;
  videoCover?: string;
  categories?: string[];
}> = [
  {
    number: "01",
    name: "Donde Las Monas",
    type: "Restaurante",
    schedule: "Lunes y festivos · 7 A.M. - 11 A.M.",
    address: "Entrada al barrio Torres del Castillo",
    phone: "317 275 0131",
    description: "Pata de Res, Asadura o Chanfaina, Pichón, Bollos, Picos, Venas y Arepa santandereana.",
    featured: true,
    categories: ["Típicos santandereanos", "Carnes y parrilla", "Desayunos", "Piquetes y comida tradicional"],
  },
  {
    number: "02",
    name: "Restaurante El Negro",
    type: "Restaurante",
    schedule: "Lunes a Domingo · 6 A.M. - 4 P.M.",
    address: "Carrera 11 No. 13 - 25, casa de mercado",
    phone: "724 058 / 317 376 1437",
    description: "Frijoles con Pezuña, Cazuela, Cola de Res Sudada, Sobrebarriga, Lengua en Salsa, Pata de Res, Sancocho, Pollo Criollo y más.",
    featured: true,
    categories: ["Típicos santandereanos", "Carnes y parrilla", "Desayunos", "Piquetes y comida tradicional"],
  },
  {
    number: "03",
    name: "Dinamita Restaurante",
    image: "/guia/dinamita.jpg",
    type: "Restaurante",
    schedule: "Todos los días · 6 A.M. - 11 P.M.",
    address: "Carrera 5 No. 6A - 04",
    phone: "314 488 7575",
    description: "Calentado Paisa, Chanfaina, Chunchulla, Ternero Sudado, Tripa Dimensión y más.",
    featured: true,
    categories: ["Típicos santandereanos", "Carnes y parrilla", "Desayunos", "Piquetes y comida tradicional"],
  },
  {
    number: "04",
    name: "Restaurante Ganadero",
    type: "Restaurante",
    schedule: "Todos los días · 7 A.M. - 4 P.M.",
    address: "Calle 13 No. 11 - 27, frente a la pesa",
    phone: "724 6005",
    description: "Carne Asada, Sobrebarriga, Cabro, Pepitoria, Gallina, Pollo, Lomo de Cerdo y más.",
    featured: true,
    categories: ["Típicos santandereanos", "Carnes y parrilla", "Desayunos", "Piquetes y comida tradicional"],
  },
  {
    number: "05",
    name: "Bocaditos Anita",
    type: "Restaurante",
    schedule: "24 horas",
    address: "San Gil",
    phone: "Consultar guía",
    description: "Especialidades de la gastronomía local.",
    categories: ["Típicos santandereanos", "Carnes y parrilla", "Desayunos", "Piquetes y comida tradicional"],
  },
  {
    number: "06",
    name: "Frutas y Verduras Los Gigantes",
    type: "Restaurante",
    schedule: "Todos los días · 5 A.M. - 4 P.M.",
    address: "Interior casa de mercado, puesto 86",
    phone: "311 50 1766 / 310 789 9404",
    description: "Domicilios gratis. Atendido por sus propietarios Manuel Bernal y Olinda Cuervo.",
    categories: ["Frutas y verduras"],
  },
  {
    number: "07",
    name: "Balneario Pozo Azul",
    type: "Turismo",
    categories: ["Experiencias y turismo"],
    schedule: "Todos los días · 8 A.M. en adelante",
    address: "Km 2 vía San Gil - Barichara",
    phone: "312 303 0643",
    description: "Balneario, bebidas en general y restaurante los fines de semana.",
  },
  {
    number: "08",
    name: "El Zaguán Cafetería",
    image: "/guia/zaguan.webp",
    type: "Cafetería",
    schedule: "Todos los días · 7 A.M. - 12:30 P.M.",
    address: "Calle 13 No. 10 - 35",
    phone: "724 2173",
    description: "Arepas rellenas, pollo, carne desmechada, salchicha, mixta y especial. Además panadería, chorizos, empanadas, avena y bebidas.",
    categories: ["Café y panadería", "Comidas rápidas", "Desayunos"],
  },
  {
    number: "09",
    name: "Megalesa",
    image: "/guia/megalesa.webp",
    type: "Restaurante",
    schedule: "24 horas",
    address: "San Gil",
    phone: "Consultar guía",
    description: "Hamburguesas, picadas y diferentes opciones para compartir.",
    categories: ["Comidas rápidas"],
  },
  {
    number: "10",
    name: "Piqueteadero Doña Bárbara",
    type: "Restaurante",
    categories: ["Piquetes y comida tradicional", "Típicos santandereanos"],
    schedule: "Todos los días · 11 A.M. - 10 P.M.",
    address: "San Gil",
    phone: "Consultar guía",
    description: "Piquetes y sabores tradicionales.",
  },
  {
    number: "11",
    name: "Hotel Terrazas de la Candelaria",
    type: "Hotel",
    categories: ["Experiencias y turismo"],
    schedule: "Todos los días · 8 A.M. - 10 P.M.",
    address: "San Gil",
    phone: "Consultar guía",
    description: "Hospedaje y experiencia para visitantes de San Gil.",
  },
  {
    number: "12",
    name: "Típicos Lina",
    type: "Restaurante",
    schedule: "Todos los días · 10 A.M. - 5 P.M.",
    address: "Cl. 4 #3-69, Pinchote, Santander",
    phone: "316 4611891",
    description: "Comida típica santandereana.",
    categories: ["Típicos santandereanos", "Carnes y parrilla", "Desayunos", "Piquetes y comida tradicional"],
    instagram: "https://www.instagram.com/tipicoslina/",
    facebook: "https://www.facebook.com/profile.php?id=100089145213642",
    pedidosUrl: "https://tipicos-lina.pedidos360.shop",
    whatsapp: "573164611891",
    image: "/tipicoslina.png",
  },
];

function shufflePlaces(items: typeof places) {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const isClosed = (place: (typeof places)[number]) => {
    if (place.schedule === "24 horas") {
      return false;
    }

    if (place.schedule === "Consultar guía") {
      return true;
    }

    const now = new Date();

    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Bogota",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(now);

    const weekday = parts.find((part) => part.type === "weekday")?.value ?? "";
    const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
    const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
    const currentMinutes = hour * 60 + minute;

    const dayMap: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };

    const day = dayMap[weekday];

    if (place.schedule.startsWith("Lunes y festivos") && day !== 1) {
      return true;
    }

    const timeMatch = place.schedule.match(
      /(\d+)\s*A\.M\.\s*-\s*(\d+)\s*(A\.M\.|P\.M\.)/i
    );

    if (!timeMatch) {
      return true;
    }

    const openHour = Number(timeMatch[1]);
    const closeHour = Number(timeMatch[2]);
    const closePeriod = timeMatch[3].toUpperCase();

    const openMinutes = openHour * 60;
    const closeMinutes =
      (closePeriod === "P.M." && closeHour !== 12
        ? closeHour + 12
        : closeHour) * 60;

    return currentMinutes < openMinutes || currentMinutes > closeMinutes;
  };

  return shuffled.sort((a, b) => Number(isClosed(a)) - Number(isClosed(b)));
}

const filters = [
  "Todos los sabores",
  "Típicos santandereanos",
  "Carnes y parrilla",
  "Comidas rápidas",
  "Desayunos",
  "Café y panadería",
  "Piquetes y comida tradicional",
  "Frutas y verduras",
  "Experiencias y turismo",
];

function getPlaceStatus(schedule: string) {
  if (schedule === "24 horas") {
    return {
      label: "Abierto 24 horas",
      className: "bg-green-100 text-green-700",
    };
  }

  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "";
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  const currentMinutes = hour * 60 + minute;

  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const day = dayMap[weekday];

  let matchesDay = schedule.startsWith("Todos los días");

  if (schedule.startsWith("Lunes y festivos")) {
    matchesDay = day === 1;
  }

  if (schedule.startsWith("Lunes a Domingo")) {
    matchesDay = true;
  }

  if (!matchesDay) {
    return {
      label: "Cerrado ahora",
      className: "bg-red-100 text-red-700",
    };
  }

  const timeMatch = schedule.match(/(\d+)\s*A\.M\.\s*-\s*(\d+)\s*(A\.M\.|P\.M\.)/i);

  if (!timeMatch) {
    if (/en adelante/i.test(schedule)) {
      const openMatch = schedule.match(/(\d+)\s*A\.M\./i);
      const openHour = Number(openMatch?.[1] ?? 0);

      return currentMinutes >= openHour * 60
        ? {
            label: "Abierto ahora",
            className: "bg-green-100 text-green-700",
          }
        : {
            label: "Cerrado ahora",
            className: "bg-red-100 text-red-700",
          };
    }

    return {
      label: "Horario no disponible",
      className: "bg-gray-100 text-gray-600",
    };
  }

  const openHour = Number(timeMatch[1]);
  const closeHour = Number(timeMatch[2]);
  const closePeriod = timeMatch[3].toUpperCase();

  const openMinutes = openHour * 60;
  const closeMinutes =
    (closePeriod === "P.M." && closeHour !== 12
      ? closeHour + 12
      : closeHour) * 60;

  const isOpen =
    currentMinutes >= openMinutes &&
    currentMinutes <= closeMinutes;

  return isOpen
    ? {
        label: "Abierto ahora",
        className: "bg-green-100 text-green-700",
      }
    : {
        label: "Cerrado ahora",
        className: "bg-red-100 text-red-700",
      };
}

export default function BoquisabrosaPage() {
  const [shuffledPlaces, setShuffledPlaces] = useState(places);
  const [promoPosition, setPromoPosition] = useState<number | null>(null);
  const [openPlace, setOpenPlace] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("Todos los sabores");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPlaces = shuffledPlaces.filter((place) => {
    const matchesCategory =
      activeFilter === "Todos los sabores" ||
      place.categories?.includes(activeFilter);

    const term = searchTerm.trim().toLowerCase();

    const matchesSearch =
      term === "" ||
      place.name.toLowerCase().includes(term) ||
      place.description.toLowerCase().includes(term) ||
      place.type.toLowerCase().includes(term);

    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    setShuffledPlaces(shufflePlaces(places));
    setPromoPosition(Math.floor(Math.random() * (places.length + 1)));
    void recordGuideMetric("guide_view");
  }, []);

  return (
    <main className="min-h-screen bg-[#fff9e8] pb-24 text-[#25170b]">
      <section className="relative isolate overflow-hidden bg-[#17120d]">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-cover bg-[center_58%] sm:bg-center"
          style={{ backgroundImage: "url('/guia/portadaok.png')" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-b from-black/75 via-black/45 to-black/90 sm:bg-gradient-to-r sm:from-black/75 sm:via-black/45 sm:to-black/65"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,#f6c51535,transparent_55%)]"
        />

        <div className="relative mx-auto flex min-h-[760px] max-w-7xl flex-col px-5 pb-10 pt-5 sm:min-h-[720px] sm:px-8 sm:pb-12 sm:pt-7 lg:min-h-[780px]">
          <header className="flex justify-center text-white">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-white/75 sm:text-xs">
                  Presenta
                </span>
                <span className="text-sm font-black tracking-wide sm:text-base">
                  El Sibari
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <a
                  href="https://www.facebook.com/yosoyelsibarita/?locale=es_LA"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook de El Sibari"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-white/25 bg-white/15 text-xs font-black text-white shadow-md backdrop-blur transition hover:scale-110 hover:bg-[#1877F2] sm:h-8 sm:w-8"
                >
                  f
                </a>
                <a
                  href="https://www.instagram.com/elsibaris/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram de El Sibari"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-white/25 bg-white/15 text-sm font-black text-white shadow-md backdrop-blur transition hover:scale-110 hover:bg-[#C13584] sm:h-8 sm:w-8"
                >
                  ◎
                </a>
              </div>
            </div>
          </header>

          <div className="mt-3 flex justify-center">
            <a
              href="/boquisabrosa/propuesta"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/20 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur transition duration-200 hover:border-[#e63946] hover:bg-[#e63946] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#e63946]/70 sm:text-[10px]"
            >
              ¿Qué es la Guía Boquisabrosa?
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center py-10 text-center sm:py-16 lg:py-20">
            <Image
              src="/guia/logo-boquisabrosa-transparente.png"
              alt="Logo oficial de la Ruta Boquisabrosa"
              width={420}
              height={420}
              priority
              className="mb-4 h-auto w-28 drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] sm:mb-5 sm:w-36"
            />

            <p className="rounded-full border border-[#f6c515]/60 bg-black/35 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#ffe16b] shadow-lg backdrop-blur sm:text-xs">
              Ruta gastronómica
            </p>

            <h1 className="mt-6 max-w-4xl text-4xl font-black uppercase leading-[0.98] tracking-tight text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.65)] sm:text-6xl lg:text-7xl">
              La guía más
              <span className="mt-2 block text-[#f6c515]">
                “arrecha”
              </span>
            </h1>

            <p className="mt-5 text-xl font-black uppercase tracking-[0.08em] text-white drop-shadow-lg sm:mt-6 sm:text-3xl lg:text-4xl">
              Ruta Boquisabrosa
            </p>

            <p className="mt-5 max-w-2xl text-base font-bold leading-7 text-white drop-shadow-md sm:text-xl sm:leading-8">
              Sabores que cuentan historias. Lugares que merecen ser descubiertos.
            </p>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/90 drop-shadow-md sm:text-base sm:leading-7 lg:text-lg">
              Una ruta gastronómica que conecta establecimientos, visitantes y
              experiencias, con presencia web 24/7 y contenido promocional para
              darle visibilidad a los sabores de nuestra tierra.
            </p>

            <a
              href="#explorar"
              className="mt-8 inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-white/20 bg-[#e63946] px-7 py-3 text-xs font-black uppercase tracking-[0.12em] text-white shadow-[0_12px_35px_rgba(230,57,70,0.4)] transition duration-200 hover:-translate-y-1 hover:border-[#f6c515] hover:bg-[#f6c515] hover:text-black focus:outline-none focus:ring-4 focus:ring-[#f6c515]/70 sm:px-9 sm:text-sm"
            >
              Explorar la guía
              <span aria-hidden="true" className="text-lg">↓</span>
            </a>

            <p className="mt-5 max-w-full text-[9px] font-black uppercase tracking-[0.12em] text-[#ffe16b] drop-shadow sm:text-xs sm:tracking-[0.2em]">
              Gastronomía · Turismo · Cultura · Nuestra gente
            </p>
          </div>

          <div className="border-t border-white/25 pt-5 text-center">
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/75">
              Patrocinador principal
            </div>
            <a
              href="https://pedidos360.shop"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center rounded-lg px-3 py-1 text-lg font-black text-white transition hover:bg-white/10 sm:text-xl"
              aria-label="Visitar Pedidos360"
            >
              Pedidos<span className="text-[#f6c515]">360</span>
              <span aria-hidden="true" className="ml-2 text-sm text-white/70">↗</span>
            </a>
          </div>
        </div>
      </section>

      <section id="explorar" className="mx-auto max-w-6xl px-5 pt-10 sm:px-8">
        <div className="sticky top-0 z-30 -mx-5 bg-[#fff9e8]/95 px-5 pb-4 pt-2 backdrop-blur-md sm:static sm:mx-0 sm:px-0">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d52f3c]">
              Explora San Gil
            </p>
            <h2 className="mt-1 text-3xl font-black tracking-tight">
              ¿Qué estás buscando?
            </h2>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-black/5 bg-white px-4 py-3 shadow-sm">
            <span className="text-lg">⌕</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setOpenPlace(null);
              }}
              placeholder="Busca un restaurante, café o sabor..."
              aria-label="Buscar en la Guía Boquisabrosa"
              className="min-w-0 flex-1 bg-transparent text-sm text-[#25170b] outline-none placeholder:text-black/40"
            />
          </div>

          <div className="mt-3 flex items-center justify-between px-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-black/45 sm:text-[10px]">
              Explora las categorías
            </span>
            <span className="flex items-center gap-1 text-[9px] font-bold text-[#b78b00] sm:text-[10px]">
              Desliza para ver más
              <span aria-hidden="true" className="text-sm">→</span>
            </span>
          </div>

          <div className="relative -mx-1">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-2 right-0 top-0 z-10 w-8 bg-gradient-to-l from-[#fff9e8] to-transparent"
            />
            <div className="no-scrollbar flex touch-pan-x gap-2 overflow-x-auto px-1 pb-2">
              {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  setActiveFilter(filter);
                  setOpenPlace(null);
                }}
                className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-black ${
                  activeFilter === filter
                    ? "bg-[#e63946] text-white"
                    : "bg-white text-black/65 shadow-sm"
                }`}
              >
                {filter}
              </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-9">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#b78b00]">
                Selección inicial
              </p>
              <h2 className="mt-1 text-2xl font-black">Lugares de la guía</h2>
            </div>

            <span className="rounded-full bg-[#f6c515] px-3 py-1.5 text-[10px] font-black">
              {filteredPlaces.length} {filteredPlaces.length === 1 ? "lugar" : "lugares"}
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPlaces.map((place, index) => (
              <div key={place.number} className="contents">
                {activeFilter === "Todos los sabores" &&
                searchTerm.trim() === "" &&
                promoPosition === index ? (
                  <article className="group overflow-hidden rounded-[1.7rem] border border-[#f6c515]/40 bg-white shadow-[0_12px_40px_rgba(37,23,11,0.09)] transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#eee5c9]">
                      <Image
                        src="/guia/espacio-disponible-boquisabrosa.png"
                        alt="Espacio disponible en la Guía Boquisabrosa"
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover object-center transition duration-500 group-hover:scale-105"
                      />
                    </div>

                    <div className="p-5">
                      <span className="inline-flex rounded-full bg-[#f6c515] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-[#25170b]">
                        Espacio disponible
                      </span>

                      <h3 className="mt-3 text-xl font-black leading-tight">
                        ¿Tu negocio también hace parte de esta ruta?
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-black/60">
                        Haz parte de la Guía Boquisabrosa y presenta tu negocio
                        gastronómico a quienes buscan dónde comer en San Gil.
                      </p>

                      <a
                        href={`https://wa.me/573180972943?text=${encodeURIComponent(
                          "Hola, quiero información para hacer parte de la Guía Boquisabrosa."
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 block w-full rounded-xl bg-[#25D366] px-4 py-3 text-center text-xs font-black uppercase tracking-wider text-white transition hover:brightness-95"
                      >
                        💬 Solicita información
                      </a>
                    </div>
                  </article>
                ) : null}

                <article
                  className="group overflow-hidden rounded-[1.7rem] border border-black/5 bg-white shadow-[0_12px_40px_rgba(37,23,11,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                <div className="relative aspect-[16/10] overflow-hidden bg-[#eee5c9]">
                  <Image
                    src={place.image ?? "/GuiaBoquisabrosa.jpeg"}
                    alt={place.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center opacity-90 transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  <div className="absolute left-4 top-4 rounded-full bg-[#f6c515] px-3 py-1.5 text-[10px] font-black">
                    #{place.number}
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider">
                      {place.type}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-black leading-tight">
                    {place.name}
                  </h3>

                  <div className="mt-3">
                    {(() => {
                      const status = getPlaceStatus(place.schedule);

                      return (
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wide ${status.className}`}
                        >
                          {status.label}
                        </span>
                      );
                    })()}
                  </div>

                  <p className="mt-3 text-sm leading-6 text-black/60">
                    {place.description}
                  </p>

                  {place.whatsapp ? (
                    <a
                      href={`https://wa.me/${place.whatsapp}?text=${encodeURIComponent(
                        "Hola, vengo de la Guía Boquisabrosa."
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 block w-full rounded-xl bg-[#25D366] px-4 py-3 text-center text-xs font-black uppercase tracking-wider text-white transition hover:brightness-95"
                    >
                      💬 WhatsApp
                    </a>
                  ) : null}

                  <details
                    open={openPlace === place.number}
                    onClick={(event) => {
                      if (
                        event.target instanceof HTMLElement &&
                        event.target.closest("summary")
                      ) {
                        event.preventDefault();

                        const willOpen =
                          openPlace !== place.number;

                        setOpenPlace((current) =>
                          current === place.number ? null : place.number
                        );

                        if (willOpen) {
                          void recordGuideMetric(
                            "restaurant_view",
                            place.name
                          );
                        }
                      }
                    }}
                    className="mt-4 overflow-hidden rounded-2xl bg-[#fff9e8]"
                  >
                    <summary className="cursor-pointer list-none px-4 py-3 text-xs font-black uppercase tracking-wider text-[#25170b]">
                      <span className="flex items-center justify-between">
                        Ver información del lugar
                        <span className="text-base">＋</span>
                      </span>
                    </summary>

                    <div className="space-y-3 border-t border-black/5 px-4 pb-4 pt-3 text-xs text-black/60">
                      <section className="mb-5" aria-label={`Galería de comida de ${place.name}`}>
                        <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-[#25170b]">
                          Conócenos y ven a disfrutar
                        </h4>
                        <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2">
                          {(place.gallery ?? demoFoodGallery).slice(0, 5).map((photo, index) => (
                            <div
                              key={`${place.number}-galeria-${index}`}
                              className="relative aspect-square shrink-0 snap-start overflow-hidden rounded-xl bg-[#eee5c9]"
                              style={{ flex: "0 0 calc((100% - 1rem) / 3)" }}
                            >
                              <Image
                                src={photo}
                                alt={`Imagen de muestra de comida ${index + 1} para ${place.name}`}
                                fill
                                sizes="33vw"
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </section>

                      <p>
                        <strong className="text-black">🕐 Horario</strong>
                        <br />
                        <span className="pl-6">{place.schedule}</span>
                      </p>

                      <p>
                        <strong className="text-black">📍 Dirección</strong>
                        <br />
                        <span className="pl-6">{place.address}</span>
                      </p>

                      <p>
                        <strong className="text-black">☎ Teléfono</strong>
                        <br />
                        <span className="pl-6">{place.phone}</span>
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {place.phone !== "Consultar guía" ? (
                          <a
                            href={`tel:${place.phone.split("/")[0].replace(/[^0-9+]/g, "")}`}
                            className="rounded-xl bg-[#25170b] px-3 py-2.5 text-center text-[10px] font-black uppercase tracking-wide text-white transition hover:scale-[1.02]"
                          >
                            ☎ Llamar
                          </a>
                        ) : (
                          <span className="rounded-xl bg-gray-100 px-3 py-2.5 text-center text-[10px] font-black uppercase tracking-wide text-gray-400">
                            ☎ Teléfono
                          </span>
                        )}

                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            `${place.name}, ${place.address}, San Gil, Santander, Colombia`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl bg-[#25170b] px-3 py-2.5 text-center text-[10px] font-black uppercase tracking-wide text-white transition hover:scale-[1.02]"
                        >
                          📍 Cómo llegar
                        </a>

                        {place.instagram ? (
                          <a
                            href={place.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl bg-white px-3 py-2.5 text-center text-[10px] font-black uppercase tracking-wide text-black shadow-sm transition hover:scale-[1.02]"
                          >
                            📱 Instagram
                          </a>
                        ) : (
                          <span
                            className="rounded-xl bg-white px-3 py-2.5 text-center text-[10px] font-black uppercase tracking-wide text-black/30 shadow-sm"
                            title="Instagram no disponible"
                          >
                            📱 Instagram
                          </span>
                        )}

                        {place.facebook ? (
                          <a
                            href={place.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl bg-white px-3 py-2.5 text-center text-[10px] font-black uppercase tracking-wide text-black shadow-sm transition hover:scale-[1.02]"
                          >
                            📘 Facebook
                          </a>
                        ) : (
                          <span
                            className="rounded-xl bg-white px-3 py-2.5 text-center text-[10px] font-black uppercase tracking-wide text-black/30 shadow-sm"
                            title="Facebook no disponible"
                          >
                            📘 Facebook
                          </span>
                        )}
                      </div>

                      {place.pedidosUrl ? (
                        <a
                          href={place.pedidosUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block w-full rounded-xl bg-[#e63946] px-4 py-3 text-center text-xs font-black uppercase tracking-wider text-white transition hover:brightness-95"
                        >
                          🛒 Pedir con Pedidos360
                        </a>
                      ) : (
                        <button
                          type="button"
                          className="w-full rounded-xl bg-[#e63946] px-4 py-3 text-xs font-black uppercase tracking-wider text-white opacity-50"
                          disabled
                          title="Pedidos360 próximamente"
                        >
                          🛒 Pedir con Pedidos360
                        </button>
                      )}
                    </div>
                  </details>

                  {place.videoUrl ? (
                    <a
                      href={place.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 block overflow-hidden rounded-2xl border border-[#299bf3]/30 bg-white shadow-sm transition hover:shadow-md"
                    >
                      <div className="relative aspect-video bg-[#25170b]">
                        <Image
                          src={place.videoCover ?? "/images/products/hamburger.jpg"}
                          alt={`Portada del video de ${place.name}`}
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                          <span className="rounded-full bg-white/95 px-5 py-3 text-xs font-black uppercase tracking-wider text-[#25170b]">
                            ▶ Ver video
                          </span>
                        </div>
                      </div>
                    </a>
                  ) : null}
                </div>
              </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="mapa" className="mt-16 px-5">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-black/45">
              Mapa gastronómico
            </p>

            <h2 className="mt-2 text-3xl font-black uppercase leading-tight sm:text-5xl">
              Encuentra tu próximo sabor
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-black/60">
              Explora el mapa de la Guía Boquisabrosa y descubre dónde están
              nuestros sabores.
            </p>
          </div>

          <a
            href="/mapaguiaboquisabrosa.png"
            target="_blank"
            rel="noopener noreferrer"
            className="group block overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
            aria-label="Ampliar mapa de la Guía Boquisabrosa"
          >
            <Image
              src="/mapaguiaboquisabrosa.png"
              alt="Mapa gastronómico de la Guía Boquisabrosa de San Gil"
              width={1536}
              height={1024}
              className="h-auto w-full transition duration-300 group-hover:scale-[1.01]"
            />
          </a>

          <p className="mt-3 text-center text-[10px] font-black uppercase tracking-wider text-black/40">
            Toca el mapa para ampliarlo
          </p>
        </div>
      </section>

      <section className="mt-16 overflow-hidden bg-[#f6c515]">
        <div className="px-5 py-14 sm:py-16">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-black/50 sm:text-xs">
              Guía Boquisabrosa · Ruta Gastronómica
            </p>

            <h2 className="mt-4 text-3xl font-black uppercase leading-[1.05] tracking-tight text-[#25170b] sm:text-5xl">
              Los buenos sabores
              <span className="mt-1 block">merecen ser descubiertos.</span>
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-black/65 sm:text-base">
              Encuentra tu próximo lugar favorito o haz que más personas descubran tu negocio gastronómico.
            </p>

            <a
              href="/boquisabrosa/propuesta"
              className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#25170b] px-6 py-3 text-xs font-black uppercase tracking-[0.1em] text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-[#e63946] focus:outline-none focus:ring-4 focus:ring-black/20 sm:px-8 sm:text-sm"
            >
              ¿Tu negocio quiere sumarse?
              <span aria-hidden="true">↗</span>
            </a>

            <p className="mt-4 text-[10px] font-semibold text-black/55 sm:text-xs">
              Conoce cómo hacer parte de la ruta.
            </p>
          </div>
        </div>

        <div className="bg-[#25170b] px-5 py-8 text-center text-white">
          <p className="text-xl font-black uppercase tracking-[0.12em]">
            Boquisabrosa
          </p>

          <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-white/65 sm:text-sm">
            Una ruta para descubrir, disfrutar y compartir los sabores de nuestra tierra.
          </p>

          <div className="mx-auto mt-6 h-px max-w-xs bg-white/15" />

          <p className="mt-4 text-[10px] font-semibold tracking-wide text-white/50">
            Una iniciativa impulsada por Pedidos360
          </p>
        </div>
      </section>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/10 bg-white/95 px-3 py-2 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md">
        <div className="mx-auto grid max-w-xl grid-cols-4">
          {[
            ["⌂", "Inicio", "#"],
            ["⌕", "Explorar", "#explorar"],
            ["⌖", "Mapa", "#explorar"],
            ["♡", "Favoritos", "#explorar"],
          ].map(([icon, label, href]) => (
            <a
              key={label}
              href={href}
              className="flex flex-col items-center gap-1 py-1 text-[10px] font-black text-black/55"
            >
              <span className="text-lg leading-none">{icon}</span>
              {label}
            </a>
          ))}
        </div>
      </nav>
    </main>
  );
}
