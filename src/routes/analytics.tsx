import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TopNav, Disclaimer } from "@/components/pipeguard/TopNav";
import { SITES, UTILITY_META, type UtilityType } from "@/lib/pipeguard/data";
import { assessRisk } from "@/lib/pipeguard/risk";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Risk Analytics — PipeGuard AI" },
      {
        name: "description",
        content: "Risk distribution across analysed excavation zones and mapped utility types in the PipeGuard AI demo dataset.",
      },
      { property: "og:title", content: "Risk Analytics — PipeGuard AI" },
      { property: "og:description", content: "Demo-project analytics for excavation zones, conflicts and utility types." },
    ],
  }),
  component: Analytics,
});

function Analytics() {
  // Deterministic project data: evaluate each site's demo zones with the same risk engine.
  const evaluated = SITES.flatMap((site) => [
    { site, result: assessRisk(site, site.defaultZone) },
    { site, result: assessRisk(site, site.safeZone) },
  ]);

  const high = evaluated.filter((e) => e.result.level === "high").length;
  const caution = evaluated.filter((e) => e.result.level === "caution").length;
  const low = evaluated.filter((e) => e.result.level === "low").length;

  const typeCounts = SITES.flatMap((s) => s.utilities).reduce<Record<string, number>>((acc, u) => {
    acc[u.type] = (acc[u.type] ?? 0) + 1;
    return acc;
  }, {});

  const pieData = [
    { name: "High risk", value: high, color: "#ef4444" },
    { name: "Caution", value: caution, color: "#facc15" },
    { name: "Low risk", value: low, color: "#22c55e" },
  ].filter((d) => d.value > 0);

  const barData = Object.entries(typeCounts).map(([type, count]) => ({
    name: UTILITY_META[type as UtilityType].label,
    count,
    color: UTILITY_META[type as UtilityType].color,
  }));

  const cards = [
    { label: "Excavation zones analysed", value: evaluated.length, tone: "text-foreground" },
    { label: "High-risk conflicts", value: high, tone: "text-risk-high" },
    { label: "Caution zones", value: caution, tone: "text-risk-caution" },
    { label: "Safe zones", value: low, tone: "text-risk-low" },
    { label: "Utility types detected", value: Object.keys(typeCounts).length, tone: "text-primary" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-foreground">Risk Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Figures are computed live from the demo project data using the same deterministic risk engine as the map.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {cards.map((c) => (
            <div key={c.label} className="rounded-2xl border border-border bg-surface p-5">
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <p className={`mt-3 font-display text-3xl font-bold ${c.tone}`}>{c.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <section className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold text-foreground">Risk distribution</h2>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={104} paddingAngle={3}>
                    {pieData.map((d) => (
                      <Cell key={d.name} fill={d.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.235 0.036 256)",
                      border: "1px solid oklch(0.34 0.035 256)",
                      borderRadius: 12,
                      color: "white",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              {pieData.map((d) => (
                <li key={d.name} className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name} · {d.value}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold text-foreground">Mapped utilities by type</h2>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="name" stroke="rgba(226,240,255,0.55)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(226,240,255,0.55)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    contentStyle={{
                      background: "oklch(0.235 0.036 256)",
                      border: "1px solid oklch(0.34 0.035 256)",
                      borderRadius: 12,
                      color: "white",
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {barData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-surface/60 p-4">
          <Disclaimer />
        </div>
      </main>
    </div>
  );
}
