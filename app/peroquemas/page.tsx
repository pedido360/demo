"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { recordGuideMetric } from "@/lib/repositories/guide-metrics.repository";

const places: Array<{
  number: string;
  name: string;
  municipality?: string;
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
    categories: ["Restaurantes", "Comida típica", "Parrillas y carnes"],
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
    categories: ["Restaurantes", "Comida típica"],
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
    categories: ["Restaurantes", "Comida típica"],
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
    categories: ["Restaurantes", "Comida típica"],
  },
  {
    number: "05",
    name: "Bocaditos Anita",
    municipality: "San Gil",
    type: "Restaurante",
    schedule: "24 horas",
    address: "San Gil",
    phone: "Consultar guía",
    description: "Especialidades de la gastronomía local.",
    categories: ["Restaurantes", "Comida típica"],
  },
  {
    number: "06",
    name: "Frutas y Verduras Los Gigantes",
    type: "Restaurante",
    schedule: "Todos los días · 5 A.M. - 4 P.M.",
    address: "Interior casa de mercado, puesto 86",
    phone: "311 50 1766 / 310 789 9404",
    description: "Domicilios gratis. Atendido por sus propietarios Manuel Bernal y Olinda Cuervo.",
    categories: ["Restaurantes"],
  },
  {
    number: "07",
    name: "Balneario Pozo Azul",
    type: "Turismo",
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
    categories: ["Cafeterías", "Comidas rápidas"],
  },
  {
    number: "09",
    name: "Megalesa",
    municipality: "San Gil",
    image: "/guia/megalesa.webp",
    type: "Restaurante",
    schedule: "24 horas",
    address: "San Gil",
    phone: "Consultar guía",
    description: "Hamburguesas, picadas y diferentes opciones para compartir.",
    categories: ["Restaurantes", "Comidas rápidas"],
  },
  {
    number: "10",
    name: "Piqueteadero Doña Bárbara",
    municipality: "San Gil",
    type: "Restaurante",
    schedule: "Todos los días · 11 A.M. - 10 P.M.",
    address: "San Gil",
    phone: "Consultar guía",
    description: "Piquetes y sabores tradicionales.",
    categories: ["Restaurantes", "Comida típica"],
  },
  {
    number: "11",
    name: "Hotel Terrazas de la Candelaria",
    municipality: "San Gil",
    type: "Hotel",
    schedule: "Todos los días · 8 A.M. - 10 P.M.",
    address: "San Gil",
    phone: "Consultar guía",
    description: "Hospedaje y experiencia para visitantes de San Gil.",
  },
  {
    number: "12",
    name: "Típicos Lina",
    municipality: "Pinchote",
    type: "Restaurante",
    schedule: "Todos los días · 10 A.M. - 5 P.M.",
    address: "Cl. 4 #3-69, Pinchote, Santander",
    phone: "316 4611891",
    description: "Comida típica santandereana.",
    categories: ["Restaurantes", "Comida típica"],
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
  "Todos",
  "Restaurantes",
  "Comidas rápidas",
  "Comida típica",
  "Cafeterías",
  "Pizzerías",
  "Parrillas y carnes",
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
  const [promoPosition, setPromoPosition] = useState(0);
  const [openPlace, setOpenPlace] = useState<string | null>(null);
  const [pendingScrollPlace, setPendingScrollPlace] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [activeMunicipality, setActiveMunicipality] = useState("San Gil");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setPromoPosition(Math.floor(Math.random() * (places.length + 1)));
  }, [activeFilter, activeMunicipality, searchTerm]);

  useEffect(() => {
    if (!pendingScrollPlace) return;

    const target = document.getElementById(`lugar-${pendingScrollPlace}`);
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "center" });
    setPendingScrollPlace(null);
  }, [pendingScrollPlace, activeFilter, activeMunicipality, searchTerm, shuffledPlaces]);

  const filteredPlaces = shuffledPlaces.filter((place) => {
    const matchesCategory =
      activeFilter === "Todos" ||
      place.categories?.includes(activeFilter);

    const matchesMunicipality =
      activeMunicipality === "Todos" ||
      (activeMunicipality === "Sin municipio confirmado"
        ? !place.municipality
        : activeMunicipality === "Más municipios"
          ? Boolean(place.municipality) && !["San Gil", "Socorro", "Barichara", "Pinchote"].includes(place.municipality!)
          : place.municipality === activeMunicipality);

    const term = searchTerm.trim().toLowerCase();

    const matchesSearch =
      term === "" ||
      place.name.toLowerCase().includes(term) ||
      place.description.toLowerCase().includes(term) ||
      place.type.toLowerCase().includes(term);

    return matchesCategory && matchesMunicipality && matchesSearch;
  });

  useEffect(() => {
    setShuffledPlaces(shufflePlaces(places));
    setPromoPosition(Math.floor(Math.random() * (places.length + 1)));
    void recordGuideMetric("guide_view");
  }, []);

  return (
    <main id="inicio" className="min-h-screen bg-[#fff9e8] pb-24 text-[#25170b]">
      <section className="relative overflow-hidden bg-[#fff9e8]">
        <div className="mx-auto max-w-6xl px-0 sm:px-8 sm:pt-6">
          <a href="#explorar" aria-label="Explorar la guía">
            <Image
              src="/guia/portada-pero-que-mas.png"
              alt="¡Pero Qué Más Santander! Todo lo bueno de esta tierra en un solo lugar"
              width={1920}
              height={800}
              priority
              className="aspect-[16/9] w-full object-cover object-center sm:aspect-auto sm:rounded-3xl sm:shadow-xl"
              sizes="(max-width: 640px) 100vw, 1152px"
            />
          </a>
        </div>
      </section>

      <section id="explorar" className="relative z-20 mx-auto -mt-10 max-w-6xl px-3 sm:-mt-24 sm:px-8">
        <div className="relative z-30 px-2 pb-2 pt-0 sm:px-6 lg:px-10">
          <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 shadow-lg">
            <span aria-hidden="true" className="text-xl text-black/70">⌕</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setOpenPlace(null);
              }}
              placeholder="¿Qué quieres descubrir hoy?"
              aria-label="Buscar en ¡PERO QUÉ MÁS!"
              className="min-w-0 flex-1 bg-transparent py-1 text-sm text-[#25170b] outline-none placeholder:text-black/50"
            />
            <button
              type="button"
              aria-label="Buscar"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#16834a] text-xl font-black text-white"
              onClick={() => document.getElementById("lugares-guia")?.scrollIntoView({ behavior: "smooth" })}
            >
              →
            </button>
          </div>

          <div className="mt-2 grid grid-cols-3 gap-2">
            <label className="flex min-w-0 items-center gap-1 rounded-full border border-black/5 bg-white px-3 py-3 text-xs font-bold shadow-md">
              <span aria-hidden="true">📍</span>
              <select
                id="guide-municipality"
                value={activeMunicipality}
                onChange={(event) => {
                  setActiveMunicipality(event.target.value);
                  setOpenPlace(null);
                }}
                aria-label="Municipio"
                className="min-w-0 flex-1 appearance-none bg-transparent outline-none"
              >
                {["Todos", "San Gil", "Socorro", "Barichara", "Pinchote", "Más municipios", "Sin municipio confirmado"].map((municipality) => (
                  <option key={municipality} value={municipality}>{municipality === "Todos" ? "Municipio" : municipality}</option>
                ))}
              </select>
              <span aria-hidden="true">⌄</span>
            </label>

            <button
              type="button"
              className="flex items-center justify-center gap-1 rounded-full border border-black/5 bg-white px-2 py-3 text-xs font-bold shadow-md"
              aria-label="Fecha: hoy"
              title="El filtro por fecha estará disponible próximamente"
            >
              <span aria-hidden="true">▦</span> Hoy
            </button>

            <button
              type="button"
              className="flex items-center justify-center gap-1 rounded-full border border-black/5 bg-white px-2 py-3 text-xs font-bold shadow-md"
              aria-label="Cerca de mí"
              title="La búsqueda por ubicación estará disponible próximamente"
            >
              <span aria-hidden="true">⊙</span> Cerca de mí
            </button>
          </div>

        </div>
      </section>

      <section id="mapa" className="mt-3 px-4 sm:mt-6 sm:px-5 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <a
            href="/guia/demomapa.png"
            target="_blank"
            rel="noopener noreferrer"
            className="group block overflow-hidden rounded-2xl border border-black/10 bg-white shadow-md"
            aria-label="Ampliar maqueta visual del mapa de ¡PERO QUÉ MÁS!"
          >
            <Image
              src="/guia/demomapa.png"
              alt="Maqueta visual del mapa turístico de ¡PERO QUÉ MÁS!"
              width={1536}
              height={1024}
              className="block h-auto w-full object-contain object-center transition duration-300"
              sizes="(max-width: 640px) 100vw, 1152px"
            />
          </a>

          <p className="mt-3 text-center text-[10px] font-black uppercase tracking-wider text-black/40">
            Toca el mapa para ampliarlo
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <section className="mt-8" aria-labelledby="municipalities-heading">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#b78b00]">
                Descubre Santander
              </p>
              <h2 id="municipalities-heading" className="mt-1 text-xl font-black sm:text-2xl">
                Explora por municipio
              </h2>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                aria-label="Ver municipios anteriores"
                onClick={() => document.getElementById("municipality-carousel")?.scrollBy({ left: -220, behavior: "smooth" })}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white text-lg shadow-sm"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Ver más municipios"
                onClick={() => document.getElementById("municipality-carousel")?.scrollBy({ left: 220, behavior: "smooth" })}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white text-lg shadow-sm"
              >
                ›
              </button>
            </div>
          </div>

          <div
            id="municipality-carousel"
            className="no-scrollbar mt-3 flex gap-2 overflow-x-auto scroll-smooth pb-2"
          >
            {[
              { name: "San Gil", detail: "Destino principal", image: "/guia/sangil.png" },
              { name: "Socorro", detail: "Historia y cultura", image: "/guia/socorro.png" },
              { name: "Barichara", detail: "Patrimonio y paisaje", image: "/guia/barichara.png" },
              { name: "Pinchote", detail: "Tradición santandereana", image: "/guia/pinchote.png" },
              { name: "Curití", detail: "Tradición y naturaleza", image: "/guia/curiti.png" },
              { name: "Villanueva", detail: "Paisaje santandereano", image: "/guia/villanueva.png" },
            ].map((municipality) => (
              <button
                key={municipality.name}
                type="button"
                onClick={() => {
                  setActiveMunicipality(municipality.name);
                  setOpenPlace(null);
                }}
                aria-pressed={activeMunicipality === municipality.name}
                className={`w-[calc((100%-1.5rem)/4)] min-w-[calc((100%-1.5rem)/4)] overflow-hidden rounded-xl border text-left transition ${
                  activeMunicipality === municipality.name
                    ? "border-[#16834a] ring-2 ring-[#16834a]/25"
                    : "border-black/5"
                }`}
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#eee5c9]">
                  <Image
                    src={municipality.image}
                    alt={`Iglesia y paisaje de ${municipality.name}`}
                    width={480}
                    height={360}
                    sizes="(max-width: 640px) 25vw, 220px"
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="block truncate px-1 py-2 text-center text-[10px] font-black sm:px-2 sm:text-sm">
                  {municipality.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8" aria-labelledby="guide-categories-heading">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#b78b00]">
            Encuentra lo que necesitas
          </p>
          <h2 id="guide-categories-heading" className="mt-1 text-2xl font-black">
            Explora por categoría
          </h2>
          <div className="mt-4 grid grid-cols-4 gap-1 sm:gap-3">
            {[
              { name: "Restaurantes", icon: "🍽️", filter: "Restaurantes" },
              { name: "Hoteles", icon: "🛏️", filter: null },
              { name: "Comercio", icon: "🛍️", filter: null },
              { name: "Sitios de interés", icon: "📸", filter: null },
            ].map((category) => (
              <button
                key={category.name}
                type="button"
                onClick={() => {
                  if (category.filter) setActiveFilter(category.filter);
                  setOpenPlace(null);
                  document.getElementById("lugares-guia")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="flex min-w-0 flex-col items-center justify-start rounded-xl border border-black/5 bg-white px-1 py-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:rounded-2xl sm:py-4"
              >
                <span className="text-2xl sm:text-3xl" aria-hidden="true">{category.icon}</span>
                <span className="mt-2 text-[10px] font-bold leading-tight sm:text-sm">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-9" aria-labelledby="guide-featured-heading">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#b78b00]">
            Lo mejor para descubrir
          </p>
          <h2 id="guide-featured-heading" className="mt-1 text-2xl font-black">
            Destacados del mes
          </h2>
          <div className="no-scrollbar -mx-1 mt-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-3 sm:grid sm:grid-cols-4 sm:overflow-visible">
            {places.filter((place) => place.featured).map((place) => (
              <button
                key={place.number}
                type="button"
                onClick={() => {
                  setActiveFilter("Todos");
                  setActiveMunicipality("Todos");
                  setSearchTerm("");
                  setOpenPlace(place.number);
                  setPendingScrollPlace(place.number);
                  void recordGuideMetric("restaurant_view", place.name);
                }}
                aria-label={`Ver información de ${place.name}`}
                className="group w-[calc((100%-16px)/3)] min-w-[calc((100%-16px)/3)] snap-start overflow-hidden rounded-xl border border-black/5 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:w-full sm:min-w-0"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-[#eee5c9]">
                  <Image
                    src={place.image ?? "/GuiaBoquisabrosa.jpeg"}
                    alt={place.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 220px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span
                    aria-label="Destacado del mes"
                    title="Destacado del mes"
                    className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#fff9e8]/90 text-sm text-[#b78b00] shadow-sm"
                  >
                    ★
                  </span>
                </div>
                <div className="p-2 sm:p-3">
                  <p className="text-[8px] font-black uppercase tracking-wider text-[#b78b00] sm:text-[10px]">
                    {place.type}
                  </p>
                  <h3 className="mt-1 text-[11px] font-black leading-tight sm:text-sm">
                    {place.name}
                  </h3>
                </div>
              </button>
            ))}
          </div>
        </section>

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

          <div className="no-scrollbar -mx-1 mt-3 flex touch-pan-x gap-2 overflow-x-auto px-1 pb-2">
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
                    ? "bg-[#16834a] text-white"
                    : "bg-white text-black/65 shadow-sm"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPlaces.length === 0 ? (
              <article className="group overflow-hidden rounded-[1.7rem] border border-[#f6c515]/40 bg-white shadow-[0_12px_40px_rgba(37,23,11,0.09)]">
                <div className="relative aspect-[16/10] overflow-hidden bg-[#eee5c9]">
                  <Image
                    src="/guia/Disponible2.png"
                    alt="¡Tu negocio merece estar aquí! Espacio disponible en ¡PERO QUÉ MÁS!"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center"
                  />
                </div>
                <div className="p-5">
                  <span className="inline-flex rounded-full bg-[#f6c515] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-[#25170b]">
                    Espacio disponible
                  </span>
                  <h3 className="mt-3 text-xl font-black leading-tight">
                    ¡Tu negocio merece estar aquí!
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-black/60">
                    Conecta tu negocio con habitantes y visitantes que quieren descubrir lo mejor de la región.
                  </p>
                  <a
                    href={`https://wa.me/573180972943?text=${encodeURIComponent("Hola, quiero información para anunciar mi negocio en ¡PERO QUÉ MÁS!.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 block w-full rounded-xl bg-[#25D366] px-4 py-3 text-center text-xs font-black uppercase tracking-wider text-white"
                  >
                    💬 QUIERO QUE MI NEGOCIO APAREZCA
                  </a>
                </div>
              </article>
            ) : filteredPlaces.map((place, index) => (
              <div key={place.number} className="contents">
                {(
                  promoPosition % (filteredPlaces.length + 1) === index ||
                  (promoPosition % (filteredPlaces.length + 1) === filteredPlaces.length &&
                    index === filteredPlaces.length - 1)
                ) ? (
                  <article className={`group overflow-hidden rounded-[1.7rem] border border-[#f6c515]/40 bg-white shadow-[0_12px_40px_rgba(37,23,11,0.09)] transition duration-300 hover:-translate-y-1 hover:shadow-xl ${promoPosition % (filteredPlaces.length + 1) === filteredPlaces.length ? "order-last" : ""}`}>
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#eee5c9]">
                      <Image
                        src="/guia/Disponible2.png"
                        alt="¡Tu negocio merece estar aquí! Espacio disponible en ¡PERO QUÉ MÁS!"
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
                        ¡Tu negocio merece estar aquí!
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-black/60">
                        Conecta tu negocio con habitantes y visitantes que quieren descubrir lo mejor de la región.
                      </p>

                      <a
                        href={`https://wa.me/573180972943?text=${encodeURIComponent(
                          "Hola, quiero información para anunciar mi negocio en ¡PERO QUÉ MÁS!."
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 block w-full rounded-xl bg-[#25D366] px-4 py-3 text-center text-xs font-black uppercase tracking-wider text-white transition hover:brightness-95"
                      >
                        💬 QUIERO QUE MI NEGOCIO APAREZCA
                      </a>
                    </div>
                  </article>
                ) : null}

                <article
                  id={`lugar-${place.number}`}
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
                        "Hola, vengo de la ¡PERO QUÉ MÁS!."
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
                </div>
              </article>
              </div>
            ))}
          </div>
        </div>
        </div>

      <section className="mt-16 bg-[#f6c515] px-5 py-14">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-black/45">
            La ruta sigue creciendo
          </p>

          <h2 className="mt-3 text-3xl font-black uppercase leading-tight sm:text-5xl">
            Buenos sabores.
            <span className="block">Buenos lugares.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-black/60">
            ¡PERO QUÉ MÁS! · Guía regional de Santander
          </p>

          <div className="mt-7 text-sm font-black">
            Presentada por El Sibarita de San Gil
          </div>
        </div>
      </section>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-black/10 bg-white/95 px-3 py-2 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md">
        <div className="mx-auto grid max-w-xl grid-cols-5">
          {[
            ["⌂", "Inicio", "#inicio"],
            ["⌕", "Mapa", "#mapa"],
            ["♡", "Guardados", "#guardados"],
            ["✦", "Planes", "#planes"],
            ["☰", "Más", "#explorar"],
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
