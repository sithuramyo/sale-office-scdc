"use client";

import { useEffect, useRef, useState } from "react";
import type { createSiteScene } from "@/lib/site-scene";
import { Icon, IconDefs } from "./Icons";

type Part = "office" | "warehouse" | "site";
type Preset = "aerial" | "front" | "loading" | "top";
type Engine = ReturnType<typeof createSiteScene>;
type LabelPosition = { x: number; y: number; visible: boolean };
const presets: { id: Preset; label: string }[] = [
  { id: "aerial", label: "Aerial" }, { id: "front", label: "Street" },
  { id: "loading", label: "Loading area" }, { id: "top", label: "Top view" },
];
const buildings: { id: Part; icon: string; name: string; subtitle: string }[] = [
  { id: "office", icon: "office", name: "Sales office", subtitle: "5½ storeys · Office building" },
  { id: "warehouse", icon: "warehouse", name: "Warehouse", subtitle: "Storage & distribution" },
  { id: "site", icon: "site", name: "Site & access", subtitle: "Entrance, yard & circulation" },
];
const details = {
  overview: { kicker: "PROJECT OVERVIEW", number: "01 — 03", title: "A connected workplace.", copy: "Enter from the main road, pass the sales office, and follow the loading yard along the warehouse into the depth of the site.", tags: ["Sales office", "Warehouse", "Shared site"] },
  office: { kicker: "SALES OFFICE", number: "01 / 03", title: "Five floors. A mezzanine.", copy: "Ground, mezzanine, and first through fourth floors, with roof access above. Select a level to learn more.", tags: ["Office", "Meeting spaces", "Staff facilities"] },
  warehouse: { kicker: "SUPPLY CHAIN", number: "02 / 03", title: "Space for distribution.", copy: "The green warehouse meets the office’s rear staircase area and extends deep into the site, with a covered loading edge and shared service yard.", tags: ["Storage", "Loading bays", "Covered access"] },
  site: { kicker: "SITE & ACCESS", number: "03 / 03", title: "Arrive. Load. Move.", copy: "Two entrance points, guardhouses, parking, and a shared loading yard connect the office and warehouse.", tags: ["2 entrances", "20 planned car bays", "Loading yard"] },
};
const floors = [
  { id: "g", label: "G", name: "Ground floor", use: "Reception, office and storage" },
  { id: "m", label: "M", name: "Mezzanine", use: "Storage and staff facilities" },
  { id: "1", label: "01", name: "First floor", use: "Finance, admin and IDT" },
  { id: "2", label: "02", name: "Second floor", use: "Sales and management" },
  { id: "3", label: "03", name: "Third floor", use: "Marketing and meetings" },
  { id: "4", label: "04", name: "Fourth floor", use: "Canteen and shrine" },
];
const references = [
  { file: "office-and-warehouse.jpg", name: "Office & warehouse", alt: "Original rendering showing the office exterior stairs and the green warehouse" },
  { file: "street-view.jpg", name: "Street perspective", alt: "Original street rendering of the sales office, warehouse, and guardhouse" },
  { file: "aerial-view.jpg", name: "Aerial perspective", alt: "Original aerial rendering with the office roof, water tanks, and adjacent warehouse" },
];

export default function SiteExplorer() {
  const mount = useRef<HTMLDivElement>(null);
  const viewer = useRef<HTMLElement>(null);
  const engine = useRef<Engine | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const labelNodes = useRef<Record<string, HTMLButtonElement | null>>({});
  const compass = useRef<SVGSVGElement>(null);
  const selectedCallback = useRef<(id: Part) => void>(() => {});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [focus, setFocus] = useState<Part | "overview">("overview");
  const [preset, setPreset] = useState<string>("aerial");
  const [viewTitle, setViewTitle] = useState("The entire site");
  const [labels, setLabels] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [evening, setEvening] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [floor, setFloor] = useState<string | null>(null);
  const [reference, setReference] = useState(2);
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function notify(message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message); toastTimer.current = setTimeout(() => setToast(""), 3800);
  }
  function selectPart(id: Part) {
    if (!engine.current) return;
    setFocus(id); setFloor(null); engine.current.showFloor(null); engine.current.setView(id);
  }
  selectedCallback.current = selectPart;

  useEffect(() => {
    let cancelled = false;
    let instance: Engine | null = null;
    async function initialize() {
      try {
        const { createSiteScene } = await import("@/lib/site-scene");
        if (cancelled || !mount.current) return;
        instance = createSiteScene(mount.current, {
          onSelect: (id: Part) => selectedCallback.current(id),
          onView: (id: string, title: string) => { setPreset(id); setViewTitle(title); },
          onOrbitStop: () => setRotating(false),
          onError: (message: string) => setError(message),
          onLabels: (positions: Record<string, LabelPosition>) => {
            for (const [id, p] of Object.entries(positions)) {
              const node = labelNodes.current[id];
              if (!node) continue;
              node.style.transform = "translate(" + p.x + "px," + p.y + "px) translate(-50%,-100%)";
              node.style.opacity = p.visible ? "1" : "0";
              node.style.visibility = p.visible ? "visible" : "hidden";
            }
          },
          onCompass: (rotation: number) => { if (compass.current) compass.current.style.transform = "rotate(" + rotation + "deg)"; },
        });
        engine.current = instance;
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        console.error(e);
        setLoading(false);
        setError("The 3D viewer could not start. Enable hardware acceleration in your browser, then reload this page.");
      }
    }
    initialize();
    return () => { cancelled = true; instance?.dispose(); engine.current = null; };
  }, []);

  useEffect(() => {
    const handler = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handler);
    return () => { document.removeEventListener("fullscreenchange", handler); if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);

  function chooseView(id: Preset) {
    setFocus("overview"); setFloor(null);
    engine.current?.showFloor(null); engine.current?.setView(id);
  }
  function reset() {
    setWireframe(false); setEvening(false); setLabels(true); setRotating(false);
    engine.current?.setWireframe(false); engine.current?.setEvening(false);
    chooseView("aerial");
  }
  function openReferences() { dialog.current?.showModal(); setReferenceOpen(true); }
  function closeReferences() { dialog.current?.close(); setReferenceOpen(false); }
  async function downloadModel() {
    if (!engine.current || exporting) return;
    setExporting(true); notify("Preparing your 3D model…");
    try { await engine.current.exportGlb(); notify("3D model downloaded as a GLB file."); }
    catch (e) { console.error(e); notify("The model could not be exported. Please try again."); }
    finally { setExporting(false); }
  }
  async function saveImage() {
    try { await engine.current?.screenshot(); notify("Current view downloaded as a PNG image."); }
    catch { notify("The image could not be saved. Please try again."); }
  }
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (viewer.current?.requestFullscreen) await viewer.current.requestFullscreen();
      else notify("Fullscreen is not supported by this browser.");
    } catch { notify("Fullscreen is not available in this browser window."); }
  }
  const detail = details[focus];
  const selectedFloor = floors.find(f => f.id === floor);
  const ready = !loading && !error;

  return <>
    <IconDefs />
    <header className="header">
      <button onClick={reset} className="brand" aria-label="Siteview home"><span className="brand-icon"><Icon name="cube" /></span>siteview<span className="brand-dot">.</span></button>
      <nav aria-label="Main navigation">
        <button className={"nav-item " + (!referenceOpen ? "active" : "")} onClick={reset}>Site overview</button>
        <button className={"nav-item " + (referenceOpen ? "active" : "")} onClick={openReferences}>Reference images <span>03</span></button>
      </nav>
      <div className="header-right"><span className="concept-status"><i />Concept model</span><button className="export-button" onClick={downloadModel} disabled={!ready || exporting} aria-label="Download 3D model"><Icon name="download" /><span>{exporting ? "Preparing…" : "Download 3D"}</span></button></div>
    </header>
    <main className="workspace">
      <aside className="sidebar">
        <div className="project-intro"><div className="eyebrow"><span className="tiny-line" /> SOUTH DAGON · GRG</div><h1>Sales office &<br />{" "}distribution<br />{" "}center<span>.</span></h1><p>Explore our new office and warehouse.<br />{" "}One site, every perspective.</p></div>
        <div className="section-label">EXPLORE THE SITE <span>01 — 03</span></div>
        <div className="building-list" role="group" aria-label="Focus on a building">
          {buildings.map(b => <button key={b.id} className={"building-card " + (focus === b.id ? "selected" : "")} onClick={() => selectPart(b.id)} aria-pressed={focus === b.id} disabled={!ready}>
            <span className={"building-icon " + b.id + "-icon"}><Icon name={b.icon} /></span><span className="building-copy"><strong>{b.name}</strong><small>{b.subtitle}</small></span><Icon name="arrow" className="card-arrow" />
          </button>)}
        </div>
        <div className="detail-panel" aria-live="polite"><div className="detail-heading"><span>{detail.kicker}</span><span>{detail.number}</span></div><h2>{detail.title}</h2><p>{detail.copy}</p>
          {focus === "office" ? <div className="floor-explorer"><div className="floor-buttons" role="group" aria-label="Office floors">{floors.map(f => <button key={f.id} className={floor === f.id ? "selected" : ""} aria-label={"Highlight " + f.name} aria-pressed={floor === f.id} onClick={() => { const next = floor === f.id ? null : f.id; setFloor(next); engine.current?.showFloor(next); }}>{f.label}</button>)}</div><div className="floor-description"><strong>{selectedFloor?.name || "Choose a floor"}</strong><span>{selectedFloor?.use || "Highlights its position on the exterior"}</span></div></div> : <div className="detail-tags">{detail.tags.map(t => <span key={t}>{t}</span>)}</div>}
        </div>
        <button className="reference-card" onClick={openReferences}><span className="reference-stack"><img src="/references/aerial-view.jpg" alt="Original aerial rendering of the facility" /></span><span><strong>The original perspectives</strong><small>View your 3 reference images <span>↗</span></small></span></button>
        <div className="concept-note"><span className="note-dot" /><p><strong>An exterior concept study.</strong> Based on your images and drawings. Heights, unseen details, and site edges are approximate.</p></div>
        <div className="sidebar-foot"><span>EXTERIOR CONCEPT</span><span>V.01</span></div>
      </aside>
      <section className={"viewer " + (evening ? "evening" : "")} ref={viewer} aria-label="Interactive 3D model of the sales office and warehouse">
        <div id="scene" ref={mount} tabIndex={0} aria-label="3D site. Drag or use arrow keys to orbit. Scroll or use plus and minus to zoom. Press zero to reset." />
        <div className="viewer-heading"><span className="viewer-eyebrow">YOUR NEXT PERSPECTIVE</span><h2>{viewTitle}</h2><span className="view-live"><i />Interactive 3D exterior</span></div>
        <div className="display-controls">
          <button className={"display-button " + (labels ? "selected" : "")} aria-label="Toggle building labels" aria-pressed={labels} onClick={() => setLabels(!labels)} disabled={!ready}><Icon name="pin" /><span>Labels</span><span className="sr-only">Toggle building labels</span></button>
          <button className={"display-button " + (wireframe ? "selected" : "")} aria-label="Toggle wireframe" aria-pressed={wireframe} onClick={() => { setWireframe(!wireframe); engine.current?.setWireframe(!wireframe); }} disabled={!ready}><Icon name="cube" /><span>Wireframe</span><span className="sr-only">Toggle wireframe</span></button>
          <button className="icon-button" aria-label={evening ? "Switch to daylight" : "Switch to evening light"} title="Daylight / evening" onClick={() => { setEvening(!evening); engine.current?.setEvening(!evening); }} disabled={!ready}><Icon name="sun" /></button>
        </div>
        <div className="hotspots" hidden={!labels || !ready}>
          {buildings.map((b, i) => <button key={b.id} ref={el => { labelNodes.current[b.id] = el; }} className={"hotspot " + (b.id === "site" ? "small" : "")} onClick={() => selectPart(b.id)}><span>0{i + 1}</span>{b.id === "site" ? "Main entrance" : b.name}{b.id !== "site" && <i>↗</i>}</button>)}
        </div>
        <div className="viewer-tools" role="group" aria-label="3D viewer controls">
          <button className="icon-button" aria-label="Zoom in" title="Zoom in" onClick={() => engine.current?.zoom(.82)} disabled={!ready}><Icon name="plus" /></button>
          <button className="icon-button" aria-label="Zoom out" title="Zoom out" onClick={() => engine.current?.zoom(1.22)} disabled={!ready}><Icon name="minus" /></button><div className="tool-divider" />
          <button className="icon-button" aria-label="Reset view" title="Reset view" onClick={reset} disabled={!ready}><Icon name="reset" /></button>
          <button className="icon-button" aria-label="Download image of current view" title="Save current view as PNG" onClick={saveImage} disabled={!ready}><Icon name="image" /></button>
          <button className="icon-button" aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"} title="Fullscreen" onClick={toggleFullscreen}><Icon name="expand" /></button>
        </div>
        <div className="compass" aria-hidden="true"><span>VIEW</span><svg ref={compass} viewBox="0 0 48 48"><path d="m24 7 7 28-7-5-7 5Z" fill="currentColor" /><circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth=".5" /></svg></div>
        <div className="view-bottom"><div className="view-presets" role="group" aria-label="Camera views">{presets.map(v => <button key={v.id} className={"preset " + (preset === v.id ? "selected" : "")} aria-pressed={preset === v.id} onClick={() => chooseView(v.id)} disabled={!ready}>{v.label}</button>)}</div><button className="rotate-button" aria-pressed={rotating} aria-label={rotating ? "Pause auto orbit" : "Start auto orbit"} onClick={() => { setRotating(!rotating); engine.current?.setRotate(!rotating); }} disabled={!ready}><Icon name={rotating ? "pause" : "play"} /><span>Auto orbit</span></button></div>
        <div className="viewer-footer"><span><Icon name="hand" /><span className="desktop-help">Drag to orbit<span className="help-separator">·</span>Scroll to zoom<span className="help-separator">·</span>Right-drag to pan</span><span className="mobile-help">Drag to orbit · Pinch to zoom</span></span><span>CONCEPT RECONSTRUCTION</span></div>
        {loading && <div className="loading"><div className="loading-cube"><Icon name="cube" /></div><strong>Bringing your site into perspective</strong><span>Preparing the 3D model…</span></div>}
        {error && <div className="error" role="alert"><h2>The 3D view couldn’t start.</h2><p>{error}</p><button onClick={() => window.location.reload()}>Try again</button><button onClick={openReferences}>View reference images</button></div>}
      </section>
    </main>
    <dialog ref={dialog} onClose={() => setReferenceOpen(false)} onClick={e => { if (e.target === dialog.current) closeReferences(); }} aria-labelledby="reference-title">
      <div className="dialog-top"><div><div className="eyebrow">THE STARTING POINT</div><h2 id="reference-title">Your original vision.</h2></div><button className="icon-button" onClick={closeReferences} aria-label="Close reference images"><Icon name="close" /></button></div>
      <figure><img id="reference-main" src={"/references/" + references[reference].file} alt={references[reference].alt} /><figcaption><strong>{references[reference].name}</strong><span>Original image · Supplied by you</span></figcaption></figure>
      <div className="reference-thumbnails">{references.map((r, i) => <button key={r.file} className={reference === i ? "selected" : ""} aria-pressed={reference === i} aria-label={"View " + r.name + " reference"} onClick={() => setReference(i)}><img src={"/references/" + r.file} alt="" /><span>0{i + 1} · {r.name}</span></button>)}</div>
      <p className="reference-disclaimer">The interactive model interprets these images alongside your supplied plans. Unseen details and building heights are estimated.</p>
    </dialog>
    <div id="toast" className={toast ? "show" : ""} role="status" aria-live="polite">{toast}</div>
  </>;
}
