import type { ReactElement } from "react";
import { AntigravityHero, PourDivider } from "@/components/ui/AntigravityHero";

type CocktailTone = "amber" | "smoke" | "citrus" | "gold";

interface Cocktail {
  name: string;
  base: string;
  note: string;
  tone: CocktailTone;
}

const TONE_GRADIENTS: Record<CocktailTone, { from: string; to: string }> = {
  amber: { from: "#8a5a1f", to: "#d4af37" },
  smoke: { from: "#3a4152", to: "#9aa3b5" },
  citrus: { from: "#a3b25a", to: "#f1d98c" },
  gold: { from: "#d4af37", to: "#f1d98c" },
};

const COCKTAILS: readonly Cocktail[] = [
  {
    name: "Ámbar Negroni",
    base: "Ginebra · Vermut · Bíter",
    note: "Twist de naranja quemada frente al invitado.",
    tone: "amber",
  },
  {
    name: "Humo de Roble",
    base: "Whisky ahumado · Miel · Nuez",
    note: "Servido bajo una campana de humo en mesa.",
    tone: "smoke",
  },
  {
    name: "Cristal de Cítrico",
    base: "Vodka · Yuzu · Clara de huevo",
    note: "Espuma tersa y sal de mar en el borde.",
    tone: "citrus",
  },
  {
    name: "Dorado Líquido",
    base: "Ron añejo · Naranja confitada",
    note: "Terminado con una gota de oro comestible.",
    tone: "gold",
  },
];

interface BarSetup {
  name: string;
  description: string;
  swatch: readonly [string, string, string];
}

const BAR_SETUPS: readonly BarSetup[] = [
  {
    name: "Barra Clásica",
    description:
      "Madera oscura, latón cepillado y cristalería de bar tradicional.",
    swatch: ["#2b1d12", "#d4af37", "#f1d98c"],
  },
  {
    name: "Barra Neón Ámbar",
    description:
      "Luces cálidas suspendidas sobre superficies de cristal reflectante.",
    swatch: ["#0b0f17", "#d4af37", "#ffffff"],
  },
  {
    name: "Barra Botánica",
    description: "Verdes profundos, flores comestibles y acentos dorados.",
    swatch: ["#1f2b1a", "#d4af37", "#9aa3b5"],
  },
];

function CocktailGlass({ tone }: { tone: CocktailTone }): ReactElement {
  const gradient = TONE_GRADIENTS[tone];
  return (
    <div className="relative mx-auto h-24 w-16" aria-hidden>
      <div
        className="absolute inset-0 border border-white/15"
        style={{
          clipPath: "polygon(18% 0%, 82% 0%, 72% 100%, 28% 100%)",
          background: `linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.06) 30%, ${gradient.from} 55%, ${gradient.to} 100%)`,
        }}
      />
      <div
        className="absolute left-[22%] top-[6%] h-[55%] w-[10%] rounded-full bg-white/25"
        style={{ filter: "blur(1px)" }}
      />
    </div>
  );
}

function CocktailCard({ cocktail }: { cocktail: Cocktail }): ReactElement {
  return (
    <li className="rounded-3xl border border-white/10 bg-brand-night-elevated/60 p-6 text-center backdrop-blur-xl">
      <CocktailGlass tone={cocktail.tone} />
      <h3 className="mt-6 font-display text-xl italic text-white">
        {cocktail.name}
      </h3>
      <p className="mt-2 font-sans text-xs uppercase tracking-[0.18em] text-brand-gold">
        {cocktail.base}
      </p>
      <p className="mt-3 font-sans text-sm leading-relaxed text-brand-mist">
        {cocktail.note}
      </p>
    </li>
  );
}

function BarSetupCard({
  setup,
  elevated,
}: {
  setup: BarSetup;
  elevated?: boolean;
}): ReactElement {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-brand-night-elevated/60 p-8 backdrop-blur-xl ${
        elevated ? "md:-translate-y-4" : ""
      }`}
    >
      <div className="flex gap-1.5">
        {setup.swatch.map((color) => (
          <span
            key={color}
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <h3 className="mt-5 font-display text-2xl italic text-white">
        {setup.name}
      </h3>
      <p className="mt-3 font-sans text-sm leading-relaxed text-brand-mist">
        {setup.description}
      </p>
    </div>
  );
}

export default function Home(): ReactElement {
  return (
    <div className="flex flex-1 flex-col bg-brand-night">
      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <span className="font-display text-lg italic tracking-wide text-white">
          Heisen<span className="text-brand-gold">Bar</span>
        </span>
        <a
          href="#cotizar"
          className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-brand-mist transition-colors hover:text-brand-gold"
        >
          Cotizar
        </a>
      </header>

      <AntigravityHero />

      <section id="carta" className="px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <p className="text-center font-sans text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold">
            Carta de autor
          </p>
          <h2 className="mt-4 text-center font-display text-3xl italic text-white sm:text-4xl">
            Tragos con luz de estudio
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center font-sans text-brand-mist">
            Cada cóctel se sirve como se fotografía: con precisión, textura y
            una gota de teatralidad.
          </p>
          <ul className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {COCKTAILS.map((cocktail) => (
              <CocktailCard key={cocktail.name} cocktail={cocktail} />
            ))}
          </ul>
        </div>
      </section>

      <div className="px-6 sm:px-10">
        <PourDivider className="opacity-70" />
      </div>

      <section id="montajes" className="px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <p className="text-center font-sans text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold">
            Montajes de barra
          </p>
          <h2 className="mt-4 text-center font-display text-3xl italic text-white sm:text-4xl">
            Tu barra, diseñada como escenografía
          </h2>
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {BAR_SETUPS.map((setup, index) => (
              <BarSetupCard key={setup.name} setup={setup} elevated={index === 1} />
            ))}
          </div>
        </div>
      </section>

      <section id="cotizar" className="px-6 py-28 sm:px-10">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-display text-3xl italic text-white sm:text-4xl">
            Contanos tu evento
          </h2>
          <p className="mt-4 font-sans text-brand-mist">
            La fecha, el lugar y el estilo que imaginás. Armamos la propuesta
            a tu medida.
          </p>
          <a
            href="mailto:hola@heisenbar.com"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-gold-bright via-brand-gold to-brand-gold-bright px-8 py-3.5 font-sans text-sm font-semibold tracking-wide text-brand-night shadow-[0_8px_30px_-6px_rgba(212,175,55,0.55)] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-gold-bright"
          >
            Cotizar mi Evento
          </a>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-10 text-center sm:px-10">
        <p className="font-sans text-xs uppercase tracking-[0.3em] text-brand-mist">
          HeisenBar — Barra de autor
        </p>
      </footer>
    </div>
  );
}
