# South Dagon Sales Office & SCDC

An interactive Next.js website for the sales office and supply chain distribution center, reconstructed from the supplied exterior images and project drawings.

## Stack

- Next.js 16.3.4 with the App Router
- React 19 and TypeScript
- Three.js 0.180.0 for the interactive model
- Responsive styles in the Next.js app; no standalone HTML entry point
- Local reference images and a locally vendored Three.js package

## Run

Install Node.js 20.9 or later, then open a terminal in this folder:

    npm install
    npm run dev

Open http://localhost:3000.

For a production build:

    npm run build
    npm start

The development and production servers bind to the local computer. This project has not been deployed.

## Copy to your requested project folder

From this extracted project folder, run in PowerShell:

    .\Copy-To-Projects.ps1

The script copies the Next.js source to D:\Projects\sale-office-scdc. It preserves the earlier HTML starter files in a legacy-html-scaffold subfolder if they are present. It does not install packages or start a server.

Then:

    cd D:\Projects\sale-office-scdc
    npm install
    npm run dev

## Features

- Orbit, pan, zoom, keyboard navigation, and touch controls
- Aerial, street, loading-area, and top cameras
- Clickable office, warehouse, and entrance selections
- Office floor highlighting with purposes taken from the supplied plans
- Building labels, wireframe, daylight/evening, and automatic orbit
- PNG view capture and GLB model export
- Gallery containing the three supplied exterior reference images

## Project files

- src/app/page.tsx — Next.js page
- src/app/layout.tsx — Root layout and metadata
- src/app/globals.css — Responsive styling
- src/components/SiteExplorer.tsx — React UI, state, and viewer lifecycle
- src/components/Icons.tsx — Reusable icons
- src/lib/build-model.js — Editable building geometry and dimensions
- src/lib/site-scene.js — Three.js renderer, controls, cameras, and exports
- public/references/ — Supplied exterior reference images
- public/models/south-dagon-office-scdc-concept.glb — Reusable 3D model
- scripts/export-model.mjs — Regenerates and validates the GLB
- docs/source-notes.md — Source information and modeling assumptions
- vendor/three/ — Locally vendored Three.js modules and MIT license

## Update the building model

Edit DIMENSIONS, FLOORS, or the geometry in src/lib/build-model.js.

    npm run export:model

Check the longitudinal layout, staircase adjacency, site clearance, and selection geometry:

    npm run check:layout

The website builds its interactive model from this same source at runtime. Regenerating the GLB updates the independent model file.

The office-floor descriptions in SiteExplorer.tsx should be updated if the project plan changes.

## Model limits

This is an exterior concept reconstruction, not a survey or a construction/BIM model. Office grid dimensions and the warehouse footprint are guided by drawings. Building heights, façade openings, stairs, ground levels, site edges, vegetation, and vehicles are approximate.

The office comprises ground, mezzanine, first, second, third, and fourth levels, with roof access above. No interior walkthrough is included.

## Validation

- TypeScript type checking
- Geometry regression checks for the FIX.md layout, exposed stairs, and picking
- Successful Next.js production build
- Browser checks at desktop and phone widths
- Verified building focus, floor highlight, lighting, wireframe, and reference switching
- GLB 2.0 header, scene/mesh presence, and finite accessor bounds verified

## Licenses

Three.js is MIT licensed; see vendor/three/LICENSE. The supplied architectural images remain the property of their respective owners.
