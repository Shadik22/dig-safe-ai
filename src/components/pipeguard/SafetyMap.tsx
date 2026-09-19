import { useCallback, useRef, useState } from "react";
import { MAP_H, MAP_W, UTILITY_META, type Site, type Utility } from "@/lib/pipeguard/data";
import { smoothPath, type Pt, type Rect } from "@/lib/pipeguard/geometry";
import { RISK_META, type RiskResult } from "@/lib/pipeguard/risk";

type DragState =
  | { mode: "move"; dx: number; dy: number }
  | { mode: "resize" }
  | { mode: "draw"; origin: Pt }
  | null;

const MIN_SIZE = 40;
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export function SafetyMap({
  site,
  zone,
  onZoneChange,
  result,
  drawMode,
  onDrawComplete,
  selectedUtility,
  onSelectUtility,
}: {
  site: Site;
  zone: Rect | null;
  onZoneChange: (r: Rect) => void;
  result: RiskResult | null;
  drawMode: boolean;
  onDrawComplete: () => void;
  selectedUtility: Utility | null;
  onSelectUtility: (u: Utility | null) => void;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [drag, setDrag] = useState<DragState>(null);

  const toSvg = useCallback((clientX: number, clientY: number): Pt => {
    const el = svgRef.current;
    if (!el) return { x: 0, y: 0 };
    const b = el.getBoundingClientRect();
    return {
      x: ((clientX - b.left) / b.width) * MAP_W,
      y: ((clientY - b.top) / b.height) * MAP_H,
    };
  }, []);

  const onPointerDownCanvas = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drawMode) return;
    const p = toSvg(e.clientX, e.clientY);
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ mode: "draw", origin: p });
    onZoneChange({ x: p.x, y: p.y, w: MIN_SIZE, h: MIN_SIZE });
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drag || !zone) return;
    const p = toSvg(e.clientX, e.clientY);
    if (drag.mode === "move") {
      onZoneChange({
        ...zone,
        x: clamp(p.x - drag.dx, 0, MAP_W - zone.w),
        y: clamp(p.y - drag.dy, 0, MAP_H - zone.h),
      });
    } else if (drag.mode === "resize") {
      onZoneChange({
        ...zone,
        w: clamp(p.x - zone.x, MIN_SIZE, MAP_W - zone.x),
        h: clamp(p.y - zone.y, MIN_SIZE, MAP_H - zone.y),
      });
    } else {
      const o = drag.origin;
      onZoneChange({
        x: Math.min(o.x, p.x),
        y: Math.min(o.y, p.y),
        w: Math.max(MIN_SIZE, Math.abs(p.x - o.x)),
        h: Math.max(MIN_SIZE, Math.abs(p.y - o.y)),
      });
    }
  };

  const endDrag = () => {
    if (drag?.mode === "draw") onDrawComplete();
    setDrag(null);
  };

  const riskColor = result ? RISK_META[result.level].color : "#38bdf8";
  const marker = result?.primary?.closestPoint ?? null;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      className={`h-full w-full touch-none select-none ${drawMode ? "cursor-crosshair" : ""}`}
      onPointerDown={onPointerDownCanvas}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      <defs>
        <pattern id="pg-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148,180,220,0.10)" strokeWidth="1" />
        </pattern>
        <pattern id="pg-grid-lg" width="200" height="200" patternUnits="userSpaceOnUse">
          <path d="M 200 0 L 0 0 0 200" fill="none" stroke="rgba(148,180,220,0.18)" strokeWidth="1.2" />
        </pattern>
        <pattern id="pg-hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="12" stroke={riskColor} strokeWidth="4" opacity="0.28" />
        </pattern>
      </defs>

      <rect width={MAP_W} height={MAP_H} fill="rgba(11,20,34,1)" />
      <rect width={MAP_W} height={MAP_H} fill="url(#pg-grid)" />
      <rect width={MAP_W} height={MAP_H} fill="url(#pg-grid-lg)" />

      {/* Site boundary */}
      <polygon
        points={site.boundary.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="rgba(56,189,248,0.04)"
        stroke="rgba(56,189,248,0.5)"
        strokeWidth="2.5"
        strokeDasharray="14 9"
      />

      {/* Roads */}
      {site.roads.map((road, i) => (
        <g key={`road-${i}`}>
          <path d={smoothPath(road.points)} stroke="rgba(160,178,200,0.20)" strokeWidth={road.width} fill="none" strokeLinecap="round" />
          <path
            d={smoothPath(road.points)}
            stroke="rgba(226,240,255,0.30)"
            strokeWidth="2"
            strokeDasharray="18 16"
            fill="none"
          />
        </g>
      ))}

      {/* Buildings */}
      {site.buildings.map((b, i) => (
        <g key={`b-${i}`}>
          <rect
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx="6"
            fill="rgba(148,175,205,0.14)"
            stroke="rgba(190,214,240,0.35)"
            strokeWidth="1.6"
          />
          <text x={b.x + 12} y={b.y + 26} fill="rgba(226,240,255,0.65)" fontSize="15" fontFamily="var(--font-sans)">
            {b.label}
          </text>
        </g>
      ))}

      {/* Underground utility routes */}
      {site.utilities.map((u) => {
        const meta = UTILITY_META[u.type];
        const d = smoothPath(u.points);
        const active = selectedUtility?.id === u.id;
        const conflict = result?.conflicts.find((c) => c.utility.id === u.id);
        const flagged = conflict && conflict.level !== "low";
        return (
          <g key={u.id} className="cursor-pointer" onPointerDown={(e) => e.stopPropagation()} onClick={() => onSelectUtility(u)}>
            <path d={d} stroke={meta.glow} strokeWidth={active || flagged ? 20 : 13} fill="none" strokeLinecap="round" opacity={active || flagged ? 0.5 : 0.22} />
            <path d={d} stroke={meta.color} strokeWidth={active ? 6 : 4.5} fill="none" strokeLinecap="round" />
            <path d={d} stroke="rgba(255,255,255,0.75)" strokeWidth="1.6" fill="none" className="pg-flow" opacity={active || flagged ? 0.9 : 0.35} />
            <path d={d} stroke="transparent" strokeWidth="26" fill="none" />
            <text
              x={u.points[1]?.x ?? 0}
              y={(u.points[1]?.y ?? 0) - 14}
              fill={meta.color}
              fontSize="15"
              fontWeight="600"
              fontFamily="var(--font-mono)"
            >
              {u.id}
            </text>
          </g>
        );
      })}

      {/* Excavation zone */}
      {zone && (
        <g>
          <rect
            x={zone.x}
            y={zone.y}
            width={zone.w}
            height={zone.h}
            rx="4"
            fill="url(#pg-hatch)"
            stroke={riskColor}
            strokeWidth="3"
            className={drawMode ? "" : "cursor-move"}
            onPointerDown={(e) => {
              if (drawMode) return;
              e.stopPropagation();
              const p = toSvg(e.clientX, e.clientY);
              (e.currentTarget.ownerSVGElement as SVGSVGElement).setPointerCapture(e.pointerId);
              setDrag({ mode: "move", dx: p.x - zone.x, dy: p.y - zone.y });
            }}
          />
          <rect x={zone.x} y={zone.y} width={zone.w} height={zone.h} rx="4" fill="none" stroke={riskColor} strokeWidth="1" opacity="0.6" />
          <text x={zone.x + 8} y={zone.y - 10} fill={riskColor} fontSize="16" fontWeight="700" fontFamily="var(--font-mono)">
            EXCAVATION ZONE
          </text>
          {!drawMode && (
            <rect
              x={zone.x + zone.w - 11}
              y={zone.y + zone.h - 11}
              width="22"
              height="22"
              rx="4"
              fill={riskColor}
              className="cursor-nwse-resize"
              onPointerDown={(e) => {
                e.stopPropagation();
                (e.currentTarget.ownerSVGElement as SVGSVGElement).setPointerCapture(e.pointerId);
                setDrag({ mode: "resize" });
              }}
            />
          )}
        </g>
      )}

      {/* Conflict marker */}
      {marker && result && result.level !== "low" && (
        <g pointerEvents="none">
          <circle cx={marker.x} cy={marker.y} r="16" fill="none" stroke={riskColor} strokeWidth="3" className="pg-pulse" />
          <circle cx={marker.x} cy={marker.y} r="7" fill={riskColor} />
        </g>
      )}
    </svg>
  );
}
