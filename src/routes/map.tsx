import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Bot,
  Eraser,
  FileText,
  Layers,
  Locate,
  PencilRuler,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  X,
} from "lucide-react";
import { TopNav, Disclaimer } from "@/components/pipeguard/TopNav";
import { SafetyMap } from "@/components/pipeguard/SafetyMap";
import { SITES, UTILITY_META, type Utility } from "@/lib/pipeguard/data";
import { useActiveSite, useExcavationZone } from "@/lib/pipeguard/store";
import { assessRisk, reasonText, recommendedAction, RISK_META, RISK_THRESHOLDS } from "@/lib/pipeguard/risk";
import { answerQuestion, SUGGESTED_PROMPTS } from "@/lib/pipeguard/assistant";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Interactive Safety Map — PipeGuard AI" },
      {
        name: "description",
        content:
          "Interactive underground utility map with a draggable excavation zone, live what-if risk analysis and an AI safety assistant.",
      },
      { property: "og:title", content: "Interactive Safety Map — PipeGuard AI" },
      {
        property: "og:description",
        content: "Move the excavation zone and watch the excavation risk recalculate against mapped utilities instantly.",
      },
    ],
  }),
  component: SafetyMapPage,
});

type ChatMsg = { role: "user" | "assistant"; text: string };

function SafetyMapPage() {
  const { siteId, site, selectSite } = useActiveSite();
  const { zone, setZone, resetZone } = useExcavationZone(siteId);
  const [drawMode, setDrawMode] = useState(false);
  const [selected, setSelected] = useState<Utility | null>(null);
  const [analyzed, setAnalyzed] = useState(true);
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");

  const result = useMemo(() => (zone ? assessRisk(site, zone) : null), [site, zone]);
  const meta = result ? RISK_META[result.level] : null;

  useEffect(() => {
    setChat([]);
    setSelected(null);
  }, [siteId]);

  const ask = (question: string) => {
    if (!question.trim() || !result) return;
    const reply = answerQuestion(question, site, result);
    setChat((c) => [...c, { role: "user", text: question }, { role: "assistant", text: reply }]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={siteId}
              onChange={(e) => selectSite(e.target.value)}
              className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground"
            >
              {SITES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {site.location} · {site.utilities.length} mapped utilities
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDrawMode((v) => !v)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                drawMode
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-foreground hover:bg-surface-2"
              }`}
            >
              <PencilRuler size={16} /> {drawMode ? "Drawing… drag on map" : "Draw Excavation Zone"}
            </button>
            <button
              onClick={() => {
                setZone(null);
                setDrawMode(false);
                setAnalyzed(false);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-2"
            >
              <Eraser size={16} /> Clear Zone
            </button>
            <button
              onClick={resetZone}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-2"
            >
              <Locate size={16} /> Reset Demo Zone
            </button>
            <button
              onClick={() => setAnalyzed(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Activity size={16} /> Analyze Risk
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
          {/* Map */}
          <section className="relative overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="aspect-[1000/680] w-full">
              <SafetyMap
                site={site}
                zone={zone}
                onZoneChange={(r) => {
                  setZone(r);
                  setAnalyzed(true);
                }}
                result={analyzed ? result : null}
                drawMode={drawMode}
                onDrawComplete={() => {
                  setDrawMode(false);
                  setAnalyzed(true);
                }}
                selectedUtility={selected}
                onSelectUtility={setSelected}
              />
            </div>

            {/* Legend */}
            <div className="pointer-events-none absolute top-4 left-4 rounded-xl border border-border bg-background/85 p-3 backdrop-blur">
              <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                <Layers size={12} /> Utility legend
              </p>
              <ul className="space-y-1.5">
                {Object.entries(UTILITY_META).map(([k, m]) => (
                  <li key={k} className="flex items-center gap-2 text-xs text-foreground">
                    <span className="h-1.5 w-6 rounded-full" style={{ backgroundColor: m.color }} />
                    {m.label}
                  </li>
                ))}
              </ul>
            </div>

            <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
              Drag the excavation zone or pull its corner handle to resize — risk recalculates instantly. Click any
              utility line for its survey record.
            </p>
          </section>

          {/* Right column */}
          <div className="space-y-5">
            {/* Risk panel */}
            <section className={`rounded-2xl border p-6 ${meta && analyzed ? `${meta.border} ${meta.bg}` : "border-border bg-surface"}`}>
              {!zone || !result || !analyzed ? (
                <div className="text-center">
                  <ShieldCheck className="mx-auto text-muted-foreground" size={26} />
                  <p className="mt-3 text-sm text-muted-foreground">
                    No excavation zone analysed. Draw a zone on the map, then press Analyze Risk.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-3.5 w-3.5">
                      <span
                        className="pg-pulse absolute inline-flex h-full w-full rounded-full"
                        style={{ backgroundColor: meta!.color }}
                      />
                      <span className="relative inline-flex h-3.5 w-3.5 rounded-full" style={{ backgroundColor: meta!.color }} />
                    </span>
                    <h2 className="font-display text-xl font-bold" style={{ color: meta!.color }}>
                      {meta!.label}
                    </h2>
                  </div>

                  <p className="mt-3 text-sm text-foreground">
                    {result.level === "low"
                      ? "No mapped utility conflict detected within the configured safety buffer."
                      : "Potential utility conflict detected."}
                  </p>

                  <dl className="mt-5 grid grid-cols-2 gap-3">
                    <Stat label="Utility" value={result.primary?.utility.name ?? "None in buffer"} />
                    <Stat label="Estimated depth" value={result.primary ? `${result.primary.utility.depth.toFixed(1)} m` : "—"} />
                    <Stat
                      label="Closest distance"
                      value={
                        result.conflicts[0]
                          ? result.conflicts[0].overlapping
                            ? "0.0 m (overlap)"
                            : `${result.conflicts[0].distanceM.toFixed(1)} m`
                          : "—"
                      }
                    />
                    <Stat
                      label="Survey confidence"
                      value={result.primary ? `${result.primary.utility.confidence}%` : `${result.conflicts[0]?.utility.confidence ?? "—"}%`}
                    />
                    <Stat label="Zone size" value={`${result.widthM.toFixed(1)} × ${result.lengthM.toFixed(1)} m`} />
                    <Stat label="Zone area" value={`${result.areaM2.toFixed(1)} m²`} />
                  </dl>

                  <div className="mt-5 space-y-3 text-sm">
                    <div>
                      <p className="text-xs tracking-wide text-muted-foreground uppercase">Reason</p>
                      <p className="mt-1 text-foreground">{reasonText(result)}</p>
                    </div>
                    <div>
                      <p className="text-xs tracking-wide text-muted-foreground uppercase">Recommended action</p>
                      <p className="mt-1 text-foreground">{recommendedAction(result.level)}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelected(result.primary?.utility ?? result.conflicts[0]?.utility ?? null)}
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-2"
                    >
                      <TriangleAlert size={16} /> View Conflict
                    </button>
                    <Link
                      to="/reports"
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
                    >
                      <FileText size={16} /> Generate Safety Report
                    </Link>
                  </div>

                  <p className="mt-4 text-xs text-muted-foreground">
                    Buffers: high risk ≤ {RISK_THRESHOLDS.highRiskBufferM} m · caution ≤ {RISK_THRESHOLDS.cautionBufferM} m.
                    Always verify underground utilities before excavation.
                  </p>
                </>
              )}
            </section>

            {/* AI assistant */}
            <section className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-foreground">
                <Bot size={18} className="text-primary" /> AI Safety Assistant
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                AI-assisted interpretation of the available survey data — not direct underground sensing.
              </p>

              <div className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
                <div className="rounded-xl border border-primary/25 bg-primary/8 p-3 text-sm leading-relaxed text-foreground">
                  <Sparkles size={14} className="mr-1.5 inline text-primary" />
                  {result ? answerQuestion("What is causing the risk?", site, result) : "Define an excavation zone to get a risk interpretation."}
                </div>
                {chat.map((m, i) => (
                  <div
                    key={i}
                    className={`rounded-xl p-3 text-sm leading-relaxed whitespace-pre-line ${
                      m.role === "user"
                        ? "ml-6 bg-surface-2 text-foreground"
                        : "border border-border bg-background/50 text-muted-foreground"
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => ask(p)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                  >
                    {p}
                  </button>
                ))}
              </div>

              <form
                className="mt-4 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  ask(input);
                }}
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about this excavation zone…"
                  className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-4 text-primary-foreground hover:opacity-90"
                  aria-label="Send question"
                >
                  <Send size={16} />
                </button>
              </form>
            </section>

            <div className="rounded-xl border border-border bg-surface/60 p-4">
              <Disclaimer />
            </div>
          </div>
        </div>
      </main>

      {/* Utility detail panel */}
      {selected && (
        <aside className="no-print fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-border bg-surface p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ backgroundColor: `${UTILITY_META[selected.type].color}22`, color: UTILITY_META[selected.type].color }}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: UTILITY_META[selected.type].color }} />
                {UTILITY_META[selected.type].label}
              </span>
              <h2 className="mt-3 text-xl font-bold text-foreground">{selected.name}</h2>
              <p className="font-mono text-sm text-muted-foreground">{selected.id}</p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="rounded-md p-2 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              aria-label="Close utility details"
            >
              <X size={18} />
            </button>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3">
            <Stat label="Estimated depth" value={`${selected.depth.toFixed(1)} m`} />
            <Stat label="Diameter" value={selected.diameter} />
            <Stat label="Material" value={selected.material} />
            <Stat label="Last surveyed" value={selected.surveyed} />
            <Stat label="Survey confidence" value={`${selected.confidence}%`} />
            <Stat label="Condition" value={selected.condition} />
            <Stat label="Owner" value={selected.owner} />
            <Stat
              label="Zone relationship"
              value={
                result
                  ? (() => {
                      const c = result.conflicts.find((x) => x.utility.id === selected.id);
                      if (!c) return "—";
                      return c.overlapping ? "Overlapping zone" : `${c.distanceM.toFixed(1)} m from zone`;
                    })()
                  : "No zone defined"
              }
            />
          </dl>

          <div className="mt-6 rounded-xl border border-border bg-background/50 p-4">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShieldAlert size={16} className="text-risk-caution" /> Nearby excavation zones
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {result && result.conflicts.find((x) => x.utility.id === selected.id)?.level !== "low"
                ? `Active proposed zone on ${site.name} falls inside this utility's safety buffer.`
                : `No active proposed zone within the configured buffer of ${selected.id}.`}
            </p>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            Values come from simulated survey/GPR records. Depth and route are estimates at {selected.confidence}%
            confidence — verify on site before excavation.
          </p>
        </aside>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/50 px-3 py-2.5">
      <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-foreground">{value}</dd>
    </div>
  );
}
