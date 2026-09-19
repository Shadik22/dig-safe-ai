import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RotateCcw, Save, ShieldCheck } from "lucide-react";
import { TopNav, Disclaimer } from "@/components/pipeguard/TopNav";
import { RISK_THRESHOLDS } from "@/lib/pipeguard/risk";
import { SITES } from "@/lib/pipeguard/data";
import { useActiveSite } from "@/lib/pipeguard/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — PipeGuard AI" },
      { name: "description", content: "Configure excavation safety buffers, units and the default construction site." },
      { property: "og:title", content: "Settings — PipeGuard AI" },
      { property: "og:description", content: "Prototype configuration for safety buffers and default site selection." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { siteId, selectSite } = useActiveSite();
  const [high, setHigh] = useState(RISK_THRESHOLDS.highRiskBufferM);
  const [caution, setCaution] = useState(RISK_THRESHOLDS.cautionBufferM);
  const [saved, setSaved] = useState(false);

  const save = () => {
    RISK_THRESHOLDS.highRiskBufferM = high;
    RISK_THRESHOLDS.cautionBufferM = Math.max(caution, high);
    setCaution(Math.max(caution, high));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const reset = () => {
    setHigh(0.5);
    setCaution(2);
    RISK_THRESHOLDS.highRiskBufferM = 0.5;
    RISK_THRESHOLDS.cautionBufferM = 2;
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Prototype configuration. Buffer thresholds feed directly into the deterministic risk engine.
        </p>

        <section className="mt-6 rounded-2xl border border-border bg-surface p-6">
          <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-foreground">
            <ShieldCheck size={18} className="text-primary" /> Excavation safety buffers
          </h2>

          <div className="mt-5 space-y-6">
            <Slider
              label="High risk buffer (Do not dig)"
              hint="Any mapped utility within this distance of the zone triggers HIGH RISK."
              value={high}
              min={0.2}
              max={3}
              onChange={setHigh}
              tone="accent-[oklch(0.63_0.23_27)]"
            />
            <Slider
              label="Caution buffer"
              hint="Utilities inside this distance but outside the high-risk buffer trigger CAUTION."
              value={caution}
              min={0.5}
              max={8}
              onChange={setCaution}
              tone="accent-[oklch(0.85_0.17_92)]"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={save}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Save size={16} /> {saved ? "Saved" : "Save thresholds"}
            </button>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground hover:bg-surface-2"
            >
              <RotateCcw size={16} /> Restore defaults
            </button>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-foreground">Default construction site</h2>
          <div className="mt-4 grid gap-2">
            {SITES.map((s) => (
              <button
                key={s.id}
                onClick={() => selectSite(s.id)}
                className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                  siteId === s.id
                    ? "border-primary/60 bg-primary/10 text-foreground"
                    : "border-border bg-background/50 text-muted-foreground hover:bg-surface-2"
                }`}
              >
                <span className="font-semibold text-foreground">{s.name}</span>
                <span className="block text-xs text-muted-foreground">{s.location}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="mt-6 rounded-xl border border-border bg-surface/60 p-4">
          <Disclaimer />
        </div>
      </main>
    </div>
  );
}

function Slider({
  label,
  hint,
  value,
  min,
  max,
  onChange,
  tone,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  tone: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className="font-mono text-sm text-primary">{value.toFixed(1)} m</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={0.1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`mt-3 w-full ${tone}`}
      />
      <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
