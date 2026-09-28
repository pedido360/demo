"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { recordGuideMetric } from "@/lib/repositories/guide-metrics.repository";

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
    type: "Hotel",
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
  const [promoPosition, setPromoPosition] = useState<number | null>(null);
  const [openPlace, setOpenPlace] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPlaces = shuffledPlaces.filter((place) => {
    const matchesCategory =
      activeFilter === "Todos" ||
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
      <section className="relative overflow-hidden bg-[#11100d]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#f6c51533,transparent_45%),radial-gradient(circle_at_bottom_left,#e6394633,transparent_40%)]" />

        <div className="relative mx-auto max-w-6xl px-5 pb-10 pt-6 sm:px-8">
          <header className="flex items-center justify-between">
            <div className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white backdrop-blur">
              San Gil · Santander
            </div>

            <div className="text-right text-white">
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
                Presenta
              </div>
              <div className="text-xs font-black">El Sibarita Sangileño</div>
            </div>
          </header>

          <div className="mx-auto flex max-w-xl flex-col items-center py-10 text-center">
            <div className="w-full max-w-[330px] overflow-hidden rounded-[1.8rem] border border-white/10 bg-white shadow-2xl sm:max-w-[430px] lg:max-w-[520px]">
              <Image
                src="/GuiaBoquisabrosa.jpeg"
                alt="Guía Boquisabrosa"
                width={900}
                height={1200}
                priority
                className="h-auto w-full"
              />
            </div>

            <p className="mt-7 text-xs font-black uppercase tracking-[0.3em] text-[#f6c515]">
              Ruta Gastronómica
            </p>

            <h1 className="mt-3 text-4xl font-black uppercase leading-[0.94] tracking-tight text-white sm:text-6xl">
              Descubre
              <span className="block text-[#f6c515]">San Gil a bocados</span>
            </h1>

            <p className="mt-5 max-w-md text-sm leading-6 text-white/65 sm:text-base">
              Lugares, sabores y experiencias recomendadas para descubrir
              lo mejor de nuestra tierra.
            </p>

            <a
              href="#explorar"
              className="mt-7 rounded-full bg-[#e63946] px-7 py-3.5 text-xs font-black uppercase tracking-[0.16em] text-white shadow-xl transition hover:scale-105"
            >
              Explorar la guía ↓
            </a>
          </div>

          <div className="border-t border-white/10 pt-5 text-center">
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
              Patrocinador principal
            </div>
            <div className="mt-1 text-lg font-black text-white">
              Pedidos<span className="text-[#f6c515]">360</span>
            </div>
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
                    ? "bg-[#e63946] text-white"
                    : "bg-white text-black/65 shadow-sm"
                }`}
              >
                {filter}
              </button>
            ))}
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
                {activeFilter === "Todos" &&
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
            Guía Boquisabrosa · Ruta Gastronómica · San Gil
          </p>

          <div className="mt-7 text-sm font-black">
            Powered by Pedidos360
          </div>
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
