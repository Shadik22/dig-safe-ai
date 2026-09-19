import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Building2, CircleCheck, Radar, TriangleAlert } from "lucide-react";
import { TopNav } from "@/components/pipeguard/TopNav";
import { SITES, UTILITY_META } from "@/lib/pipeguard/data";
import { useActiveSite } from "@/lib/pipeguard/store";

export const Route = createFileRoute("/sites")({
  head: () => ({
    meta: [
      { title: "Construction Sites — PipeGuard AI" },
      { name: "description", content: "Browse demo construction sites and open their underground utility safety maps." },
      { property: "og:title", content: "Construction Sites — PipeGuard AI" },
      { property: "og:description", content: "Three demo excavation sites with mapped utilities and risk zones." },
    ],
  }),
  component: SitesPage,
});

function SitesPage() {
  const { siteId, selectSite } = useActiveSite();
  const navigate = useNavigate();

  const open = (id: string) => {
    selectSite(id);
    void navigate({ to: "/map" });
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-foreground">Construction Sites</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a site to open its underground utility safety map.
        </p>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {SITES.map((site) => {
            const counts = site.utilities.reduce<Record<string, number>>((acc, u) => {
              acc[u.type] = (acc[u.type] ?? 0) + 1;
              return acc;
            }, {});
            return (
              <article
                key={site.id}
                className={`flex flex-col rounded-2xl border bg-surface p-6 transition-colors ${
                  siteId === site.id ? "border-primary/60" : "border-border hover:border-primary/40"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
                    <Building2 size={20} />
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      site.status === "Active"
                        ? "bg-risk-low/12 text-risk-low"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {site.status === "Active" ? <Radar size={13} /> : <CircleCheck size={13} />}
                    {site.status}
                  </span>
                </div>

                <h2 className="mt-4 text-lg font-semibold text-foreground">{site.name}</h2>
                <p className="text-sm text-muted-foreground">{site.location}</p>
                <p className="mt-1 text-xs text-muted-foreground">Contractor: {site.contractor}</p>

                <dl className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-background/50 px-3 py-3">
                    <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">Mapped utilities</dt>
                    <dd className="mt-1 font-display text-xl font-semibold text-foreground">
                      {site.utilities.length}
                    </dd>
                  </div>
                  <div className="rounded-xl border border-border bg-background/50 px-3 py-3">
                    <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">Risk zones</dt>
                    <dd
                      className={`mt-1 font-display text-xl font-semibold ${
                        site.riskZones > 0 ? "text-risk-caution" : "text-risk-low"
                      }`}
                    >
                      {site.riskZones}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.entries(counts).map(([type, n]) => {
                    const meta = UTILITY_META[type as keyof typeof UTILITY_META];
                    return (
                      <span
                        key={type}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
                      >
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
                        {meta.label} · {n}
                      </span>
                    );
                  })}
                </div>

                {site.riskZones > 0 && (
                  <p className="mt-4 inline-flex items-center gap-2 text-xs text-risk-caution">
                    <TriangleAlert size={14} /> Open excavation conflicts recorded on this site
                  </p>
                )}

                <button
                  onClick={() => open(site.id)}
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Open safety map <ArrowRight size={16} />
                </button>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
