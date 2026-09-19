import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, FileText, Map, Radar, ShieldCheck, Waves } from "lucide-react";
import { TopNav, Disclaimer } from "@/components/pipeguard/TopNav";
import { Logo } from "@/components/pipeguard/Logo";
import { UTILITY_META } from "@/lib/pipeguard/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PipeGuard AI — Know What's Underneath Before You Dig" },
      {
        name: "description",
        content:
          "PipeGuard AI turns underground utility survey data into an interactive excavation-risk map with instant conflict detection and safety reports.",
      },
      { property: "og:title", content: "PipeGuard AI — Excavation Safety Intelligence" },
      {
        property: "og:description",
        content:
          "Interactive underground utility mapping, deterministic excavation risk analysis and printable safety reports.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Map,
    title: "Underground Utility Mapping",
    body: "Survey, GPR and GIS records are rendered as curved, realistic utility routes with depth, material and confidence for every line.",
  },
  {
    icon: Radar,
    title: "Excavation Risk Analysis",
    body: "Draw a proposed dig zone and a deterministic engine measures clearance to every mapped utility — high risk, caution or low risk.",
  },
  {
    icon: FileText,
    title: "Safety Reports",
    body: "Generate a printable excavation safety report with conflicting utilities, minimum distance, survey confidence and required actions.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <section className="relative overflow-hidden">
        <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />

        <div className="relative mx-auto grid max-w-[1500px] items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
              <ShieldCheck size={14} /> Excavation safety decision support
            </span>
            <h1 className="mt-6 text-4xl leading-[1.05] font-bold text-foreground sm:text-5xl lg:text-6xl">
              Prevent Underground Utility Damage{" "}
              <span className="text-primary">Before You Dig.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              PipeGuard AI transforms underground utility survey data into an interactive excavation-risk map — so
              crews know what is beneath the ground before the first bucket breaks it.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/map"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                Open Safety Map <ArrowRight size={16} />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-6 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2"
              >
                View Demo
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {Object.entries(UTILITY_META).map(([key, m]) => (
                <span key={key} className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-6 rounded-full" style={{ backgroundColor: m.color }} />
                  {m.label}
                </span>
              ))}
            </div>
          </div>

          <HeroPanel />
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 pb-16 sm:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          {FEATURES.map((f) => (
            <article
              key={f.title}
              className="rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-primary/40"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
                <f.icon size={20} />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex items-start gap-3 rounded-xl border border-border bg-surface/60 p-4">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-risk-caution" />
          <Disclaimer />
        </div>
      </section>

      <footer className="border-t border-border/70 py-8">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:px-6">
          <span className="inline-flex items-center gap-2">
            <Logo size={22} /> PipeGuard AI — hackathon prototype
          </span>
          <span>Before you dig, know what&apos;s underneath.</span>
        </div>
      </footer>
    </div>
  );
}

function HeroPanel() {
  return (
    <div className="relative rounded-3xl border border-border bg-surface/80 p-5 shadow-2xl shadow-black/40">
      <div className="flex items-center justify-between pb-4">
        <span className="font-display text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Site Alpha — live conflict preview
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-risk-high/40 bg-risk-high/10 px-3 py-1 text-xs font-bold text-risk-high">
          <span className="h-2 w-2 rounded-full bg-risk-high" /> HIGH RISK
        </span>
      </div>

      <svg viewBox="0 0 520 330" className="w-full rounded-2xl bg-[rgba(11,20,34,1)]">
        <defs>
          <pattern id="hero-grid" width="26" height="26" patternUnits="userSpaceOnUse">
            <path d="M 26 0 L 0 0 0 26" fill="none" stroke="rgba(148,180,220,0.12)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="520" height="330" fill="url(#hero-grid)" />
        <rect x="40" y="36" width="130" height="80" rx="5" fill="rgba(148,175,205,0.14)" stroke="rgba(190,214,240,0.3)" />
        <rect x="360" y="210" width="120" height="82" rx="5" fill="rgba(148,175,205,0.14)" stroke="rgba(190,214,240,0.3)" />
        <path d="M0 170 C 140 150, 260 210, 520 180" stroke="rgba(160,178,200,0.2)" strokeWidth="26" fill="none" />
        <path d="M0 120 C 150 100, 300 150, 520 118" stroke="#3b82f6" strokeWidth="5" fill="none" />
        <path d="M0 120 C 150 100, 300 150, 520 118" stroke="#fff" strokeWidth="1.6" fill="none" className="pg-flow" opacity="0.8" />
        <path d="M0 250 C 160 270, 320 225, 520 258" stroke="#facc15" strokeWidth="4.5" fill="none" />
        <path d="M120 0 C 140 120, 100 220, 130 330" stroke="#a855f7" strokeWidth="4.5" fill="none" />
        <path d="M0 300 C 180 315, 340 285, 520 305" stroke="#fb923c" strokeWidth="4" fill="none" />
        <rect x="205" y="96" width="140" height="92" rx="4" fill="rgba(239,68,68,0.18)" stroke="#ef4444" strokeWidth="3" />
        <text x="207" y="88" fill="#ef4444" fontSize="13" fontWeight="700" fontFamily="var(--font-mono)">
          EXCAVATION ZONE
        </text>
        <circle cx="272" cy="126" r="14" fill="none" stroke="#ef4444" strokeWidth="3" className="pg-pulse" />
        <circle cx="272" cy="126" r="6" fill="#ef4444" />
        <text x="18" y="112" fill="#3b82f6" fontSize="13" fontWeight="700" fontFamily="var(--font-mono)">
          W-102
        </text>
      </svg>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        {[
          { label: "Utility", value: "W-102", icon: Waves },
          { label: "Est. depth", value: "1.4 m" },
          { label: "Confidence", value: "94%" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-background/60 px-3 py-3">
            <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{s.label}</p>
            <p className="mt-1 font-display text-base font-semibold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
