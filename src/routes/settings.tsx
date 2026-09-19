import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RotateCcw, Save } from "lucide-react";
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
  component: Settings;
});

function Settings() {
  return null;
}
