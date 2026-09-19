import { useCallback, useEffect, useState } from "react";
import type { Rect } from "./geometry";
import { getSite, SITES } from "./data";

const SITE_KEY = "pipeguard.site";
const zoneKey = (siteId: string) => `pipeguard.zone.${siteId}`;

export function useActiveSite() {
  const [siteId, setSiteId] = useState<string>(SITES[0]!.id);

  useEffect(() => {
    const stored = window.localStorage.getItem(SITE_KEY);
    if (stored && SITES.some((s) => s.id === stored)) setSiteId(stored);
  }, []);

  const select = useCallback((id: string) => {
    setSiteId(id);
    window.localStorage.setItem(SITE_KEY, id);
  }, []);

  return { siteId, site: getSite(siteId), selectSite: select };
}

export function useExcavationZone(siteId: string) {
  const [zone, setZoneState] = useState<Rect | null>(getSite(siteId).defaultZone);

  useEffect(() => {
    const stored = window.localStorage.getItem(zoneKey(siteId));
    if (stored === "none") {
      setZoneState(null);
      return;
    }
    if (stored) {
      try {
        setZoneState(JSON.parse(stored) as Rect);
        return;
      } catch {
        /* fall through to default */
      }
    }
    setZoneState(getSite(siteId).defaultZone);
  }, [siteId]);

  const setZone = useCallback(
    (next: Rect | null) => {
      setZoneState(next);
      window.localStorage.setItem(zoneKey(siteId), next ? JSON.stringify(next) : "none");
    },
    [siteId],
  );

  const resetZone = useCallback(() => {
    setZone(getSite(siteId).defaultZone);
  }, [siteId, setZone]);

  return { zone, setZone, resetZone };
}
