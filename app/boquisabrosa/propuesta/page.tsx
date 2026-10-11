import Image from "next/image";

import Link from "next/link";

const ink = "#29180D";
const red = "#D9363E";
const gold = "#F6C515";

const services = [
  {
    number: "01",
    icon: "📸",
    title: "Fotografía gastronómica",
    text: "Imágenes de platos, productos, instalaciones, fachada, experiencia gastronómica y detalles de marca. Se pueden utilizar también en las redes sociales y medios digitales del establecimiento.",
  },
  {
    number: "02",
    icon: "🎬",
    title: "Video promocional",
    text: "Una pieza audiovisual que muestra la esencia del negocio, sus productos, ambiente y experiencia, con edición profesional y formato vertical para Reels, TikTok y Stories.",
  },
  {
    number: "03",
    icon: "📡",
    title: "Transmisión en vivo",
    text: "Un recorrido en directo para mostrar la ubicación, los productos, la historia, la trayectoria y los detalles que hacen especial al establecimiento.",
  },
  {
    number: "04",
    icon: "🗺️",
    title: "Folleto y mapa de la ruta",
    text: "Presencia en la pieza impresa de la ruta gastronómica, con información del establecimiento y un tiraje de 1.000 folletos.",
  },
  {
    number: "05",
    icon: "🌐",
    title: "Presencia web permanente",
    text: "Tu establecimiento tendrá un espacio en la guía digital de la Ruta Boquisabrosa, disponible las 24 horas durante un año contado desde la fecha del contrato.",
  },
];

const socialActions = [
  "Difusión promocional a través de los canales digitales que impulsan la Ruta Boquisabrosa.",
  "Historias y contenido para mostrar productos y experiencia",
  "Fotografías y video promocional publicados en los canales de la guía",
  "Etiquetado de las cuentas del establecimiento y referencia de ubicación",
  "Llamados a la acción para despertar interés y motivar visitas",
];

const brochureItems = [
  "Nombre y logotipo del establecimiento",
  "Municipio, ubicación y datos de contacto",
  "Redes sociales y código QR",
  "Fotografía y plato o producto recomendado",
  "Breve descripción del establecimiento",
  "Ubicación dentro de la ruta gastronómica",
];

const planIncludes = [
  "Presencia en el folleto y mapa oficial de la ruta",
  "Listado promocional con contacto, ubicación y código QR",
  "Fotografía destacada del producto o experiencia",
  "Sesión fotográfica gastronómica y comercial por una única vez",
  "Video comercial con edición profesional por una única vez",
  "Video en formato vertical para Reels, TikTok y Stories",
  "Publicación inicial de los contenidos promocionales a través de los canales digitales que dan visibilidad a la Ruta Boquisabrosa.",
  "Historias, etiquetado, ubicación y promoción del establecimiento dentro de la campaña",
  "Integración en las comunicaciones de la Ruta Boquisabrosa",
];

const journey = [
  { n: "01", title: "Descubrir", text: "Que las personas encuentren nuevos sabores y lugares." },
  { n: "02", title: "Conocer", text: "Que conozcan el establecimiento, sus productos y su historia." },
  { n: "03", title: "Interesarse", text: "Que el contenido despierte curiosidad por vivir la experiencia." },
  { n: "04", title: "Visitar", text: "Que la información facilite encontrar el establecimiento." },
];

export default function PropuestaBoquisabrosaPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fffaf0] text-[#29180d]">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .motion-safe\\:animate-\\[float_4s_ease-in-out_infinite\\] {
            animation: none !important;
          }
        }
      `}</style>
      <div className="relative isolate overflow-hidden bg-[#29180d] text-white">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/guia/portadaok.png"
            alt="Sabores y destinos de la Ruta Boquisabrosa"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#29180d] via-[#29180d]/90 to-[#29180d]/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#29180d] via-transparent to-[#29180d]/20" />
        </div>

        <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-12">
          <Link href="/boquisabrosa" aria-label="Volver a la Guía Boquisabrosa" className="flex items-center gap-3">
            <Image
              src="/guia/logo-boquisabrosa-transparente.png"
              alt="Logo Boquisabrosa"
              width={56}
              height={56}
              className="h-12 w-12 object-contain sm:h-14 sm:w-14"
            />
            <span className="text-sm font-black uppercase leading-tight tracking-[0.12em] sm:text-base">
              Guía <span className="block text-[#f6c515]">Boquisabrosa</span>
            </span>
          </Link>
          <a href="#plan" className="rounded-full bg-[#f6c515] px-4 py-3 text-center text-xs font-black text-[#29180d] transition hover:bg-white sm:px-6 sm:text-sm">
            Conocer el plan <span aria-hidden="true">↘</span>
          </a>
        </header>

        <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-20 pt-12 sm:px-8 sm:pb-28 sm:pt-16 lg:grid-cols-[1.15fr_.85fr] lg:px-12 lg:pb-32 lg:pt-20">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.17em] text-[#f6c515] backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#f6c515]" />
              Propuesta comercial
            </div>
            <h1 className="text-4xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              La guía más
              <span className="block text-[#f6c515]">“arrecha”.</span>
              <span className="mt-3 block text-2xl leading-tight text-white sm:text-3xl lg:text-4xl">
                Ruta Boquisabrosa
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-white/85 sm:text-xl">
              Una experiencia que conecta sabores, destinos y experiencias.
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
              Una iniciativa de promoción turística y gastronómica que reúne restaurantes, cafés, emprendedores y establecimientos representativos de la Provincia Guanentina para descubrir sus sabores, lugares e historias.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="https://wa.me/573212057671?text=Hola%2C%20estoy%20interesado%20en%20participar%20en%20la%20Ruta%20Boquisabrosa.%20Quisiera%20conocer%20m%C3%A1s%20detalles%20del%20plan%20anual." className="inline-flex items-center justify-center gap-3 rounded-full bg-[#f6c515] px-7 py-4 font-black text-[#29180d] shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-white">
                Quiero participar <span aria-hidden="true">→</span>
              </a>
              <a href="#que-es" className="inline-flex items-center justify-center rounded-full border border-white/35 px-7 py-4 font-bold text-white transition hover:bg-white/10">
                Conocer la ruta
              </a>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-white/75">
              <span>✦ Promoción impresa</span>
              <span>✦ Fotografía y video</span>
              <span>✦ Difusión digital</span>
              <span>✦ Presencia web</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:ml-auto">
            <div className="absolute -inset-3 rotate-3 rounded-[2rem] bg-[#f6c515]" />
            <div className="relative overflow-hidden rounded-[1.6rem] border border-white/20 bg-white p-3 shadow-2xl">
              <Image
                src="/guia/demomapa.png"
                alt="Mapa de demostración de la Ruta Boquisabrosa"
                width={1536}
                height={880}
                className="w-full rounded-2xl object-cover"
                priority
              />
              <div className="flex items-center justify-between gap-3 px-3 py-4 text-[#29180d]">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a13a25]">Una ruta para descubrir</p>
                  <p className="mt-1 text-lg font-black">La Provincia Guanentina</p>
                </div>
                <span className="rounded-full bg-[#fff2bd] px-3 py-2 text-xs font-black">1.000 folletos</span>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-2 rounded-2xl bg-white px-5 py-4 text-[#29180d] shadow-xl sm:-left-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#a13a25]">Tu negocio</p>
              <p className="text-lg font-black">Dentro de la ruta</p>
            </div>
          </div>
        </section>
        <div className="h-2 bg-[#f6c515]" />
      </div>

      <section id="que-es" className="scroll-mt-8 px-5 py-20 sm:px-8 sm:py-24 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.85fr_1.15fr] lg:gap-16">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#b12e34]">01 · La iniciativa</p>
            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">
              Una ruta para descubrir lo que hace especial a nuestra tierra.
            </h2>
            <div className="mt-6 h-1.5 w-20 rounded-full bg-[#f6c515]" />
          </div>
          <div className="space-y-5 text-base leading-8 text-[#5c4a3d] sm:text-lg">
            <p>
              La Ruta Boquisabrosa es una iniciativa de promoción turística y gastronómica que reúne restaurantes, cafés, emprendedores y establecimientos representativos de la Provincia Guanentina para incentivar el turismo y el consumo local.
            </p>
            <p>
              Los 1.000 folletos impresos y el mapa de la Ruta Boquisabrosa permiten a visitantes y residentes descubrir establecimientos participantes, conocer sus platos y productos y recorrer municipios y destinos. La guía digital complementa ese recorrido y mantiene disponible la información de los establecimientos las 24 horas, todos los días.
            </p>
            <p>
              La estrategia combina <strong className="text-[#29180d]">1.000 folletos impresos, fotografía, producción audiovisual y promoción en redes sociales</strong>. Cada establecimiento cuenta con un espacio para mostrar su identidad, sus productos y la experiencia que ofrece.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-8 sm:py-24 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#b12e34]">02 · Lo que recibe tu negocio</p>
            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">Tu establecimiento tiene una historia que contar.</h2>
            <p className="mt-5 text-base leading-7 text-[#6b5848] sm:text-lg">
              La propuesta reúne herramientas visuales y promocionales para mostrar lo que hace único a cada participante.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {services.map((service) => (
              <article key={service.number} className="group rounded-3xl border border-[#eadfcd] bg-[#fffaf0] p-6 transition hover:-translate-y-1 hover:border-[#f6c515] hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-3xl" aria-hidden="true">{service.icon}</span>
                  <span className="text-xs font-black tracking-widest text-[#b12e34]">{service.number}</span>
                </div>
                <h3 className="mt-6 text-xl font-black">{service.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#6b5848]">{service.text}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 grid gap-6 rounded-3xl bg-[#29180d] p-6 text-white sm:p-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f6c515]">Tu espacio en el folleto</p>
              <h3 className="mt-3 text-2xl font-black sm:text-3xl">La ruta también se descubre en papel.</h3>
              <p className="mt-3 text-sm leading-7 text-white/70">El folleto y mapa oficial contemplan la siguiente información de cada establecimiento:</p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {brochureItems.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-white/90">
                  <span className="font-black text-[#f6c515]">✓</span><span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-24 lg:px-12">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative overflow-hidden rounded-[2rem] bg-[#f4e8d3] p-3">
            <Image
              src="/guia/promocion-digital-boquisabrosa.png"
              alt="Pieza gráfica de la Guía Boquisabrosa"
              width={1586}
              height={992}
              className="w-full rounded-[1.5rem] object-cover"
            />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#b12e34]">03 · Promoción digital</p>
            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">Que te descubran. Que te conozcan. Que quieran visitarte.</h2>
            <p className="mt-5 text-base leading-8 text-[#6b5848] sm:text-lg">
              La promoción en redes sociales acompaña el trabajo de la Ruta Boquisabrosa mediante fotografías de productos, videos promocionales, publicaciones, historias, Reels, etiquetas, ubicación y llamados a la acción. La guía digital complementa la difusión del folleto y de los contenidos, manteniendo la información de los establecimientos disponible 24/7.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {socialActions.map((action) => (
                <div key={action} className="flex gap-3 rounded-2xl border border-[#eadfcd] bg-white p-4 text-sm font-medium leading-6">
                  <span className="mt-0.5 font-black text-[#b12e34]">↗</span><span>{action}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-7 text-[#6b5848]">
              Los contenidos promocionales incluidos se producen y publican por una única vez. Las actualizaciones se realizan a solicitud del establecimiento.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#f6c515] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#6d2a19]">04 · El recorrido del visitante</p>
          <h2 className="mt-4 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">Una buena experiencia comienza cuando alguien la descubre.</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {journey.map((item) => (
              <article key={item.n} className="rounded-3xl bg-white/85 p-6">
                <p className="text-sm font-black tracking-widest text-[#b12e34]">{item.n}</p>
                <h3 className="mt-4 text-2xl font-black">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#5c4a3d]">{item.text}</p>
              </article>
            ))}
          </div>
          <p className="mt-8 max-w-3xl text-base font-medium leading-8 text-[#4d2c12]">
            La Ruta Boquisabrosa conecta establecimientos, destinos, contenidos, redes sociales, turismo y visitantes. El folleto impreso, la creación de contenido y la difusión en redes se complementan con una guía digital disponible 24/7.
          </p>
        </div>
      </section>

      <section id="plan" className="scroll-mt-6 px-5 py-20 sm:px-8 sm:py-24 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#b12e34]">05 · Plan de participación</p>
            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">Plan 1 — Presencia en la ruta + redes sociales</h2>
            <p className="mt-5 text-lg font-semibold text-[#6b5848]">“Quiero presencia física y digital”.</p>
            <p className="mt-4 text-base leading-7 text-[#6b5848]">
              Ideal para restaurantes, hoteles, cafés y establecimientos que quieren participar en la ruta como parte de una campaña de posicionamiento de marca.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl overflow-hidden rounded-[2rem] border border-[#e7d8bf] bg-white shadow-xl lg:grid-cols-[1fr_.78fr]">
            <div className="p-6 sm:p-9 lg:p-10">
              <h3 className="text-xl font-black">¿Qué contempla el plan?</h3>
              <ul className="mt-6 space-y-4">
                {planIncludes.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-[#5c4a3d] sm:text-base">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fff1b8] text-xs font-black text-[#6d4c00]">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7 rounded-2xl bg-[#fff8df] p-5">
                <p className="font-black">Permanencia en la guía digital 24/7</p>
                <p className="mt-1 text-sm leading-6 text-[#6b5848]">Un año contado a partir de la fecha del contrato. Las actualizaciones de información o contenido se realizan a solicitud.</p>
              </div>
            </div>
            <div className="flex flex-col justify-between bg-[#29180d] p-7 text-white sm:p-10">
              <div>
                <span className="inline-flex rounded-full bg-[#f6c515] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#29180d]">Inversión anual</span>
                <p className="mt-8 text-sm font-bold uppercase tracking-[0.16em] text-white/65">Plan 1 · Participación anual</p>
              <div className="mt-3 flex flex-wrap items-baseline gap-x-2">
                <span className="text-4xl font-black tracking-tight text-[#f6c515] sm:text-5xl">$300.000</span>
                <span className="text-lg font-bold">COP</span>
              </div>
              <h3 className="mt-4 text-2xl font-black leading-tight">Tu negocio merece ser visto.</h3>
              <p className="mt-3 text-lg font-extrabold leading-snug text-[#f6c515]">Más visibilidad. Más oportunidades. Más razones para visitarte.</p>
              <p className="mt-3 text-sm leading-7 text-white/75">Aprovecha los beneficios de la Ruta Boquisabrosa para promocionar tu establecimiento, destacar tu oferta gastronómica y llegar a más personas.</p>
              <div className="my-7 h-px bg-white/20" />
              <p className="text-sm leading-6 text-white/70">Un año de participación, contado desde la fecha del contrato.</p>
              </div>
              <a href="https://wa.me/573212057671?text=Hola%2C%20estoy%20interesado%20en%20participar%20en%20la%20Ruta%20Boquisabrosa.%20Quisiera%20conocer%20m%C3%A1s%20detalles%20del%20plan%20anual." target="_blank" rel="noreferrer" className="mt-9 inline-flex items-center justify-center gap-3 rounded-full bg-[#25D366] px-6 py-4 text-center font-black text-white transition hover:bg-[#1fb858]">
                Consultar por WhatsApp <span aria-hidden="true">→</span>
              </a>
              <p className="mt-3 text-center text-xs leading-5 text-white/60">Se abrirá WhatsApp con un mensaje listo para enviar. Consultar no te compromete a participar.</p>
            </div>
          </div>
          <p className="mx-auto mt-5 max-w-5xl text-xs leading-6 text-[#79695a]">
            Las fotografías, el video y las publicaciones contempladas en el plan se realizan por una única vez. La permanencia anual corresponde a la presencia en la guía; las actualizaciones se realizan a solicitud del establecimiento.
          </p>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-8 sm:py-24 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#b12e34]">06 · El valor de participar</p>
            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">Un buen restaurante también necesita ser descubierto.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Visibilidad", "Presencia dentro de una ruta gastronómica que conecta establecimientos y destinos."],
              ["Contenido profesional", "Fotografías y video para mostrar productos, espacio y experiencia."],
              ["Promoción multicanal", "Combinación de folleto impreso, guía digital y canales sociales."],
              ["Posicionamiento", "Una oportunidad para contar la historia y mostrar la identidad del negocio."],
            ].map(([title, text]) => (
              <article key={title} className="rounded-3xl border border-[#eadfcd] bg-[#fffaf0] p-6">
                <span className="text-xl font-black text-[#b12e34]" aria-hidden="true">✦</span>
                <h3 className="mt-3 text-lg font-black">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-[#6b5848]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-24 lg:px-12">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#b12e34]">07 · El concepto</p>
          <div className="mx-auto mt-6 h-1.5 w-16 rounded-full bg-[#f6c515]" />
          <h2 className="mt-7 text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">
            No solo te mostramos un restaurante.
            <span className="mt-2 block text-[#b12e34]">Te invitamos a descubrirlo.</span>
          </h2>
          <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-[#6b5848] sm:text-lg">
            La Ruta Boquisabrosa cuenta las historias detrás de los establecimientos: sus sabores, platos, personas, espacios y aquello que los hace especiales. La guía impresa, los contenidos y la difusión en redes acercan esas historias al público; la guía digital permite consultar la información de la ruta en cualquier momento.
          </p>
        </div>
      </section>

      <section id="invitacion" className="scroll-mt-6 bg-[#29180d] px-5 py-20 text-white sm:px-8 sm:py-24 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
          <div>
            <Image
              src="/guia/logo-boquisabrosa-transparente.png"
              alt="Guía Boquisabrosa"
              width={88}
              height={88}
              className="h-20 w-20 object-contain"
            />
            <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-[#f6c515]">La invitación</p>
            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">¿Quieres hacer parte de la Ruta Boquisabrosa?</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
              Te invitamos a ser un destino recomendado en la Ruta Boquisabrosa y a conectar tu establecimiento con una audiencia interesada en descubrir lugares, gastronomía local y experiencias auténticas.
            </p>
            <p className="mt-7 text-xl font-black text-[#f6c515]">Reserva tu espacio como establecimiento participante.</p>
          </div>
          <div className="rounded-[2rem] border border-white/15 bg-white/5 p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f6c515]">Plan 1 · Participación anual</p>
            <p className="mt-3 text-3xl font-black">$300.000 <span className="text-base">COP</span></p>
            <p className="mt-1 text-sm text-white/65">Permanencia por un año desde la fecha del contrato.</p>
            <div className="my-6 h-px bg-white/15" />
            <p className="text-sm font-bold text-white/80">¿Te gustaría participar?</p>
          <p className="mt-3 text-sm leading-7 text-white/75">Conversemos sobre tu establecimiento y resolvamos tus dudas antes de tomar una decisión.</p>
          <a href="https://wa.me/573212057671?text=Hola%2C%20estoy%20interesado%20en%20participar%20en%20la%20Ruta%20Boquisabrosa.%20Quisiera%20conocer%20m%C3%A1s%20detalles%20del%20plan%20anual%20y%20resolver%20algunas%20dudas." target="_blank" rel="noreferrer" className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#25D366] px-6 py-4 text-center font-black text-white transition hover:bg-[#1fb858]">
            Consultar por WhatsApp <span aria-hidden="true">→</span>
          </a>
          <p className="mt-3 text-xs leading-5 text-white/60">Consultar no te compromete a participar.</p>
          </div>
        </div>
      </section>

      <a
        href="/boquisabrosa"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Ver la Ruta Boquisabrosa"
        className="fixed bottom-4 right-3 z-50 inline-flex items-center gap-2 rounded-full bg-[#f6c515] px-3 py-3 text-xs font-black text-[#29180d] shadow-lg shadow-black/25 transition-colors hover:bg-white motion-safe:animate-[float_4s_ease-in-out_infinite] sm:bottom-6 sm:right-6 sm:px-5 sm:text-sm"
      >
        <span aria-hidden="true">✦</span>
        <span>Ver Ruta Boquisabrosa</span>
      </a>

      <footer className="bg-[#1c1009] px-5 py-8 text-center text-white sm:px-8">
        <p className="text-sm font-black uppercase tracking-[0.15em]">Guía Boquisabrosa</p>
        <p className="mt-3 text-sm leading-7 text-white/65">
          Sabores que cuentan historias. Destinos que se disfrutan. Experiencias que se recuerdan.
        </p>
        <a href="#top" className="sr-only">Volver arriba</a>
        <p className="mt-5 text-xs text-white/40">Ruta gastronómica · Provincia Guanentina</p>
      </footer>
    </main>
  );
}
