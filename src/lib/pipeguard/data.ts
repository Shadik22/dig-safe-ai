import type { Pt, Rect } from "./geometry";

export type UtilityType = "water" | "gas" | "sewer" | "electrical" | "telecom";

export const UTILITY_META: Record<
  UtilityType,
  { label: string; color: string; glow: string }
> = {
  water: { label: "Water", color: "#3b82f6", glow: "rgba(59,130,246,0.55)" },
  gas: { label: "Gas", color: "#facc15", glow: "rgba(250,204,21,0.55)" },
  sewer: { label: "Sewer", color: "#ef4444", glow: "rgba(239,68,68,0.55)" },
  electrical: { label: "Electrical", color: "#a855f7", glow: "rgba(168,85,247,0.55)" },
  telecom: { label: "Telecom", color: "#fb923c", glow: "rgba(251,146,60,0.55)" },
};

export type Utility = {
  id: string;
  name: string;
  type: UtilityType;
  depth: number; // metres
  diameter: string;
  material: string;
  confidence: number; // %
  surveyed: string;
  condition: string;
  owner: string;
  points: Pt[];
};

export type Building = { x: number; y: number; w: number; h: number; label: string };
export type Road = { points: Pt[]; width: number; label: string };

export type Site = {
  id: string;
  name: string;
  status: "Active" | "Completed";
  location: string;
  contractor: string;
  riskZones: number;
  boundary: Pt[];
  buildings: Building[];
  roads: Road[];
  utilities: Utility[];
  defaultZone: Rect;
  safeZone: Rect;
};

/** Map canvas is 1000 x 680 units; 1 unit = 0.1 m. */
export const MAP_W = 1000;
export const MAP_H = 680;

export const SITES: Site[] = [
  {
    id: "alpha",
    name: "Construction Site Alpha",
    status: "Active",
    location: "Harbour District, Sector 4",
    contractor: "Northline Civil Works",
    riskZones: 3,
    boundary: [
      { x: 60, y: 60 },
      { x: 940, y: 60 },
      { x: 940, y: 620 },
      { x: 60, y: 620 },
    ],
    buildings: [
      { x: 120, y: 120, w: 180, h: 130, label: "Block A" },
      { x: 700, y: 130, w: 190, h: 150, label: "Block B" },
      { x: 720, y: 440, w: 170, h: 130, label: "Site Office" },
      { x: 130, y: 460, w: 140, h: 110, label: "Store" },
    ],
    roads: [
      {
        points: [
          { x: 60, y: 350 },
          { x: 320, y: 335 },
          { x: 640, y: 365 },
          { x: 940, y: 345 },
        ],
        width: 46,
        label: "Harbour Road",
      },
      {
        points: [
          { x: 500, y: 60 },
          { x: 515, y: 300 },
          { x: 495, y: 620 },
        ],
        width: 34,
        label: "Access Way",
      },
    ],
    utilities: [
      {
        id: "W-102",
        name: "Water Pipeline W-102",
        type: "water",
        depth: 1.4,
        diameter: "300 mm",
        material: "Ductile iron",
        confidence: 94,
        surveyed: "2026-04-18",
        condition: "Serviceable",
        owner: "City Water Authority",
        points: [
          { x: 80, y: 250 },
          { x: 250, y: 275 },
          { x: 430, y: 240 },
          { x: 610, y: 285 },
          { x: 800, y: 250 },
          { x: 940, y: 285 },
        ],
      },
      {
        id: "W-101",
        name: "Water Main W-101",
        type: "water",
        depth: 1.2,
        diameter: "200 mm",
        material: "HDPE",
        confidence: 88,
        surveyed: "2026-03-02",
        condition: "Serviceable",
        owner: "City Water Authority",
        points: [
          { x: 80, y: 560 },
          { x: 280, y: 535 },
          { x: 470, y: 565 },
          { x: 700, y: 530 },
          { x: 940, y: 555 },
        ],
      },
      {
        id: "G-201",
        name: "Gas Distribution G-201",
        type: "gas",
        depth: 1.8,
        diameter: "160 mm",
        material: "Steel",
        confidence: 91,
        surveyed: "2026-02-11",
        condition: "Serviceable",
        owner: "Metro Gas Networks",
        points: [
          { x: 200, y: 60 },
          { x: 235, y: 210 },
          { x: 300, y: 380 },
          { x: 265, y: 520 },
          { x: 300, y: 620 },
        ],
      },
      {
        id: "S-301",
        name: "Sewer Trunk S-301",
        type: "sewer",
        depth: 2.1,
        diameter: "450 mm",
        material: "Concrete",
        confidence: 79,
        surveyed: "2025-11-27",
        condition: "Aging - inspection due",
        owner: "Municipal Drainage",
        points: [
          { x: 80, y: 420 },
          { x: 300, y: 445 },
          { x: 560, y: 410 },
          { x: 780, y: 450 },
          { x: 940, y: 420 },
        ],
      },
      {
        id: "E-401",
        name: "Electrical Conduit E-401",
        type: "electrical",
        depth: 0.9,
        diameter: "110 mm duct",
        material: "PVC duct bank",
        confidence: 86,
        surveyed: "2026-01-19",
        condition: "Serviceable",
        owner: "Grid Power Ltd",
        points: [
          { x: 660, y: 60 },
          { x: 640, y: 200 },
          { x: 690, y: 360 },
          { x: 655, y: 500 },
          { x: 690, y: 620 },
        ],
      },
      {
        id: "T-501",
        name: "Telecom Duct T-501",
        type: "telecom",
        depth: 0.7,
        diameter: "90 mm",
        material: "Polyethylene",
        confidence: 83,
        surveyed: "2026-05-06",
        condition: "Serviceable",
        owner: "FibreLink Comms",
        points: [
          { x: 80, y: 170 },
          { x: 300, y: 150 },
          { x: 540, y: 185 },
          { x: 760, y: 150 },
          { x: 940, y: 175 },
        ],
      },
    ],
    defaultZone: { x: 380, y: 232, w: 150, h: 110 },
    safeZone: { x: 360, y: 60, w: 150, h: 70 },
  },
  {
    id: "beta",
    name: "Construction Site Beta",
    status: "Active",
    location: "Riverside Industrial Park",
    contractor: "Kestrel Groundworks",
    riskZones: 1,
    boundary: [
      { x: 70, y: 70 },
      { x: 930, y: 60 },
      { x: 930, y: 610 },
      { x: 70, y: 620 },
    ],
    buildings: [
      { x: 150, y: 110, w: 220, h: 140, label: "Warehouse" },
      { x: 620, y: 380, w: 240, h: 160, label: "Plant Room" },
    ],
    roads: [
      {
        points: [
          { x: 70, y: 300 },
          { x: 420, y: 330 },
          { x: 930, y: 300 },
        ],
        width: 44,
        label: "River Access",
      },
    ],
    utilities: [
      {
        id: "E-205",
        name: "Electrical Conduit E-205",
        type: "electrical",
        depth: 1.0,
        diameter: "125 mm duct",
        material: "PVC duct bank",
        confidence: 89,
        surveyed: "2026-03-22",
        condition: "Serviceable",
        owner: "Grid Power Ltd",
        points: [
          { x: 90, y: 470 },
          { x: 320, y: 440 },
          { x: 560, y: 480 },
          { x: 900, y: 440 },
        ],
      },
      {
        id: "G-210",
        name: "Gas Service G-210",
        type: "gas",
        depth: 1.6,
        diameter: "125 mm",
        material: "Steel",
        confidence: 84,
        surveyed: "2025-12-09",
        condition: "Serviceable",
        owner: "Metro Gas Networks",
        points: [
          { x: 250, y: 70 },
          { x: 300, y: 250 },
          { x: 260, y: 430 },
          { x: 300, y: 610 },
        ],
      },
      {
        id: "W-140",
        name: "Water Main W-140",
        type: "water",
        depth: 1.3,
        diameter: "250 mm",
        material: "Ductile iron",
        confidence: 92,
        surveyed: "2026-04-01",
        condition: "Serviceable",
        owner: "City Water Authority",
        points: [
          { x: 90, y: 200 },
          { x: 380, y: 230 },
          { x: 700, y: 195 },
          { x: 920, y: 225 },
        ],
      },
      {
        id: "T-520",
        name: "Telecom Duct T-520",
        type: "telecom",
        depth: 0.8,
        diameter: "90 mm",
        material: "Polyethylene",
        confidence: 80,
        surveyed: "2026-02-28",
        condition: "Serviceable",
        owner: "FibreLink Comms",
        points: [
          { x: 90, y: 560 },
          { x: 420, y: 585 },
          { x: 920, y: 555 },
        ],
      },
    ],
    defaultZone: { x: 430, y: 380, w: 140, h: 100 },
    safeZone: { x: 430, y: 100, w: 140, h: 80 },
  },
  {
    id: "gamma",
    name: "Construction Site Gamma",
    status: "Completed",
    location: "Northgate Civic Quarter",
    contractor: "Halden & Co.",
    riskZones: 0,
    boundary: [
      { x: 80, y: 70 },
      { x: 920, y: 70 },
      { x: 920, y: 600 },
      { x: 80, y: 600 },
    ],
    buildings: [
      { x: 380, y: 230, w: 250, h: 180, label: "Civic Hall" },
      { x: 130, y: 120, w: 150, h: 110, label: "Annex" },
    ],
    roads: [
      {
        points: [
          { x: 80, y: 520 },
          { x: 500, y: 540 },
          { x: 920, y: 515 },
        ],
        width: 40,
        label: "Northgate Street",
      },
    ],
    utilities: [
      {
        id: "S-330",
        name: "Sewer Line S-330",
        type: "sewer",
        depth: 2.4,
        diameter: "375 mm",
        material: "Concrete",
        confidence: 76,
        surveyed: "2025-09-14",
        condition: "Serviceable",
        owner: "Municipal Drainage",
        points: [
          { x: 100, y: 180 },
          { x: 380, y: 155 },
          { x: 700, y: 190 },
          { x: 900, y: 160 },
        ],
      },
      {
        id: "W-160",
        name: "Water Main W-160",
        type: "water",
        depth: 1.5,
        diameter: "300 mm",
        material: "Ductile iron",
        confidence: 90,
        surveyed: "2026-01-05",
        condition: "Serviceable",
        owner: "City Water Authority",
        points: [
          { x: 100, y: 450 },
          { x: 430, y: 470 },
          { x: 900, y: 445 },
        ],
      },
      {
        id: "E-430",
        name: "Electrical Conduit E-430",
        type: "electrical",
        depth: 1.1,
        diameter: "110 mm duct",
        material: "PVC duct bank",
        confidence: 85,
        surveyed: "2025-10-30",
        condition: "Serviceable",
        owner: "Grid Power Ltd",
        points: [
          { x: 760, y: 70 },
          { x: 790, y: 300 },
          { x: 755, y: 600 },
        ],
      },
    ],
    defaultZone: { x: 200, y: 260, w: 140, h: 100 },
    safeZone: { x: 200, y: 260, w: 140, h: 100 },
  },
];

export const getSite = (id: string) => SITES.find((s) => s.id === id) ?? SITES[0];

export const TOTAL_MAPPED_UTILITIES = 73; // surveyed records across the three demo sites

export const RECENT_ALERTS = [
  {
    level: "HIGH RISK" as const,
    site: "Site Alpha — Zone 04",
    message: "Water pipeline conflict (W-102)",
    time: "12 minutes ago",
  },
  {
    level: "CAUTION" as const,
    site: "Site Beta — Zone 02",
    message: "Electrical conduit nearby (E-205)",
    time: "31 minutes ago",
  },
  {
    level: "CAUTION" as const,
    site: "Site Alpha — Zone 02",
    message: "Sewer trunk within buffer (S-301)",
    time: "1 hour ago",
  },
  {
    level: "LOW RISK" as const,
    site: "Site Gamma — Zone 01",
    message: "No mapped conflict in buffer",
    time: "2 hours ago",
  },
];
