import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ArrowRight, Layers, Radar, TriangleAlert } from "lucide-react";
import { TopNav, Disclaimer } from "@/components/pipeguard/TopNav";
import { RECENT_ALERTS, SITES, TOTAL_MAPPED_UTILITIES } from "@/lib/pipeguard/data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Safety Dashboard — PipeGuard AI" },
      {
        name: "description",
        content: "Excavation safety overview: active sites, mapped utilities, excavation zones and recent conflict alerts.",
      },
      { property: "og:title", content: "Safety Dashboard — PipeGuard AI" },
      { property: "og:description", content: "Live overview of excavation risk across all mapped construction sites." },
    ],
  }),
  component: Dashboard,
});

const alertStyles = {
  "HIGH RISK": "border-risk-high/40 bg-risk-high/10 text-risk-high",
  CAUTION: "border-risk-caution/40 bg-risk-caution/10 text-risk-caution",
  "LOW RISK": "border-risk-low/40 bg-risk-low/10 text-risk-low",
} as const;

function Dashboard() {
  const cards = [
    { label: "Active Sites", value: SITES.filter((s) => s.status === "Active").length, icon: Radar, tone: "text-primary" },
    { label: "Mapped Utilities", value: TOTAL_MAPPED_UTILITIES, icon: Layers, tone: "text-util-water" },
    { label: "Excavation Zones", value: 12, icon: Activity, tone: "text-risk-low" },
    { label: "High-Risk Alerts", value: 3, icon: TriangleAlert, tone: "text-risk-high" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Safety Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Excavation risk overview across all surveyed construction sites.
            </p>
          </div>
          <Link
            to="/map"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Open Safety Map <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <c.icon size={18} className={c.tone} />
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-foreground">{c.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <section className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold text-foreground">Recent conflict alerts</h2>
            <ul className="mt-4 space-y-3">
              {RECENT_ALERTS.map((a, i) => (
                <li key={i} className={`rounded-xl border p-4 ${alertStyles[a.level]}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold tracking-wide">{a.level}</span>
                    <span className="text-xs text-muted-foreground">{a.time}</span>
                  </div>
                  <p className="mt-1.5 text-sm font-semibold text-foreground">{a.site}</p>
                  <p className="text-sm text-muted-foreground">{a.message}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold text-foreground">Sites</h2>
            <ul className="mt-4 space-y-3">
              {SITES.map((s) => (
                <li key={s.id} className="rounded-xl border border-border bg-background/50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{s.name}</p>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        s.status === "Active" ? "bg-risk-low/12 text-risk-low" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.utilities.length} mapped utilities · {s.riskZones} risk zones
                  </p>
                </li>
              ))}
            </ul>
            <Link
              to="/sites"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              View all sites <ArrowRight size={14} />
            </Link>
          </section>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-surface/60 p-4">
          <Disclaimer />
        </div>
      </main>
    </div>
  );
}
