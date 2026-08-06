"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { CSSProperties, ReactElement } from "react";

interface Particle {
  left: string;
  size: number;
  duration: number;
  delay: number;
  driftX: number;
  opacity: number;
}

/**
 * Posiciones fijas (no Math.random) para evitar mismatch de hidratación
 * entre el render de servidor y cliente.
 */
const PARTICLES: readonly Particle[] = [
  { left: "8%", size: 3, duration: 14, delay: 0, driftX: 14, opacity: 0.5 },
  { left: "18%", size: 2, duration: 18, delay: 2.4, driftX: -10, opacity: 0.35 },
  { left: "27%", size: 4, duration: 12, delay: 1.1, driftX: 8, opacity: 0.4 },
  { left: "35%", size: 2, duration: 20, delay: 4, driftX: -16, opacity: 0.3 },
  { left: "44%", size: 3, duration: 15, delay: 0.6, driftX: 10, opacity: 0.45 },
  { left: "52%", size: 2, duration: 17, delay: 3.2, driftX: -8, opacity: 0.35 },
  { left: "60%", size: 3, duration: 13, delay: 1.8, driftX: 12, opacity: 0.4 },
  { left: "68%", size: 2, duration: 19, delay: 5, driftX: -14, opacity: 0.3 },
  { left: "75%", size: 4, duration: 11, delay: 0.3, driftX: 6, opacity: 0.4 },
  { left: "82%", size: 2, duration: 21, delay: 2.9, driftX: -10, opacity: 0.3 },
  { left: "90%", size: 3, duration: 16, delay: 4.6, driftX: 14, opacity: 0.4 },
  { left: "95%", size: 2, duration: 18, delay: 3.7, driftX: -12, opacity: 0.3 },
];

/** Índice a partir del cual las partículas se ocultan en móvil (menor densidad, ver .claude/rules/antigravity-ui.md). */
const MOBILE_PARTICLE_LIMIT = 6;

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

/**
 * Divisor "pour line": alude al gesto de servir con precisión (medida exacta),
 * elemento de firma reutilizado como separador entre secciones de la landing.
 */
export function PourDivider({ className }: { className?: string }): ReactElement {
  return (
    <svg
      aria-hidden
      className={`pointer-events-none h-10 w-full text-brand-gold ${className ?? ""}`}
      viewBox="0 0 1200 40"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="pour-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.8" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 20 C 200 2, 400 38, 600 20 S 1000 2, 1200 20"
        fill="none"
        stroke="url(#pour-gradient)"
        strokeWidth="1.5"
        style={{ filter: "drop-shadow(0 0 6px rgba(212,175,55,0.4))" }}
      />
    </svg>
  );
}

export function AntigravityHero(): ReactElement {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="inicio"
      className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden bg-brand-night px-6 py-24"
    >
      {/* Iluminación focal de estudio */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 32%, rgba(212,175,55,0.16) 0%, rgba(212,175,55,0.05) 38%, rgba(11,15,23,0) 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(35% 30% at 50% 0%, rgba(255,255,255,0.08), rgba(11,15,23,0) 70%)",
        }}
      />

      {/* Partículas de ambiente (mist rising) */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {PARTICLES.map((particle, index) => {
          const style: CSSProperties & Record<string, string | number> = {
            left: particle.left,
            width: particle.size,
            height: particle.size,
            "--drift-x": `${particle.driftX}px`,
            "--drift-duration": `${particle.duration}s`,
            "--drift-delay": `${particle.delay}s`,
            "--particle-opacity": particle.opacity,
          };
          return (
            <span
              key={particle.left + index}
              className={`heisenbar-particle absolute bottom-0 rounded-full bg-brand-gold-bright ${
                index >= MOBILE_PARTICLE_LIMIT ? "hidden sm:block" : ""
              }`}
              style={style}
            />
          );
        })}
      </div>

      <motion.div
        initial={reduceMotion ? "show" : "hidden"}
        animate="show"
        variants={containerVariants}
        className="relative w-full max-w-2xl rounded-[32px] border border-white/10 bg-white/[0.04] p-8 text-center shadow-[0_0_120px_-20px_rgba(212,175,55,0.35)] backdrop-blur-2xl sm:p-12"
      >
        <motion.p
          variants={itemVariants}
          className="font-sans text-xs font-semibold uppercase tracking-[0.3em] text-brand-gold"
        >
          <span className="mr-2 inline-block h-px w-6 -translate-y-1 bg-brand-gold align-middle" />
          Barra de autor para eventos
        </motion.p>

        <motion.h1
          variants={itemVariants}
          className="mt-6 font-display text-5xl italic leading-[1.05] text-white sm:text-6xl"
        >
          La precisión{" "}
          <span className="bg-gradient-to-r from-brand-gold-bright via-brand-gold to-brand-gold-bright bg-clip-text text-transparent">
            es el lujo.
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mx-auto mt-6 max-w-md text-balance font-sans text-base leading-relaxed text-brand-mist sm:text-lg"
        >
          Cócteles de estudio y montajes de barra a medida para bodas, eventos
          corporativos y celebraciones privadas.
        </motion.p>

        <motion.div variants={itemVariants} className="mt-10">
          <a
            href="#cotizar"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-gold-bright via-brand-gold to-brand-gold-bright px-8 py-3.5 font-sans text-sm font-semibold tracking-wide text-brand-night shadow-[0_8px_30px_-6px_rgba(212,175,55,0.55)] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-gold-bright"
          >
            Cotizar mi Evento
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </a>
        </motion.div>
      </motion.div>

      <PourDivider className="absolute inset-x-0 bottom-0" />
    </section>
  );
}
