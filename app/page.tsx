"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, ReactNode } from "react";
import {
  AnimatePresence,
  MotionConfig,
  easeInOut,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import type { MotionValue } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  Check,
  Download,
  ExternalLink,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  X,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Dati reali dal sito attuale e configurazione                              */
/* -------------------------------------------------------------------------- */

const SITE = {
  name: "Bioss Consulting",
  email: "info@biossconsulting.com",
  address: "Via Panfilo Castaldi, 8",
  city: "20124 Milano",
  callUrl: "https://cal.com/nuccio.sarcia",
  manageUrl: "https://www.manageplus.it/",
  policyPdf:
    "https://www.biossconsulting.com/includes/docs/ID_SGSI_Politica_Sicurezza_delle_Informazioni_e_della_Qualita%CC%80_del_Servizio.pdf",
  /** Da fornire: URL della pagina aziendale LinkedIn. Se vuoto, il link non viene mostrato. */
  linkedinUrl: "",
  /** Da fornire: URL dell'informativa privacy. Se vuoto, il consenso resta senza link. */
  privacyUrl: "",
};

/**
 * DESTINAZIONE DEL FORM. Da fornire.
 * Se vuoto, l'invio apre il programma di posta con il messaggio già compilato
 * e la pagina NON dichiara l'invio avvenuto.
 * Se valorizzato con un endpoint (Formspree, Resend, API propria), il form invia
 * un POST JSON e mostra il successo solo se la risposta è ok.
 */
const FORM_ENDPOINT = "";

const NAV = [
  { href: "#servizi", label: "Servizi" },
  { href: "#manage", label: "Manage+" },
  { href: "#metodo", label: "Metodo" },
  { href: "#contatti", label: "Contatti" },
];

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";
const FOCUS_ON_BLUE =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";
const EYEBROW = "text-xs font-semibold uppercase tracking-[0.22em] text-neutral";
const H2 =
  "text-[clamp(1.9rem,4.2vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.025em] text-ink";
const EASE = [0.22, 1, 0.36, 1] as const;

/* -------------------------------------------------------------------------- */
/*  Primitivi                                                                 */
/* -------------------------------------------------------------------------- */

type RevealKind = "up" | "left" | "right" | "scale";

function Reveal({
  kind = "up",
  delay = 0,
  className = "",
  children,
}: {
  kind?: RevealKind;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const from = {
    up: { opacity: 0, y: 36 },
    left: { opacity: 0, x: -48 },
    right: { opacity: 0, x: 48 },
    scale: { opacity: 0, scale: 0.94 },
  }[kind];
  return (
    <motion.div
      className={className}
      initial={from}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Titolo che entra parola per parola. Le parole tra asterischi hanno l'accento verde. */
function Words({
  text,
  className = "",
  as: Tag = "h2",
  delay = 0,
  id,
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
  delay?: number;
  id?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const tokens = text.split(" ");
  const plain = text.replace(/\*/g, "");
  const MotionTag = motion[Tag];
  let marking = false;
  return (
    <MotionTag ref={ref as never} id={id} className={className} aria-label={plain}>
      {tokens.map((raw, i) => {
        if (raw.startsWith("*")) marking = true;
        const mark = marking;
        if (raw.endsWith("*")) marking = false;
        const word = raw.replace(/\*/g, "");
        return (
          <span key={i} aria-hidden="true" className="inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] align-bottom">
            <motion.span
              className="relative inline-block"
              initial={{ y: "105%" }}
              animate={inView ? { y: "0%" } : undefined}
              transition={{ duration: 0.8, delay: delay + i * 0.045, ease: EASE }}
            >
              {mark && (
                <motion.span
                  className="absolute bottom-[0.04em] left-0 h-[0.17em] w-full origin-left rounded-full bg-accent"
                  initial={{ scaleX: 0 }}
                  animate={inView ? { scaleX: 1 } : undefined}
                  transition={{ duration: 0.9, delay: delay + 0.5 + i * 0.045, ease: EASE }}
                />
              )}
              <span className={`relative ${mark ? "text-primary" : ""}`}>{word}</span>
            </motion.span>
            {i < tokens.length - 1 ? " " : ""}
          </span>
        );
      })}
    </MotionTag>
  );
}

function Button({
  href,
  children,
  variant = "solid",
  onBlue = false,
  external = false,
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "solid" | "outline";
  onBlue?: boolean;
  external?: boolean;
  className?: string;
}) {
  const base =
    "group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-transform duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0";
  const look =
    variant === "solid"
      ? "bg-accent text-ink shadow-soft hover:shadow-[0_18px_40px_-16px_rgba(136,188,25,0.7)]"
      : onBlue
        ? "border border-white/70 text-white hover:border-white"
        : "border border-primary text-primary hover:bg-primary/5";
  return (
    <a
      href={href}
      className={`${base} ${look} ${onBlue ? FOCUS_ON_BLUE : FOCUS} ${className}`}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

/* -------------------------------------------------------------------------- */
/*  Fondale fisso: unico layer che dà continuità, con il motivo del cerchio    */
/* -------------------------------------------------------------------------- */

function FixedBackdrop() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 6000], [0, -260]);
  const y2 = useTransform(scrollY, [0, 6000], [0, -120]);
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <svg className="h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="dots" width="48" height="48" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" className="fill-primary" opacity="0.12" />
          </pattern>
        </defs>
        <rect width="1440" height="900" fill="url(#dots)" />
        <motion.g style={{ y: y1 }}>
          <ellipse cx="1180" cy="260" rx="420" ry="340" fill="none" className="stroke-primary" strokeOpacity="0.07" />
          <ellipse cx="1180" cy="260" rx="300" ry="240" fill="none" className="stroke-primary" strokeOpacity="0.07" />
          <motion.g
            style={{ transformBox: "view-box", transformOrigin: "1180px 260px" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 140, ease: "linear", repeat: Infinity }}
          >
            <circle cx="1180" cy="-40" r="7" className="fill-accent" opacity="0.8" />
          </motion.g>
        </motion.g>
        <motion.g style={{ y: y2 }}>
          <ellipse cx="140" cy="760" rx="360" ry="290" fill="none" className="stroke-primary" strokeOpacity="0.06" />
        </motion.g>
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Header                                                                    */
/* -------------------------------------------------------------------------- */

function Header() {
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const firstLink = useRef<HTMLAnchorElement | null>(null);
  const toggle = useRef<HTMLButtonElement | null>(null);
  useMotionValueEvent(scrollY, "change", (v) => setCompact(v > 24));

  useEffect(() => {
    if (!open) return;
    firstLink.current?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,padding] duration-500 ${
        compact || open ? "bg-surface/95 py-2.5 shadow-[0_12px_40px_-24px_rgba(11,34,57,0.35)]" : "bg-transparent py-5"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <a href="#top" className={`shrink-0 rounded ${FOCUS}`} aria-label="Bioss Consulting, torna all'inizio">
          {/* Logo a dimensione nativa 271x56: non viene ingrandito */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-biossconsulting.png" width={271} height={56} alt="Bioss Consulting, consulenza per l'innovazione" className="h-auto w-[200px] sm:w-[271px]" />
        </a>

        <nav aria-label="Principale" className="hidden items-center gap-8 lg:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className={`rounded text-sm font-semibold text-ink transition-colors hover:text-primary ${FOCUS}`}>
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {SITE.linkedinUrl && (
            <a
              href={SITE.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Bioss Consulting su LinkedIn"
              className={`hidden rounded-full p-2 text-ink transition-colors hover:text-primary sm:inline-flex ${FOCUS}`}
            >
              <Linkedin size={20} strokeWidth={1.5} />
            </a>
          )}
          <Button href="#contatti" className="hidden !px-6 !py-3 sm:inline-flex">
            Parla con noi
          </Button>
          <button
            ref={toggle}
            type="button"
            className={`inline-flex rounded-full p-2.5 text-ink lg:hidden ${FOCUS}`}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Chiudi il menu" : "Apri il menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="menu-mobile"
            aria-label="Menu mobile"
            className="mx-auto max-w-7xl px-5 pb-6 pt-4 sm:px-8 lg:hidden"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <ul className="flex flex-col">
              {NAV.map((n, i) => (
                <li key={n.href} className="border-t border-primary/15">
                  <a
                    ref={i === 0 ? firstLink : undefined}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between py-4 text-lg font-semibold text-ink ${FOCUS}`}
                  >
                    {n.label}
                    <ArrowRight size={20} strokeWidth={1.5} />
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-4">
              <Button href="#contatti" className="flex-1" >
                Parla con noi
              </Button>
              {SITE.linkedinUrl && (
                <a href={SITE.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="Bioss Consulting su LinkedIn" className={`rounded-full p-2 text-ink ${FOCUS}`}>
                  <Linkedin size={24} strokeWidth={1.5} />
                </a>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hero: dalla rete di dati dispersi al sistema leggibile                    */
/* -------------------------------------------------------------------------- */

const CENTER = { x: 800, y: 400 };
const RINGS = [
  { r: 95, n: 6, offset: 0 },
  { r: 175, n: 8, offset: 0.5 },
  { r: 255, n: 10, offset: 1 },
];
const SQUASH = 0.82;
const rnd = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

type HeroNodeData = { fx: number; fy: number; sx: number; sy: number; r: number; green: boolean; ring: number; j: number };
const HERO_NODES: HeroNodeData[] = [];
RINGS.forEach((ring, ri) => {
  for (let j = 0; j < ring.n; j++) {
    const a = (j / ring.n) * Math.PI * 2 + ring.offset - Math.PI / 2;
    const k = HERO_NODES.length;
    HERO_NODES.push({
      fx: CENTER.x + Math.cos(a) * ring.r,
      fy: CENTER.y + Math.sin(a) * ring.r * SQUASH,
      sx: 40 + rnd(k * 2) * 1120,
      sy: 70 + rnd(k * 2 + 1) * 660,
      r: ri === 2 ? 6 : 7,
      green: j === 2 && ri !== 0,
      ring: ri,
      j,
    });
  }
});
const STRAYS = Array.from({ length: 16 }, (_, i) => ({
  x: 40 + rnd(900 + i * 2) * 1120,
  y: 50 + rnd(901 + i * 2) * 700,
  r: 2 + rnd(i + 50) * 2,
}));
const HERO_EDGES = HERO_NODES.flatMap((n, i) => {
  if (n.ring === 0) return [{ x1: n.fx, y1: n.fy, x2: CENTER.x, y2: CENTER.y, i }];
  const prevRing = RINGS[n.ring - 1];
  const target = HERO_NODES.find((m) => m.ring === n.ring - 1 && m.j === Math.floor((n.j * prevRing.n) / RINGS[n.ring].n));
  return target ? [{ x1: n.fx, y1: n.fy, x2: target.fx, y2: target.fy, i }] : [];
});

function HeroNode({ n, i, p }: { n: HeroNodeData; i: number; p: MotionValue<number> }) {
  const start = (i % 6) * 0.025;
  const end = 0.6 + (i % 5) * 0.04;
  const x = useTransform(p, [start, end], [n.sx - n.fx, 0], { ease: easeInOut });
  const y = useTransform(p, [start, end], [n.sy - n.fy, 0], { ease: easeInOut });
  const grey = useTransform(p, [0.4, 0.78], [0.65, 0]);
  const solid = useTransform(p, [0.4, 0.78], [0, 1]);
  return (
    <motion.g style={{ x, y }}>
      <motion.circle cx={n.fx} cy={n.fy} r={n.r} className="fill-neutral" style={{ opacity: grey }} />
      <motion.circle cx={n.fx} cy={n.fy} r={n.r} className={n.green ? "fill-accent" : "fill-primary"} style={{ opacity: solid }} />
    </motion.g>
  );
}

function HeroEdge({ e, p }: { e: (typeof HERO_EDGES)[number]; p: MotionValue<number> }) {
  const a = 0.5 + (e.i % 8) * 0.02;
  const pathLength = useTransform(p, [a, 0.92], [0, 1], { ease: easeInOut });
  return (
    <motion.path
      d={`M${e.x1} ${e.y1} L${e.x2} ${e.y2}`}
      className="stroke-primary"
      strokeOpacity="0.45"
      strokeWidth="1.3"
      fill="none"
      style={{ pathLength }}
    />
  );
}

function HeroOrbit({ r, i, p }: { r: number; i: number; p: MotionValue<number> }) {
  const pathLength = useTransform(p, [0.3 + i * 0.1, 0.85], [0, 1], { ease: easeInOut });
  return (
    <motion.ellipse
      cx={CENTER.x}
      cy={CENTER.y}
      rx={r}
      ry={r * SQUASH}
      fill="none"
      className="stroke-primary"
      strokeOpacity="0.28"
      strokeWidth="1.2"
      strokeDasharray="2 7"
      style={{ pathLength, rotate: -90, transformBox: "fill-box", transformOrigin: "center" }}
    />
  );
}

function HeroScene({ p }: { p: MotionValue<number> }) {
  const strayOpacity = useTransform(p, [0, 0.7], [0.5, 0.18]);
  const coreScale = useTransform(p, [0.5, 0.85], [0.4, 1]);
  const coreOpacity = useTransform(p, [0.5, 0.8], [0, 1]);
  return (
    <svg
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      className="-ml-[64.3%] -mt-[14.3%] h-auto w-[171.4%] max-w-none lg:absolute lg:inset-0 lg:m-0 lg:h-full lg:w-full"
      role="img"
      aria-label="Una rete di punti dispersi che si dispone in orbite ordinate attorno a un nodo verde"
    >
      {RINGS.map((ring, i) => (
        <HeroOrbit key={ring.r} r={ring.r} i={i} p={p} />
      ))}
      {HERO_EDGES.map((e) => (
        <HeroEdge key={e.i} e={e} p={p} />
      ))}
      <motion.g style={{ opacity: strayOpacity }}>
        {STRAYS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} className="fill-neutral" />
        ))}
      </motion.g>
      {HERO_NODES.map((n, i) => (
        <HeroNode key={i} n={n} i={i} p={p} />
      ))}
      <motion.g style={{ scale: coreScale, opacity: coreOpacity, transformBox: "fill-box", transformOrigin: "center" }}>
        <circle cx={CENTER.x} cy={CENTER.y} r="38" fill="none" className="stroke-primary" strokeWidth="12" />
        <motion.circle
          cx={CENTER.x}
          cy={CENTER.y}
          r="19"
          className="fill-accent"
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          animate={{ scale: [1, 1.18, 1] }}
          transition={{ duration: 4.5, ease: "easeInOut", repeat: Infinity }}
        />
      </motion.g>
    </svg>
  );
}

function Stage({ p, range, children }: { p: MotionValue<number>; range: [number, number, number, number]; children: ReactNode }) {
  const opacity = useTransform(p, range, [0, 1, 1, 0]);
  return (
    <motion.li style={{ opacity }} className="absolute bottom-0 right-0 text-right text-xs font-semibold uppercase tracking-[0.22em] text-neutral">
      {children}
    </motion.li>
  );
}

function Hero() {
  const wrap = useRef<HTMLDivElement | null>(null);
  const [animated, setAnimated] = useState(false);
  const p = useMotionValue(1);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end end"] });

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1024px)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAnimated(wide.matches && !calm.matches);
    update();
    wide.addEventListener("change", update);
    calm.addEventListener("change", update);
    return () => {
      wide.removeEventListener("change", update);
      calm.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    p.set(animated ? scrollYProgress.get() : 1);
  }, [animated, p, scrollYProgress]);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (animated) p.set(v);
  });

  const hint = useTransform(p, [0, 0.12], [1, 0]);
  const bar = useTransform(p, [0, 1], [0, 1]);

  return (
    <div ref={wrap} id="top" style={animated ? { height: "320vh" } : undefined}>
      <div className="relative lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center lg:overflow-hidden">
        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-6 pt-32 sm:px-8 lg:pb-0 lg:pt-20">
          <div className="lg:w-[47%]">
            <motion.p
              className={EYEBROW}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              Strategia ICT e tecnologia per l&apos;innovazione
            </motion.p>
            <h1
              className="mt-5 text-[clamp(2.25rem,4.5vw,4rem)] font-bold leading-[1.02] tracking-[-0.035em] text-ink"
              aria-label="Dai dati di flusso alle decisioni che migliorano i processi."
            >
              {["Dai dati di flusso", "alle *decisioni* che", "migliorano i processi."].map((line, li) => (
                <span key={li} className="block overflow-hidden pb-[0.14em] -mb-[0.14em]" aria-hidden="true">
                  <motion.span
                    className="block"
                    initial={{ y: "108%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 1, delay: 0.15 + li * 0.12, ease: EASE }}
                  >
                    {line.split(" ").map((w, wi) =>
                      w.startsWith("*") ? (
                        <span key={wi}>
                          <span className="relative inline-block text-primary">
                            <span className="absolute bottom-[0.04em] left-0 h-[0.16em] w-full rounded-full bg-accent" />
                            <span className="relative">{w.replace(/\*/g, "")}</span>
                          </span>{" "}
                        </span>
                      ) : (
                        <span key={wi}>{w} </span>
                      ),
                    )}
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.p
              className="mt-6 max-w-xl text-base leading-relaxed text-neutral sm:text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.55, ease: EASE }}
            >
              Leggiamo i flussi di processi, sistemi e macchine, li trasformiamo in KPI e proponiamo le azioni correttive. Con metodo ITIL e certificazioni ISO 9001 e ISO 27001.
            </motion.p>
            <motion.div
              className="mt-9 flex flex-wrap items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.7, ease: EASE }}
            >
              <Button href="#contatti">
                Parla con noi
                <ArrowRight size={20} strokeWidth={1.5} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
              <Button href="#servizi" variant="outline">
                Vedi i servizi
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="relative aspect-[7/6] overflow-hidden sm:mx-auto sm:max-w-xl lg:absolute lg:inset-0 lg:aspect-auto lg:max-w-none">
          <HeroScene p={p} />
        </div>

        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-8 hidden lg:block">
          <div className="relative mx-auto h-5 max-w-7xl px-8">
            <motion.div style={{ opacity: hint }} className="absolute bottom-0 left-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-neutral">
              <span className="block h-px w-10 bg-neutral" />
              Scorri
            </motion.div>
            <ul className="absolute bottom-0 right-8 h-5 w-72">
              <Stage p={p} range={[0, 0.02, 0.28, 0.4]}>01 Dati dispersi</Stage>
              <Stage p={p} range={[0.3, 0.42, 0.66, 0.78]}>02 Flussi che si ordinano</Stage>
              <Stage p={p} range={[0.7, 0.88, 1, 1.01]}>03 Decisioni leggibili</Stage>
            </ul>
            <motion.span style={{ scaleX: bar }} className="absolute -bottom-3 left-8 right-8 h-px origin-left bg-accent" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Problema (PAS)                                                            */
/* -------------------------------------------------------------------------- */

function Problem() {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const line = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const endNode = useTransform(scrollYProgress, [0.85, 1], [0, 1]);

  const lines = [
    "Ridondanze che nessuno vede, perché stanno in sistemi diversi.",
    "Report che non si parlano e decisioni prese su dati parziali.",
    "Inefficienze che sembrano normale operatività.",
  ];

  return (
    <section ref={ref} className="relative px-5 py-28 sm:px-8 lg:py-40" aria-labelledby="problema-titolo">
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal>
            <p className={EYEBROW}>Il problema</p>
          </Reveal>
          <Words
            id="problema-titolo"
            as="h2"
            text="I dati ci sono. Quello che manca è *la lettura.*"
            className={`${H2} mt-5 text-[clamp(2.1rem,5vw,4.2rem)]`}
          />
          <Reveal delay={0.15} className="mt-8 max-w-xl">
            <p className="text-lg leading-relaxed text-neutral">
              Processi, sistemi e macchine producono flussi di dati ogni giorno. Finché nessuno li legge insieme, il costo delle inefficienze resta dentro il lavoro quotidiano.
            </p>
          </Reveal>
        </div>

        <div className="relative lg:col-span-5 lg:pt-24">
          <svg aria-hidden="true" className="absolute left-0 top-0 hidden h-full w-8 lg:block" viewBox="0 0 32 400" preserveAspectRatio="none">
            <motion.path d="M16 0 L16 380" className="stroke-primary" strokeWidth="1.5" fill="none" strokeOpacity="0.5" style={{ pathLength: line }} vectorEffect="non-scaling-stroke" />
          </svg>
          <motion.span aria-hidden="true" style={{ opacity: endNode, scale: endNode }} className="absolute bottom-6 left-[9px] hidden h-3.5 w-3.5 rounded-full bg-accent lg:block" />
          <ul className="space-y-10 lg:pl-14">
            {lines.map((l, i) => (
              <li key={l}>
                <Reveal kind="right" delay={i * 0.12}>
                  <p className="text-xl font-semibold leading-snug tracking-[-0.01em] text-ink sm:text-2xl">{l}</p>
                </Reveal>
              </li>
            ))}
          </ul>
          <Reveal delay={0.2} className="mt-12 lg:pl-14">
            <p className="text-base leading-relaxed text-neutral">
              Bioss Consulting misura i flussi IT, fissa i KPI giusti e propone azioni correttive che si possono verificare.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Servizi con selettore di ambiti                                           */
/* -------------------------------------------------------------------------- */

type Ambito = {
  id: string;
  num: string;
  nome: string;
  beneficio: string;
  testo: string;
  voci: string[];
};

const AMBITI: Ambito[] = [
  {
    id: "bi",
    num: "01",
    nome: "Business Intelligence",
    beneficio: "Vedi dove il processo perde tempo.",
    testo:
      "Analizziamo e riportiamo i dati di flusso IT di processi, sistemi e macchine. Individuiamo le inefficienze e impostiamo il miglioramento continuo secondo ITIL.",
    voci: ["Processi", "Sistemi", "Macchine", "ITIL"],
  },
  {
    id: "oss",
    num: "02",
    nome: "Operational Support Systems",
    beneficio: "Tieni sotto controllo reti e servizi.",
    testo:
      "Progettiamo e integriamo i sistemi di supporto operativo che governano la rete e i servizi, dall'inventario fino alla qualità percepita.",
    voci: [
      "Network Management",
      "Inventory",
      "CMMS",
      "CMDB",
      "Provisioning",
      "Fault Management",
      "Service Assurance",
      "Performance Management",
      "Quality Management",
    ],
  },
  {
    id: "it",
    num: "03",
    nome: "Consulenza IT",
    beneficio: "Elimina le ridondanze prima che costino.",
    testo:
      "Rivediamo in chiave strategica sistemi e processi esistenti. Definiamo i KPI che rendono visibili ridondanze e inefficienze e proponiamo le azioni correttive.",
    voci: ["Revisione strategica", "KPI", "Azioni correttive"],
  },
];

function VisualBI() {
  return (
    <svg viewBox="0 0 400 220" className="h-full w-full" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <motion.rect
          key={i}
          x={34 + i * 50}
          y={170 - [60, 90, 70, 120, 40, 110, 135][i]}
          width="26"
          height={[60, 90, 70, 120, 40, 110, 135][i]}
          rx="4"
          className={i === 4 ? "fill-accent" : "fill-primary"}
          fillOpacity={i === 4 ? 1 : 0.18}
          style={{ transformBox: "fill-box", transformOrigin: "bottom" }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.8, delay: i * 0.06, ease: EASE }}
        />
      ))}
      <motion.path
        d="M47 118 C 90 70, 120 130, 147 90 S 210 150, 247 128 S 320 60, 347 36"
        fill="none"
        className="stroke-primary"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.3, ease: EASE }}
      />
      <line x1="20" y1="172" x2="380" y2="172" className="stroke-primary" strokeOpacity="0.3" />
    </svg>
  );
}

function VisualOSS() {
  const spokes = Array.from({ length: 7 }, (_, i) => {
    const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
    return { x: 200 + Math.cos(a) * 118, y: 110 + Math.sin(a) * 82 };
  });
  return (
    <svg viewBox="0 0 400 220" className="h-full w-full" aria-hidden="true">
      <motion.ellipse cx="200" cy="110" rx="118" ry="82" fill="none" className="stroke-primary" strokeOpacity="0.3" strokeDasharray="2 6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: EASE }} />
      {spokes.map((s, i) => (
        <g key={i}>
          <motion.line x1="200" y1="110" x2={s.x} y2={s.y} className="stroke-primary" strokeOpacity="0.5" strokeWidth="1.3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.1 + i * 0.07, ease: EASE }} />
          <motion.circle cx={s.x} cy={s.y} r="8" className={i === 3 ? "fill-accent" : "fill-primary"} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ duration: 0.5, delay: 0.5 + i * 0.07, ease: EASE }} />
        </g>
      ))}
      <circle cx="200" cy="110" r="22" fill="none" className="stroke-primary" strokeWidth="8" />
      <circle cx="200" cy="110" r="10" className="fill-accent" />
    </svg>
  );
}

function VisualIT() {
  return (
    <svg viewBox="0 0 400 220" className="h-full w-full" aria-hidden="true">
      <motion.circle cy="110" r="68" className="fill-primary" fillOpacity="0.14" stroke="none" initial={{ cx: 120 }} animate={{ cx: 168 }} transition={{ duration: 1.3, ease: EASE }} />
      <motion.circle cy="110" r="68" fill="none" className="stroke-primary" strokeWidth="2" initial={{ cx: 120 }} animate={{ cx: 168 }} transition={{ duration: 1.3, ease: EASE }} />
      <motion.circle cy="110" r="68" className="fill-primary" fillOpacity="0.14" stroke="none" initial={{ cx: 280 }} animate={{ cx: 232 }} transition={{ duration: 1.3, ease: EASE }} />
      <motion.circle cy="110" r="68" fill="none" className="stroke-primary" strokeWidth="2" initial={{ cx: 280 }} animate={{ cx: 232 }} transition={{ duration: 1.3, ease: EASE }} />
      <motion.circle cx="200" cy="110" r="14" className="fill-accent" initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: "fill-box", transformOrigin: "center" }} transition={{ delay: 1, duration: 0.6, ease: EASE }} />
    </svg>
  );
}

const VISUALS: Record<string, () => ReactNode> = { bi: VisualBI, oss: VisualOSS, it: VisualIT };

function Services() {
  const [active, setActive] = useState(0);
  const base = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let next = i;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (i + 1) % AMBITI.length;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (i - 1 + AMBITI.length) % AMBITI.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = AMBITI.length - 1;
    else return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  const a = AMBITI[active];
  const Visual = VISUALS[a.id];

  return (
    <section id="servizi" className="relative scroll-mt-16 px-5 py-24 sm:px-8 lg:py-36" aria-labelledby="servizi-titolo">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className={EYEBROW}>Servizi</p>
        </Reveal>
        <Words id="servizi-titolo" as="h2" text="Tre ambiti, un solo obiettivo: *processi che rendono di più.*" className={`${H2} mt-5 max-w-4xl`} />

        <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div role="tablist" aria-label="Ambiti di intervento" aria-orientation="vertical" className="lg:col-span-6">
            {AMBITI.map((x, i) => (
              <button
                key={x.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                role="tab"
                id={`${base}-tab-${x.id}`}
                aria-selected={active === i}
                aria-controls={`${base}-panel`}
                tabIndex={active === i ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => onKey(e, i)}
                className={`group relative flex w-full items-baseline gap-5 border-t border-primary/20 py-6 text-left transition-colors last:border-b sm:gap-8 sm:py-8 ${FOCUS} ${
                  active === i ? "text-ink" : "text-neutral hover:text-ink"
                }`}
              >
                {active === i && (
                  <motion.span layoutId="ambito-marker" className="absolute left-0 top-0 h-[3px] w-full bg-accent" transition={{ duration: 0.5, ease: EASE }} />
                )}
                <span className="text-4xl font-light tabular-nums tracking-tight sm:text-5xl">{x.num}</span>
                <span className="text-xl font-bold leading-tight tracking-[-0.015em] sm:text-3xl">{x.nome}</span>
              </button>
            ))}
          </div>

          <div className="lg:col-span-6">
            <div
              role="tabpanel"
              id={`${base}-panel`}
              aria-labelledby={`${base}-tab-${a.id}`}
              tabIndex={0}
              className={`overflow-hidden rounded-2xl bg-white shadow-soft ${FOCUS}`}
            >
              <div className="aspect-[400/220] w-full bg-surface/60 p-4">
                <AnimatePresence mode="wait">
                  <motion.div key={a.id} className="h-full w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                    <Visual />
                  </motion.div>
                </AnimatePresence>
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={a.id} className="p-7 sm:p-9" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.45, ease: EASE }}>
                  <h3 className="text-2xl font-bold leading-tight tracking-[-0.02em] text-primary sm:text-3xl">{a.beneficio}</h3>
                  <p className="mt-4 text-base leading-relaxed text-neutral">{a.testo}</p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {a.voci.map((v) => (
                      <li key={v} className="rounded-full border border-primary/25 px-3.5 py-1.5 text-xs font-semibold text-primary">
                        {v}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Manage+                                                                   */
/* -------------------------------------------------------------------------- */

const TIMELINE = [
  { when: "Agosto 2025", what: "Ultima release di IWH+." },
  { when: "Dicembre 2025", what: "Manage+ arriva in release stabile." },
  { when: "Gennaio 2026", what: "Manage+ sostituisce IWH+ e SLAM+." },
  { when: "Gennaio 2027", what: "Termina la manutenzione di IWH+ e SLAM+." },
];

function ManagePlus() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const line = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="manage" className="relative scroll-mt-0 bg-primary px-5 py-24 text-white sm:px-8 lg:py-36" aria-labelledby="manage-titolo">
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/80">Prodotto</p>
          </Reveal>
          <Words id="manage-titolo" as="h2" text="Una suite al posto di tre prodotti." className="mt-5 text-[clamp(2rem,4.4vw,3.75rem)] font-bold leading-[1.05] tracking-[-0.025em] text-white" />
          <Reveal delay={0.1} className="mt-8 max-w-lg">
            <p className="text-lg leading-relaxed text-white/90">
              Manage+ riunisce e sostituisce IWH+, SLAM+ e NIMS+. Se usi IWH+ o SLAM+, la manutenzione resta attiva fino a gennaio 2027.
            </p>
          </Reveal>
          <Reveal delay={0.2} className="mt-10">
            <Button href={SITE.manageUrl} variant="outline" onBlue external>
              Vai a Manage+
              <ExternalLink size={20} strokeWidth={1.5} />
              <span className="sr-only">(si apre in una nuova scheda)</span>
            </Button>
          </Reveal>
        </div>

        <div ref={ref} className="relative lg:col-span-5 lg:col-start-8">
          <svg aria-hidden="true" className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-1" preserveAspectRatio="none" viewBox="0 0 4 100">
            <motion.path d="M2 0 L2 100" stroke="white" strokeOpacity="0.7" strokeWidth="1.5" fill="none" vectorEffect="non-scaling-stroke" style={{ pathLength: line }} />
          </svg>
          <ol className="space-y-10">
            {TIMELINE.map((t, i) => (
              <li key={t.when} className="relative pl-12">
                <motion.span
                  aria-hidden="true"
                  className={`absolute left-0 top-1 h-4 w-4 rounded-full ${i === 1 ? "bg-accent" : "bg-white"}`}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: "0px 0px -20% 0px" }}
                  transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
                />
                <Reveal kind="right" delay={i * 0.06}>
                  <p className="text-3xl font-light tracking-tight text-white sm:text-4xl">{t.when}</p>
                  <p className="mt-2 text-base text-white/90">{t.what}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Metodo e certificazioni                                                   */
/* -------------------------------------------------------------------------- */

const STEPS = [
  { t: "Misuriamo i flussi", d: "Raccogliamo i dati di processi, sistemi e macchine in un'unica lettura." },
  { t: "Fissiamo i KPI", d: "Definiamo gli indicatori che rendono visibili ridondanze e inefficienze." },
  { t: "Proponiamo le azioni", d: "Ogni evidenza diventa un intervento correttivo concreto." },
  { t: "Miglioriamo in continuo", d: "Il ciclo si ripete secondo ITIL e si misura di nuovo." },
];

function Method() {
  const ref = useRef<HTMLOListElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 70%"] });
  const line = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="metodo" className="relative scroll-mt-16 px-5 py-24 sm:px-8 lg:py-36" aria-labelledby="metodo-titolo">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className={EYEBROW}>Metodo e garanzie</p>
        </Reveal>
        <Words id="metodo-titolo" as="h2" text="Un metodo che *si può verificare.*" className={`${H2} mt-5 max-w-3xl`} />

        <div className="relative mt-16">
          <svg aria-hidden="true" className="absolute left-0 top-[9px] hidden h-1 w-full lg:block" preserveAspectRatio="none" viewBox="0 0 100 4">
            <motion.path d="M0 2 L100 2" className="stroke-primary" strokeOpacity="0.5" strokeWidth="1.5" fill="none" vectorEffect="non-scaling-stroke" style={{ pathLength: line }} />
          </svg>
          <ol ref={ref} className="grid gap-10 lg:grid-cols-4 lg:gap-8">
            {STEPS.map((s, i) => (
              <li key={s.t} className="relative lg:pt-12">
                <span aria-hidden="true" className={`absolute left-0 top-0 hidden h-5 w-5 rounded-full lg:block ${i === 0 ? "bg-accent" : "bg-primary"}`} />
                <Reveal delay={i * 0.1}>
                  <p className="text-5xl font-light tabular-nums tracking-tight text-primary">{`0${i + 1}`}</p>
                  <h3 className="mt-3 text-xl font-bold tracking-[-0.01em] text-ink">{s.t}</h3>
                  <p className="mt-2 text-base leading-relaxed text-neutral">{s.d}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-24 grid gap-10 border-t border-primary/20 pt-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <p className={EYEBROW}>Certificazioni</p>
            <p className="mt-4 max-w-xs text-lg leading-relaxed text-neutral">
              Qualità del servizio e sicurezza delle informazioni sono certificate, non dichiarate.
            </p>
          </Reveal>
          <Reveal kind="scale" delay={0.1} className="lg:col-span-4">
            <p className="text-[clamp(3.5rem,8vw,6.5rem)] font-light leading-none tracking-[-0.04em] text-primary">9001</p>
            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-ink">ISO · Qualità del servizio</p>
          </Reveal>
          <Reveal kind="scale" delay={0.2} className="lg:col-span-4">
            <p className="text-[clamp(3.5rem,8vw,6.5rem)] font-light leading-none tracking-[-0.04em] text-primary">27001</p>
            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-ink">ISO · Sicurezza delle informazioni</p>
          </Reveal>
        </div>
        <Reveal delay={0.1} className="mt-10">
          <a
            href={SITE.policyPdf}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 rounded text-sm font-semibold text-primary underline decoration-accent decoration-2 underline-offset-8 ${FOCUS}`}
          >
            <Download size={20} strokeWidth={1.5} />
            Scarica la Politica della Sicurezza delle Informazioni e della Qualità del Servizio
            <span className="sr-only">(PDF, si apre in una nuova scheda)</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Contatto: form con invio isolato                                          */
/* -------------------------------------------------------------------------- */

type Lead = { nome: string; azienda: string; ruolo: string; email: string; messaggio: string; consenso: boolean };
type Errors = Partial<Record<keyof Lead, string>>;
type SubmitResult = { status: "sent" } | { status: "mailto" };

/**
 * INVIO DEL FORM. Unico punto da collegare al servizio scelto.
 * Senza FORM_ENDPOINT apre la posta già compilata e restituisce "mailto":
 * l'interfaccia non dichiara l'invio, perché non è avvenuto.
 */
async function submitLead(lead: Lead): Promise<SubmitResult> {
  if (!FORM_ENDPOINT) {
    const body = [
      `Nome: ${lead.nome}`,
      `Azienda: ${lead.azienda}`,
      `Ruolo: ${lead.ruolo}`,
      `Email: ${lead.email}`,
      "",
      lead.messaggio,
    ].join("\n");
    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(`Richiesta di contatto da ${lead.nome}, ${lead.azienda}`)}&body=${encodeURIComponent(body)}`;
    return { status: "mailto" };
  }
  const res = await fetch(FORM_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(lead),
  });
  if (!res.ok) throw new Error(`Invio non riuscito (${res.status})`);
  return { status: "sent" };
}

function validate(l: Lead): Errors {
  const e: Errors = {};
  if (l.nome.trim().length < 2) e.nome = "Inserisci il tuo nome.";
  if (l.azienda.trim().length < 2) e.azienda = "Inserisci il nome dell'azienda.";
  if (l.ruolo.trim().length < 2) e.ruolo = "Indica il tuo ruolo.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(l.email.trim())) e.email = "Inserisci un indirizzo email valido.";
  if (l.messaggio.trim().length < 10) e.messaggio = "Scrivi almeno una riga su cosa vuoi capire.";
  if (!l.consenso) e.consenso = "Il consenso è necessario per ricontattarti.";
  return e;
}

const EMPTY: Lead = { nome: "", azienda: "", ruolo: "", email: "", messaggio: "", consenso: false };

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#B3261E]">
          <AlertCircle size={20} strokeWidth={1.5} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

const INPUT =
  "w-full rounded-2xl border bg-surface px-4 py-3.5 text-base text-ink transition-colors focus-visible:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary";

function ContactForm() {
  const base = useId();
  const [lead, setLead] = useState<Lead>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Lead, boolean>>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "mailto" | "error">("idle");
  const [failure, setFailure] = useState("");

  const set = <K extends keyof Lead>(k: K, v: Lead[K]) => {
    const next = { ...lead, [k]: v };
    setLead(next);
    if (touched[k]) setErrors((prev) => ({ ...prev, [k]: validate(next)[k] }));
  };
  const blur = (k: keyof Lead) => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors((prev) => ({ ...prev, [k]: validate(lead)[k] }));
  };

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    const found = validate(lead);
    setErrors(found);
    setTouched({ nome: true, azienda: true, ruolo: true, email: true, messaggio: true, consenso: true });
    const first = (Object.keys(found) as (keyof Lead)[])[0];
    if (first) {
      document.getElementById(`${base}-${first}`)?.focus();
      return;
    }
    setState("sending");
    try {
      const r = await submitLead(lead);
      setState(r.status);
    } catch (err) {
      setFailure(err instanceof Error ? err.message : "Errore sconosciuto");
      setState("error");
    }
  };

  const fid = (k: keyof Lead) => `${base}-${k}`;
  const aria = (k: keyof Lead) => ({
    "aria-invalid": errors[k] ? (true as const) : undefined,
    "aria-describedby": errors[k] ? `${fid(k)}-err` : undefined,
  });
  const border = (k: keyof Lead) => (errors[k] ? "border-[#B3261E]" : "border-primary/20");

  if (state === "sent" || state === "mailto") {
    return (
      <div role="status" className="rounded-2xl bg-white p-8 shadow-soft sm:p-10">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-ink">
          <Check size={24} strokeWidth={1.5} aria-hidden="true" />
        </span>
        {state === "sent" ? (
          <>
            <h3 className="mt-6 text-2xl font-bold tracking-[-0.02em] text-ink">Richiesta inviata.</h3>
            <p className="mt-3 text-base leading-relaxed text-neutral">Grazie, {lead.nome.trim()}. Ti rispondiamo all&apos;indirizzo {lead.email.trim()}.</p>
          </>
        ) : (
          <>
            <h3 className="mt-6 text-2xl font-bold tracking-[-0.02em] text-ink">Il messaggio è pronto nella tua posta.</h3>
            <p className="mt-3 text-base leading-relaxed text-neutral">
              Abbiamo aperto il tuo programma di posta con il testo già compilato. La richiesta parte solo quando premi invio da lì. Se non si è aperto, scrivi a{" "}
              <a href={`mailto:${SITE.email}`} className={`font-semibold text-primary underline ${FOCUS}`}>
                {SITE.email}
              </a>
              .
            </p>
          </>
        )}
        <button type="button" onClick={() => { setLead(EMPTY); setTouched({}); setErrors({}); setState("idle"); }} className={`mt-6 rounded text-sm font-semibold text-primary underline underline-offset-4 ${FOCUS}`}>
          Compila un nuovo messaggio
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Richiesta di contatto" className="rounded-2xl bg-white p-6 shadow-soft sm:p-10">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id={fid("nome")} label="Nome e cognome" error={errors.nome}>
          <input id={fid("nome")} name="nome" type="text" autoComplete="name" required value={lead.nome} onChange={(e) => set("nome", e.target.value)} onBlur={() => blur("nome")} className={`${INPUT} ${border("nome")}`} {...aria("nome")} />
        </Field>
        <Field id={fid("azienda")} label="Azienda" error={errors.azienda}>
          <input id={fid("azienda")} name="azienda" type="text" autoComplete="organization" required value={lead.azienda} onChange={(e) => set("azienda", e.target.value)} onBlur={() => blur("azienda")} className={`${INPUT} ${border("azienda")}`} {...aria("azienda")} />
        </Field>
        <Field id={fid("ruolo")} label="Ruolo" error={errors.ruolo}>
          <input id={fid("ruolo")} name="ruolo" type="text" autoComplete="organization-title" required value={lead.ruolo} onChange={(e) => set("ruolo", e.target.value)} onBlur={() => blur("ruolo")} className={`${INPUT} ${border("ruolo")}`} {...aria("ruolo")} />
        </Field>
        <Field id={fid("email")} label="Email di lavoro" error={errors.email}>
          <input id={fid("email")} name="email" type="email" autoComplete="email" required value={lead.email} onChange={(e) => set("email", e.target.value)} onBlur={() => blur("email")} className={`${INPUT} ${border("email")}`} {...aria("email")} />
        </Field>
      </div>
      <div className="mt-6">
        <Field id={fid("messaggio")} label="Cosa vuoi capire dei tuoi flussi IT?" error={errors.messaggio}>
          <textarea id={fid("messaggio")} name="messaggio" rows={5} required value={lead.messaggio} onChange={(e) => set("messaggio", e.target.value)} onBlur={() => blur("messaggio")} className={`${INPUT} ${border("messaggio")} resize-y`} {...aria("messaggio")} />
        </Field>
      </div>
      <div className="mt-6">
        <div className="flex items-start gap-3">
          <input
            id={fid("consenso")}
            name="consenso"
            type="checkbox"
            checked={lead.consenso}
            onChange={(e) => set("consenso", e.target.checked)}
            onBlur={() => blur("consenso")}
            className={`mt-1 h-5 w-5 shrink-0 cursor-pointer rounded accent-primary ${FOCUS}`}
            {...aria("consenso")}
          />
          <label htmlFor={fid("consenso")} className="text-sm leading-relaxed text-neutral">
            Acconsento al trattamento dei miei dati per essere ricontattato da Bioss Consulting
            {SITE.privacyUrl ? (
              <>
                . Ho letto l&apos;
                <a href={SITE.privacyUrl} target="_blank" rel="noopener noreferrer" className={`font-semibold text-primary underline ${FOCUS}`}>
                  informativa privacy
                </a>
              </>
            ) : null}
            .
          </label>
        </div>
        {errors.consenso && (
          <p id={`${fid("consenso")}-err`} className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#B3261E]">
            <AlertCircle size={20} strokeWidth={1.5} aria-hidden="true" />
            {errors.consenso}
          </p>
        )}
      </div>

      {state === "error" && (
        <div role="alert" className="mt-6 flex items-start gap-3 rounded-2xl border border-[#B3261E] bg-[#B3261E]/5 p-4 text-sm text-ink">
          <AlertCircle size={20} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[#B3261E]" aria-hidden="true" />
          <p>
            Non siamo riusciti a inviare la richiesta. Dettaglio: {failure}. Riprova, oppure scrivi a{" "}
            <a href={`mailto:${SITE.email}`} className={`font-semibold text-primary underline ${FOCUS}`}>
              {SITE.email}
            </a>
            .
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-7 py-4 text-sm font-semibold text-ink shadow-soft transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70 sm:w-auto ${FOCUS}`}
      >
        {state === "sending" ? "Invio in corso" : "Parla con noi"}
        <ArrowRight size={20} strokeWidth={1.5} aria-hidden="true" />
      </button>
    </form>
  );
}

function Contact() {
  return (
    <section id="contatti" className="relative scroll-mt-16 px-5 py-24 sm:px-8 lg:py-36" aria-labelledby="contatti-titolo">
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal>
            <p className={EYEBROW}>Contatti</p>
          </Reveal>
          <Words id="contatti-titolo" as="h2" text="Raccontaci dove *si perde tempo.*" className={`${H2} mt-5`} />
          <Reveal delay={0.1} className="mt-8">
            <p className="max-w-md text-lg leading-relaxed text-neutral">
              Una prima conversazione serve a capire il tuo contesto: quali flussi, quali sistemi, quali decisioni dipendono da dati che oggi non si leggono insieme.
            </p>
          </Reveal>
          <Reveal delay={0.2} className="mt-10 space-y-5">
            <a href={SITE.callUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-4 rounded font-semibold text-primary ${FOCUS}`}>
              <CalendarClock size={24} strokeWidth={1.5} aria-hidden="true" />
              <span className="underline decoration-accent decoration-2 underline-offset-8">Preferisci scegliere un orario? Fissa una call</span>
              <span className="sr-only">(si apre in una nuova scheda)</span>
            </a>
            <a href={`mailto:${SITE.email}`} className={`flex items-center gap-4 rounded text-ink ${FOCUS}`}>
              <Mail size={24} strokeWidth={1.5} aria-hidden="true" />
              {SITE.email}
            </a>
            <p className="flex items-start gap-4 text-ink">
              <MapPin size={24} strokeWidth={1.5} aria-hidden="true" className="shrink-0" />
              <span>
                {SITE.address}
                <br />
                {SITE.city}
              </span>
            </p>
          </Reveal>
        </div>
        <Reveal kind="up" delay={0.1} className="lg:col-span-7">
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Footer                                                                    */
/* -------------------------------------------------------------------------- */

function Footer() {
  return (
    <footer className="border-t border-primary/15 px-5 py-14 sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-biossconsulting.png" width={271} height={56} alt="Bioss Consulting" loading="lazy" className="h-auto w-[271px]" />
          <address className="mt-6 text-sm not-italic leading-relaxed text-neutral">
            {SITE.address}, {SITE.city}
            <br />
            <a href={`mailto:${SITE.email}`} className={`rounded text-primary underline underline-offset-4 ${FOCUS}`}>
              {SITE.email}
            </a>
          </address>
        </div>
        <nav aria-label="Link del sito" className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm font-semibold text-ink">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className={`rounded transition-colors hover:text-primary ${FOCUS}`}>
              {n.label}
            </a>
          ))}
          {SITE.privacyUrl && (
            <a href={SITE.privacyUrl} className={`rounded hover:text-primary ${FOCUS}`}>
              Privacy
            </a>
          )}
          <a href={SITE.policyPdf} target="_blank" rel="noopener noreferrer" className={`rounded hover:text-primary ${FOCUS}`}>
            Politica qualità e sicurezza
          </a>
          {SITE.linkedinUrl && (
            <a href={SITE.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="Bioss Consulting su LinkedIn" className={`rounded hover:text-primary ${FOCUS}`}>
              <Linkedin size={24} strokeWidth={1.5} />
            </a>
          )}
        </nav>
      </div>
      <p className="mx-auto mt-12 max-w-7xl text-xs text-neutral">© 2026 Bioss Consulting</p>
    </footer>
  );
}

/* -------------------------------------------------------------------------- */
/*  Pagina                                                                    */
/* -------------------------------------------------------------------------- */

export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
      <FixedBackdrop />
      <Header />
      <main className="overflow-x-clip">
        <Hero />
        <Problem />
        <Services />
        <ManagePlus />
        <Method />
        <Contact />
      </main>
      <Footer />
    </MotionConfig>
  );
}
