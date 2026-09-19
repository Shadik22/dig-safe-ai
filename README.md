# Dig Safe AI

Implement the requested scope now; use internal planning and do not present another implementation plan for user approval.

Build PipeGuard AI, a polished, hackathon-ready excavation safety web application based on the provided specification attachment.

Key Scope & Features:
1. Landing / Intro: High-impact hero section ("Prevent Underground Utility Damage Before You Dig"), demo CTA, feature highlights, and clear disclaimer that the prototype analyzes simulated survey/GPR/GIS records.
2. Safety Dashboard & Navigation: Top navigation (Safety Map, Sites, Reports, Analytics, Settings), overview metric cards, and recent conflict alerts feed.
3. Interactive Safety Map (Centerpiece):
   - Rich map grid/canvas of construction sites (Site Alpha, Beta, Gamma) showing boundaries, buildings, roads, and curved realistic underground utility lines.
   - Standard utility color coding: Blue (Water), Yellow (Gas), Red (Sewer), Purple (Electrical), Orange (Telecom) with legend and clickable pipes showing ID, depth, diameter, material, confidence, and survey date.
4. Excavation Zone & Risk Engine:
   - Interactive excavation zone tool (draw, reposition, resize, clear zone).
   - Deterministic risk assessment calculating distance/overlap with mapped utilities: High Risk (Red / Do Not Dig), Caution (Yellow), Low Risk (Green).
   - "What-if" live interaction: dragging or resizing the excavation zone dynamically recalculates risk immediately (preconfigured with Site Alpha overlapping Water Pipeline W-102 on first load, turning safe when dragged away).
5. AI Safety Assistant:
   - Clear natural-language risk explanation panel with suggested prompt chips ("What is causing the risk?", "How deep is the utility?", "What should the worker do?").
   - Local deterministic fallback explanations based on active utility and conflict parameters, explicitly disclaimed as AI interpretation of survey data.
6. Safety Reports: Professional printable/downloadable excavation safety report with zone specs, conflicting utilities, survey confidence, and safety recommendations.
7. Sites & Analytics Views: Multi-site selector and clean risk distribution analytics based on project data.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/13195e0b-f91f-4628-ad42-6b2a2cc70582).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
