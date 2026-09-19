import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, FileText, Printer } from "lucide-react";
import { TopNav } from "@/components/pipeguard/TopNav";
import { Logo } from "@/components/pipeguard/Logo";
import { SITES, UTILITY_META } from "@/lib/pipeguard/data";
import { useActiveSite, useExcavationZone } from "@/lib/pipeguard/store";
import { assessRisk, reasonText, recommendedAction, RISK_META, RISK_THRESHOLDS } from "@/lib/pipeguard/risk";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Excavation Safety Report — PipeGuard AI" },
      {
        name: "description",
        content: "Printable excavation safety report with zone specification, conflicting utilities, survey confidence and required actions.",
      },
      { property: "og:title", content: "Excavation Safety Report — PipeGuard AI" },
      { property: "og:description", content: "Generate and print a professional excavation safety report." },
    ],
  }),
  component: Reports,
});

function Reports() {
  const { siteId, site, selectSite } = useActiveSite();
  const { zone } = useExcavationZone(siteId);
  const result = zone ? assessRisk(site, zone) : null;
  const meta = result ? RISK_META[result.level] : null;
  const today = new Date().toISOString().slice(0, 10);
  const reportId = `PG-${site.id.toUpperCase().slice(0, 3)}-${today.replace(/-/g, "")}`;

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="no-print flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Safety Reports</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Report reflects the excavation zone currently placed on the safety map.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={siteId}
              onChange={(e) => selectSite(e.target.value)}
              className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground"
            >
              {SITES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Download size={16} /> Download PDF
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground hover:bg-surface-2"
            >
              <Printer size={16} /> Print Report
            </button>
          </div>
        </div>

        {!result || !meta ? (
          <div className="mt-8 rounded-2xl border border-border bg-surface p-10 text-center">
            <FileText className="mx-auto text-muted-foreground" size={28} />
            <p className="mt-3 text-sm text-muted-foreground">
              No excavation zone is currently defined for {site.name}.
            </p>
            <Link
              to="/map"
              className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Draw a zone on the safety map
            </Link>
          </div>
        ) : (
          <article className="print-sheet mt-6 rounded-2xl border border-border bg-surface p-8">
            <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
              <div className="flex items-center gap-3">
                <Logo size={40} />
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    PipeGuard AI — Excavation Safety Report
                  </h2>
                  <p className="text-sm text-muted-foreground">Report ID {reportId}</p>
                </div>
              </div>
              <div
                className="rounded-xl border px-4 py-2 text-sm font-bold"
                style={{ color: meta.color, borderColor: meta.color }}
              >
                {meta.label}
              </div>
            </header>

            <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              <Field label="Site" value={site.name} />
              <Field label="Location" value={site.location} />
              <Field label="Date issued" value={today} />
              <Field label="Contractor" value={site.contractor} />
              <Field
                label="Excavation zone"
                value={`${result.widthM.toFixed(1)} m × ${result.lengthM.toFixed(1)} m (${result.areaM2.toFixed(1)} m²)`}
              />
              <Field
                label="Zone origin (site grid)"
                value={`E ${(result.zone.x / 10).toFixed(1)} m, N ${(result.zone.y / 10).toFixed(1)} m`}
              />
              <Field label="Risk level" value={meta.label} valueStyle={{ color: meta.color }} />
              <Field
                label="Safety buffers applied"
                value={`High risk ≤ ${RISK_THRESHOLDS.highRiskBufferM} m · Caution ≤ ${RISK_THRESHOLDS.cautionBufferM} m`}
              />
            </dl>

            <section className="mt-8">
              <h3 className="text-base font-semibold text-foreground">Conflicting / nearby mapped utilities</h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs tracking-wide text-muted-foreground uppercase">
                      <th className="py-2 pr-4">Utility</th>
                      <th className="py-2 pr-4">Type</th>
                      <th className="py-2 pr-4">Est. depth</th>
                      <th className="py-2 pr-4">Min. distance</th>
                      <th className="py-2 pr-4">Survey confidence</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.conflicts.slice(0, 5).map((c) => (
                      <tr key={c.utility.id} className="border-b border-border/60">
                        <td className="py-2.5 pr-4 font-mono text-foreground">{c.utility.id}</td>
                        <td className="py-2.5 pr-4">{UTILITY_META[c.utility.type].label}</td>
                        <td className="py-2.5 pr-4">{c.utility.depth.toFixed(1)} m</td>
                        <td className="py-2.5 pr-4">{c.overlapping ? "Overlapping" : `${c.distanceM.toFixed(1)} m`}</td>
                        <td className="py-2.5 pr-4">{c.utility.confidence}%</td>
                        <td className="py-2.5 font-semibold" style={{ color: RISK_META[c.level].color }}>
                          {RISK_META[c.level].short}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-8 grid gap-5 sm:grid-cols-2">
              <Block title="Assessment reason" body={reasonText(result)} />
              <Block title="Recommended action" body={recommendedAction(result.level)} />
            </section>

            <footer className="mt-8 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
              This report is generated from simulated underground utility survey records for demonstration purposes.
              PipeGuard AI interprets existing survey/GPR/GIS data and does not physically detect underground
              utilities. Verify all utility locations using approved underground detection/survey equipment and
              obtain utility owner clearance before excavation.
            </footer>
          </article>
        )}
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  valueStyle,
}: {
  label: string;
  value: string;
  valueStyle?: React.CSSProperties;
}) {
  return (
    <div>
      <dt className="text-xs tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-foreground" style={valueStyle}>
        {value}
      </dd>
    </div>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-4">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
