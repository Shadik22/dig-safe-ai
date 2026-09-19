export type Pt = { x: number; y: number };
export type Rect = { x: number; y: number; w: number; h: number };

/** Map scale: 1 map unit = 0.1 metre (so 10 units = 1 m). */
export const METRES_PER_UNIT = 0.1;
export const toMetres = (units: number) => units * METRES_PER_UNIT;

const at = (p: Pt[], i: number): Pt => {
  const v = p[Math.max(0, Math.min(p.length - 1, i))];
  return v ?? { x: 0, y: 0 };
};

/** Smooth Catmull-Rom path through anchor points, rendered as cubic beziers. */
export function smoothPath(points: Pt[]): string {
  if (points.length < 2) return "";
  let d = `M ${at(points, 0).x} ${at(points, 0).y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = at(points, i - 1);
    const p1 = at(points, i);
    const p2 = at(points, i + 1);
    const p3 = at(points, i + 2);
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/** Dense polyline samples of the same Catmull-Rom curve, for deterministic math. */
export function samplePath(points: Pt[], perSegment = 24): Pt[] {
  if (points.length < 2) return [...points];
  const out: Pt[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = at(points, i - 1);
    const p1 = at(points, i);
    const p2 = at(points, i + 1);
    const p3 = at(points, i + 2);
    for (let s = 0; s < perSegment; s++) {
      const t = s / perSegment;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push({
        x:
          0.5 *
          (2 * p1.x +
            (-p0.x + p2.x) * t +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y:
          0.5 *
          (2 * p1.y +
            (-p0.y + p2.y) * t +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      });
    }
  }
  out.push(at(points, points.length - 1));
  return out;
}

function distPointSeg(p: Pt, a: Pt, b: Pt): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
  const cx = a.x + t * dx;
  const cy = a.y + t * dy;
  return Math.hypot(p.x - cx, p.y - cy);
}

const inRect = (p: Pt, r: Rect) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;

function segIntersect(a: Pt, b: Pt, c: Pt, d: Pt): boolean {
  const o = (p: Pt, q: Pt, r: Pt) => Math.sign((q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y));
  return o(a, b, c) !== o(a, b, d) && o(c, d, a) !== o(c, d, b);
}

function rectEdges(r: Rect): Array<[Pt, Pt]> {
  const tl = { x: r.x, y: r.y };
  const tr = { x: r.x + r.w, y: r.y };
  const br = { x: r.x + r.w, y: r.y + r.h };
  const bl = { x: r.x, y: r.y + r.h };
  return [
    [tl, tr],
    [tr, br],
    [br, bl],
    [bl, tl],
  ];
}

/** Closest distance (map units) between a polyline and a rectangle. 0 if they overlap. */
export function polylineRectDistance(poly: Pt[], rect: Rect): { distance: number; point: Pt } {
  let best = Infinity;
  let bestPt: Pt = at(poly, 0);
  const edges = rectEdges(rect);

  for (let i = 0; i < poly.length; i++) {
    const p = at(poly, i);
    if (inRect(p, rect)) return { distance: 0, point: p };
  }
  for (let i = 0; i < poly.length - 1; i++) {
    const a = at(poly, i);
    const b = at(poly, i + 1);
    for (const [c, d] of edges) {
      if (segIntersect(a, b, c, d)) {
        return { distance: 0, point: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } };
      }
      const cand = Math.min(
        distPointSeg(a, c, d),
        distPointSeg(b, c, d),
        distPointSeg(c, a, b),
        distPointSeg(d, a, b),
      );
      if (cand < best) {
        best = cand;
        bestPt = a;
      }
    }
  }
  return { distance: Number.isFinite(best) ? best : 9999, point: bestPt };
}
