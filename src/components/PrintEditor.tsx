"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

export type Pos = { x: number; y: number; w: number; h: number };
export type Layout = Record<string, Pos>;

export type Fonts = {
  sectionTitle: number;
  statValue: number;
  statLabel: number;
  courseStatValue: number;
  courseStatLabel: number;
  recordTime: number;
  recordName: number;
  funFactTitle: number;
  funFactText: number;
  trofasteRow: number;
  top5Header: number;
  top5Row: number;
  colophonTitle: number;
  colophonText: number;
};

export type Options = {
  fonts: Fonts;
  top5Count: number;
  trofasteCount: number;
  top5MinWidth: number;
  statMinWidth: number;
  recordMinWidth: number;
  funFactMinWidth: number;
  trofasteMinWidth: number;
};

export const DEFAULT_FONTS: Fonts = {
  sectionTitle: 24,
  statValue: 20,
  statLabel: 11,
  courseStatValue: 20,
  courseStatLabel: 11,
  recordTime: 36,
  recordName: 13,
  funFactTitle: 15,
  funFactText: 13,
  trofasteRow: 15,
  top5Header: 18,
  top5Row: 13,
  colophonTitle: 28,
  colophonText: 14,
};

export const DEFAULT_OPTIONS: Options = {
  fonts: DEFAULT_FONTS,
  top5Count: 5,
  trofasteCount: 6,
  top5MinWidth: 75,
  statMinWidth: 50,
  recordMinWidth: 75,
  funFactMinWidth: 150,
  trofasteMinWidth: 150,
};

export const POSTER_W_MM = 594;
export const POSTER_H_MM = 420;

const SNAP_TOLERANCE_MM = 2;
const STORAGE_KEY = "print-state-v2";
const MAX_HISTORY = 50;

type Guide = { type: "v" | "h"; mm: number };

type LayoutCtx = {
  layout: Layout;
  setPos: (id: string, pos: Pos) => void;
  pushHistory: () => void;
  editMode: boolean;
  guides: Guide[];
  setGuides: (g: Guide[]) => void;
  pxPerMm: () => number;
  ids: string[];
  options: Options;
  collectInnerSnapLines: (excludeEl?: HTMLElement | null) => {
    xLines: number[];
    yLines: number[];
  };
};

const Ctx = createContext<LayoutCtx | null>(null);

function useLayoutCtx() {
  const c = useContext(Ctx);
  if (!c) throw new Error("Must be inside PrintCanvas");
  return c;
}

export function usePrintOptions() {
  return useLayoutCtx().options;
}

export function PrintCanvas({
  defaults,
  children,
}: {
  defaults: Layout;
  children: ReactNode;
}) {
  const [editMode, setEditMode] = useState(false);
  const [layout, setLayout] = useState<Layout>(defaults);
  const [options, setOptions] = useState<Options>(DEFAULT_OPTIONS);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [activePanel, setActivePanel] = useState<null | "fonts" | "content">(
    null
  );
  const [history, setHistory] = useState<Layout[]>([]);
  const [future, setFuture] = useState<Layout[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(0.15);
  const [toolbarHeight, setToolbarHeight] = useState(52);
  const canvasRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as {
          layout?: Layout;
          options?: Partial<Options>;
        };
        if (parsed.layout) setLayout({ ...defaults, ...parsed.layout });
        if (parsed.options)
          setOptions({
            ...DEFAULT_OPTIONS,
            ...parsed.options,
            fonts: { ...DEFAULT_FONTS, ...(parsed.options.fonts ?? {}) },
          });
      }
    } catch {}
    setHydrated(true);
  }, [defaults]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ layout, options })
      );
    } catch {}
  }, [layout, options, hydrated]);

  const pushHistory = useCallback(() => {
    setHistory((h) => [...h.slice(-(MAX_HISTORY - 1)), layout]);
    setFuture([]);
  }, [layout]);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setFuture((f) => [layout, ...f]);
      setLayout(prev);
      return h.slice(0, -1);
    });
  }, [layout]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const next = f[0];
      setHistory((h) => [...h, layout]);
      setLayout(next);
      return f.slice(1);
    });
  }, [layout]);

  useEffect(() => {
    const el = toolbarRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setToolbarHeight(el.offsetHeight);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Poster natural size in CSS pixels (96dpi: 1mm = 3.7795px)
  const POSTER_PX_W = POSTER_W_MM * 3.7795;
  const POSTER_PX_H = POSTER_H_MM * 3.7795;
  const PADDING = 24;

  const computeMinZoom = useCallback(() => {
    const availW = window.innerWidth - PADDING * 2;
    const availH = window.innerHeight - toolbarHeight - PADDING * 2;
    return Math.min(availW / POSTER_PX_W, availH / POSTER_PX_H);
  }, [POSTER_PX_W, POSTER_PX_H, toolbarHeight]);

  useEffect(() => {
    const update = () => {
      const mz = computeMinZoom();
      setMinZoom(mz);
      setZoom((z) => Math.max(z, mz));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [computeMinZoom]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      setZoom((z) => {
        const next = z * (1 - e.deltaY * 0.003);
        return Math.min(3, Math.max(minZoom, next));
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [minZoom]);

  useEffect(() => {
    if (!editMode) return;
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;
      if (e.key === "z" || e.key === "Z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editMode, undo, redo]);

  const setPos = useCallback((id: string, pos: Pos) => {
    setLayout((prev) => ({ ...prev, [id]: pos }));
  }, []);

  const pxPerMm = useCallback(() => {
    const el = canvasRef.current;
    if (!el) return 3.78;
    return el.getBoundingClientRect().width / POSTER_W_MM;
  }, []);

  const collectInnerSnapLines = useCallback(
    (excludeEl?: HTMLElement | null) => {
      const canvas = canvasRef.current;
      if (!canvas) return { xLines: [], yLines: [] };
      const cRect = canvas.getBoundingClientRect();
      const scale = cRect.width / POSTER_W_MM;
      if (scale === 0) return { xLines: [], yLines: [] };
      const xLines: number[] = [];
      const yLines: number[] = [];
      const elements = canvas.querySelectorAll<HTMLElement>("[data-snap]");
      elements.forEach((el) => {
        if (excludeEl && excludeEl.contains(el)) return;
        const r = el.getBoundingClientRect();
        xLines.push((r.left - cRect.left) / scale);
        xLines.push((r.right - cRect.left) / scale);
        yLines.push((r.top - cRect.top) / scale);
        yLines.push((r.bottom - cRect.top) / scale);
      });
      return { xLines, yLines };
    },
    []
  );

  const ids = Object.keys(layout);

  const handleResetLayout = () => {
    pushHistory();
    setLayout(defaults);
  };

  const handleResetOptions = () => setOptions(DEFAULT_OPTIONS);

  const handleCopy = async () => {
    const data = JSON.stringify({ layout, options }, null, 2);
    try {
      await navigator.clipboard.writeText(data);
      alert("Layout og innstillinger kopiert til utklippstavla!");
    } catch {
      alert("Kunne ikke kopiere – sjekk konsollet.");
      console.log(data);
    }
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importText) as {
        layout?: Layout;
        options?: Partial<Options>;
      };
      pushHistory();
      if (parsed.layout) {
        setLayout({ ...defaults, ...parsed.layout });
      }
      if (parsed.options) {
        setOptions({
          ...DEFAULT_OPTIONS,
          ...parsed.options,
          fonts: { ...DEFAULT_FONTS, ...(parsed.options.fonts ?? {}) },
        });
      }
      setImportOpen(false);
      setImportText("");
    } catch {
      alert("Ugyldig JSON. Sjekk at du har limt inn hele teksten.");
    }
  };

  const fontVars: CSSProperties = {
    ["--ft-section-title" as string]: `${options.fonts.sectionTitle}px`,
    ["--ft-stat-value" as string]: `${options.fonts.statValue}px`,
    ["--ft-stat-label" as string]: `${options.fonts.statLabel}px`,
    ["--ft-record-time" as string]: `${options.fonts.recordTime}px`,
    ["--ft-record-name" as string]: `${options.fonts.recordName}px`,
    ["--ft-funfact-title" as string]: `${options.fonts.funFactTitle}px`,
    ["--ft-funfact-text" as string]: `${options.fonts.funFactText}px`,
    ["--ft-trofaste-row" as string]: `${options.fonts.trofasteRow}px`,
    ["--ft-top5-header" as string]: `${options.fonts.top5Header}px`,
    ["--ft-top5-row" as string]: `${options.fonts.top5Row}px`,
    ["--ft-course-stat-value" as string]: `${options.fonts.courseStatValue}px`,
    ["--ft-course-stat-label" as string]: `${options.fonts.courseStatLabel}px`,
    ["--ft-colophon-title" as string]: `${options.fonts.colophonTitle}px`,
    ["--ft-colophon-text" as string]: `${options.fonts.colophonText}px`,
  };

  return (
    <Ctx.Provider
      value={{
        layout,
        setPos,
        pushHistory,
        editMode,
        guides,
        setGuides,
        pxPerMm,
        ids,
        options,
        collectInnerSnapLines,
      }}
    >
      <div ref={toolbarRef} className="print:hidden fixed top-0 left-0 right-0 z-50 bg-navy text-white shadow-md">
        <div className="px-4 py-2 flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setEditMode((v) => !v)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              editMode ? "bg-red" : "bg-white/15 hover:bg-white/25"
            }`}
          >
            {editMode ? "Avslutt redigering" : "Rediger layout"}
          </button>
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => setZoom((z) => Math.max(minZoom, z - 0.1))}
              className="px-2 py-1 rounded text-sm bg-white/15 hover:bg-white/25"
              title="Zoom ut"
            >
              −
            </button>
            <button
              onClick={() => setZoom(minZoom)}
              className="px-2 py-1 rounded text-sm bg-white/15 hover:bg-white/25 tabular-nums w-14 text-center"
              title="Tilpass til skjerm"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
              className="px-2 py-1 rounded text-sm bg-white/15 hover:bg-white/25"
              title="Zoom inn"
            >
              +
            </button>
          </div>
          {editMode && (
            <>
              <div className="flex items-center gap-1">
                <button
                  onClick={undo}
                  disabled={history.length === 0}
                  className="px-2 py-1 rounded text-sm bg-white/15 hover:bg-white/25 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Angre (Cmd/Ctrl+Z)"
                >
                  ↶ Angre
                </button>
                <button
                  onClick={redo}
                  disabled={future.length === 0}
                  className="px-2 py-1 rounded text-sm bg-white/15 hover:bg-white/25 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Gjør om (Cmd/Ctrl+Shift+Z)"
                >
                  ↷ Gjør om
                </button>
              </div>
              <button
                onClick={() =>
                  setActivePanel((p) => (p === "fonts" ? null : "fonts"))
                }
                className={`px-3 py-1 rounded text-sm ${
                  activePanel === "fonts"
                    ? "bg-red"
                    : "bg-white/15 hover:bg-white/25"
                }`}
              >
                Aa Skrift
              </button>
              <button
                onClick={() =>
                  setActivePanel((p) => (p === "content" ? null : "content"))
                }
                className={`px-3 py-1 rounded text-sm ${
                  activePanel === "content"
                    ? "bg-red"
                    : "bg-white/15 hover:bg-white/25"
                }`}
              >
                ⚙ Innhold
              </button>
              <button
                onClick={handleResetLayout}
                className="px-3 py-1 rounded text-sm bg-white/15 hover:bg-white/25"
              >
                Tilbakestill layout
              </button>
              <button
                onClick={handleCopy}
                className="px-3 py-1 rounded text-sm bg-white/15 hover:bg-white/25"
                title="Kopier hele layouten + innstillingene som backup"
              >
                Kopier JSON
              </button>
              <button
                onClick={() => setImportOpen(true)}
                className="px-3 py-1 rounded text-sm bg-white/15 hover:bg-white/25"
                title="Lim inn tidligere lagret JSON for å gjenopprette"
              >
                Importer JSON
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  setTimeout(() => window.print(), 100);
                }}
                className="px-3 py-1 rounded text-sm bg-white/15 hover:bg-white/25"
                title="Åpner utskriftsdialog — velg 'Lagre som PDF'"
              >
                Last ned PDF
              </button>
              <span className="text-xs text-white/50 ml-auto">
                Lagres automatisk
              </span>
            </>
          )}
        </div>

        {editMode && activePanel === "fonts" && (
          <div className="bg-navy/95 border-t border-white/10 px-4 py-3">
            <div className="grid grid-cols-3 gap-3 text-xs">
              <FontControl
                label="Seksjonstitler"
                value={options.fonts.sectionTitle}
                min={14}
                max={48}
                onChange={(v) =>
                  setOptions((o) => ({
                    ...o,
                    fonts: { ...o.fonts, sectionTitle: v },
                  }))
                }
              />
              <FontControl
                label="Stor stat-verdi"
                value={options.fonts.statValue}
                min={10}
                max={40}
                onChange={(v) =>
                  setOptions((o) => ({
                    ...o,
                    fonts: { ...o.fonts, statValue: v },
                  }))
                }
              />
              <FontControl
                label="Stat-etikett"
                value={options.fonts.statLabel}
                min={8}
                max={20}
                onChange={(v) =>
                  setOptions((o) => ({
                    ...o,
                    fonts: { ...o.fonts, statLabel: v },
                  }))
                }
              />
              <FontControl
                label="Løype-stat verdi"
                value={options.fonts.courseStatValue}
                min={10}
                max={40}
                onChange={(v) =>
                  setOptions((o) => ({
                    ...o,
                    fonts: { ...o.fonts, courseStatValue: v },
                  }))
                }
              />
              <FontControl
                label="Løype-stat etikett"
                value={options.fonts.courseStatLabel}
                min={8}
                max={20}
                onChange={(v) =>
                  setOptions((o) => ({
                    ...o,
                    fonts: { ...o.fonts, courseStatLabel: v },
                  }))
                }
              />
              <FontControl
                label="Rekord-tid"
                value={options.fonts.recordTime}
                min={20}
                max={70}
                onChange={(v) =>
                  setOptions((o) => ({
                    ...o,
                    fonts: { ...o.fonts, recordTime: v },
                  }))
                }
              />
              <FontControl
                label="Rekord-navn"
                value={options.fonts.recordName}
                min={9}
                max={24}
                onChange={(v) =>
                  setOptions((o) => ({
                    ...o,
                    fonts: { ...o.fonts, recordName: v },
                  }))
                }
              />
              <FontControl
                label="Faktatittel"
                value={options.fonts.funFactTitle}
                min={10}
                max={28}
                onChange={(v) =>
                  setOptions((o) => ({
                    ...o,
                    fonts: { ...o.fonts, funFactTitle: v },
                  }))
                }
              />
              <FontControl
                label="Faktatekst"
                value={options.fonts.funFactText}
                min={9}
                max={22}
                onChange={(v) =>
                  setOptions((o) => ({
                    ...o,
                    fonts: { ...o.fonts, funFactText: v },
                  }))
                }
              />
              <FontControl
                label="Trofaste rad"
                value={options.fonts.trofasteRow}
                min={10}
                max={26}
                onChange={(v) =>
                  setOptions((o) => ({
                    ...o,
                    fonts: { ...o.fonts, trofasteRow: v },
                  }))
                }
              />
              <FontControl
                label="Topplistetittel"
                value={options.fonts.top5Header}
                min={12}
                max={28}
                onChange={(v) =>
                  setOptions((o) => ({
                    ...o,
                    fonts: { ...o.fonts, top5Header: v },
                  }))
                }
              />
              <FontControl
                label="Topplisterad"
                value={options.fonts.top5Row}
                min={9}
                max={20}
                onChange={(v) =>
                  setOptions((o) => ({
                    ...o,
                    fonts: { ...o.fonts, top5Row: v },
                  }))
                }
              />
              <FontControl
                label="Kolofon tittel"
                value={options.fonts.colophonTitle}
                min={14}
                max={48}
                onChange={(v) =>
                  setOptions((o) => ({
                    ...o,
                    fonts: { ...o.fonts, colophonTitle: v },
                  }))
                }
              />
              <FontControl
                label="Kolofon tekst"
                value={options.fonts.colophonText}
                min={9}
                max={22}
                onChange={(v) =>
                  setOptions((o) => ({
                    ...o,
                    fonts: { ...o.fonts, colophonText: v },
                  }))
                }
              />
            </div>
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleResetOptions}
                className="text-xs text-white/60 hover:text-white"
              >
                Tilbakestill alt
              </button>
            </div>
          </div>
        )}

        {editMode && activePanel === "content" && (
          <div className="bg-navy/95 border-t border-white/10 px-4 py-3 space-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/50 mb-1">
                Antall
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <FontControl
                  label="Antall trofaste løpere"
                  value={options.trofasteCount}
                  min={1}
                  max={10}
                  onChange={(v) =>
                    setOptions((o) => ({ ...o, trofasteCount: v }))
                  }
                />
                <FontControl
                  label="Antall i Topp pr. klasse"
                  value={options.top5Count}
                  min={1}
                  max={10}
                  onChange={(v) =>
                    setOptions((o) => ({ ...o, top5Count: v }))
                  }
                />
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/50 mb-1">
                Min-bredde sub-bokser (mm) – styrer auto-stacking
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <FontControl
                  label="Stat-bokser (Nøkkeltall + Løypa)"
                  value={options.statMinWidth}
                  min={30}
                  max={200}
                  onChange={(v) =>
                    setOptions((o) => ({ ...o, statMinWidth: v }))
                  }
                />
                <FontControl
                  label="Rekord-bokser"
                  value={options.recordMinWidth}
                  min={40}
                  max={200}
                  onChange={(v) =>
                    setOptions((o) => ({ ...o, recordMinWidth: v }))
                  }
                />
                <FontControl
                  label="Fakta-bokser (Visste du at)"
                  value={options.funFactMinWidth}
                  min={50}
                  max={200}
                  onChange={(v) =>
                    setOptions((o) => ({ ...o, funFactMinWidth: v }))
                  }
                />
                <FontControl
                  label="Trofaste-bokser"
                  value={options.trofasteMinWidth}
                  min={50}
                  max={200}
                  onChange={(v) =>
                    setOptions((o) => ({ ...o, trofasteMinWidth: v }))
                  }
                />
                <FontControl
                  label="Topp pr. klasse-bokser"
                  value={options.top5MinWidth}
                  min={40}
                  max={200}
                  onChange={(v) =>
                    setOptions((o) => ({ ...o, top5MinWidth: v }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleResetOptions}
                className="text-xs text-white/60 hover:text-white"
              >
                Tilbakestill alt
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="print:hidden shrink-0" style={{ height: toolbarHeight }} aria-hidden />

      {importOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4"
          onClick={() => setImportOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg text-navy mb-2">
              Importer lagret layout
            </h3>
            <p className="text-sm text-navy/70 mb-3">
              Lim inn JSON-en du tidligere kopierte (med &quot;Kopier
              JSON&quot;-knappen). Dette overskriver gjeldende layout og
              innstillinger.
            </p>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='{"layout": {...}, "options": {...}}'
              className="w-full h-64 border border-navy/20 rounded p-2 font-mono text-xs resize-none focus:outline-none focus:border-red"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => {
                  setImportOpen(false);
                  setImportText("");
                }}
                className="px-3 py-1.5 rounded text-sm text-navy hover:bg-navy/5"
              >
                Avbryt
              </button>
              <button
                onClick={handleImport}
                disabled={!importText.trim()}
                className="px-3 py-1.5 rounded text-sm bg-red text-white hover:bg-red/90 disabled:opacity-40"
              >
                Importer
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        ref={wrapperRef}
        className="print:!p-0 print:!overflow-visible overflow-auto flex-1"
        style={{ touchAction: "pan-x pan-y", paddingTop: toolbarHeight, paddingLeft: 40 }}
      >
      <div className="print-poster-zoom" style={{ transform: `scale(${zoom})`, transformOrigin: "top left", width: "fit-content" }}>
      <div
        ref={canvasRef}
        className="print-poster w-[594mm] h-[420mm] bg-cream-light relative overflow-hidden font-body"
        style={fontVars}
      >
        {children}

        {editMode &&
          guides.map((g, i) =>
            g.type === "v" ? (
              <div
                key={i}
                className="absolute top-0 bottom-0 pointer-events-none"
                style={{
                  left: `${g.mm}mm`,
                  width: 1,
                  background: "#cc1a1a",
                  zIndex: 100,
                }}
              />
            ) : (
              <div
                key={i}
                className="absolute left-0 right-0 pointer-events-none"
                style={{
                  top: `${g.mm}mm`,
                  height: 1,
                  background: "#cc1a1a",
                  zIndex: 100,
                }}
              />
            )
          )}
      </div>
      </div>
      </div>
    </Ctx.Provider>
  );
}

function FontControl({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-white/80 w-44 shrink-0 text-[11px]">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="flex-1 accent-red"
      />
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          if (!Number.isNaN(v)) onChange(v);
        }}
        className="w-12 px-1 py-0.5 bg-white/10 rounded text-center text-white"
      />
    </label>
  );
}

type Interaction =
  | {
      kind: "move";
      startX: number;
      startY: number;
      startPos: Pos;
      innerLines: { xLines: number[]; yLines: number[] };
    }
  | {
      kind: "resize";
      handle: "tl" | "tr" | "bl" | "br" | "t" | "b" | "l" | "r";
      startX: number;
      startY: number;
      startPos: Pos;
      innerLines: { xLines: number[]; yLines: number[] };
    };

function snapValue(
  candidate: number,
  targets: number[]
): { value: number; matched?: number } {
  let best: { value: number; matched: number; diff: number } | null = null;
  for (const t of targets) {
    const d = Math.abs(candidate - t);
    if (d <= SNAP_TOLERANCE_MM && (!best || d < best.diff)) {
      best = { value: t, matched: t, diff: d };
    }
  }
  return best ?? { value: candidate };
}

function detectGaps(boxes: Pos[]): { xGaps: number[]; yGaps: number[] } {
  const xGaps = new Set<number>();
  const yGaps = new Set<number>();
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      const aLeftOfB = b.x - (a.x + a.w);
      const bLeftOfA = a.x - (b.x + b.w);
      if (aLeftOfB > 0.5 && aLeftOfB < 60)
        xGaps.add(Math.round(aLeftOfB * 2) / 2);
      if (bLeftOfA > 0.5 && bLeftOfA < 60)
        xGaps.add(Math.round(bLeftOfA * 2) / 2);
      const aAboveB = b.y - (a.y + a.h);
      const bAboveA = a.y - (b.y + b.h);
      if (aAboveB > 0.5 && aAboveB < 60)
        yGaps.add(Math.round(aAboveB * 2) / 2);
      if (bAboveA > 0.5 && bAboveA < 60)
        yGaps.add(Math.round(bAboveA * 2) / 2);
    }
  }
  return { xGaps: Array.from(xGaps), yGaps: Array.from(yGaps) };
}

export function DraggableBox({
  id,
  children,
  className = "",
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  const {
    layout,
    setPos,
    pushHistory,
    editMode,
    setGuides,
    pxPerMm,
    ids,
    collectInnerSnapLines,
  } = useLayoutCtx();
  const pos = layout[id];
  const boxRef = useRef<HTMLDivElement>(null);
  const [interaction, setInteraction] = useState<Interaction | null>(null);

  useEffect(() => {
    if (!interaction) return;

    const onMove = (e: MouseEvent) => {
      const scale = pxPerMm();
      if (scale === 0) return;
      const dxMm = (e.clientX - interaction.startX) / scale;
      const dyMm = (e.clientY - interaction.startY) / scale;
      const sp = interaction.startPos;

      let newPos: Pos = { ...sp };

      if (interaction.kind === "move") {
        newPos = { ...sp, x: sp.x + dxMm, y: sp.y + dyMm };
      } else {
        const h = interaction.handle;
        let x = sp.x;
        let y = sp.y;
        let w = sp.w;
        let hh = sp.h;
        if (h.includes("l")) {
          x = sp.x + dxMm;
          w = sp.w - dxMm;
        }
        if (h.includes("r")) {
          w = sp.w + dxMm;
        }
        if (h.includes("t")) {
          y = sp.y + dyMm;
          hh = sp.h - dyMm;
        }
        if (h.includes("b")) {
          hh = sp.h + dyMm;
        }
        newPos = { x, y, w: Math.max(10, w), h: Math.max(10, hh) };
      }

      const others = ids.filter((other) => other !== id);
      let xTargets: number[] = [0, POSTER_W_MM / 2, POSTER_W_MM];
      let yTargets: number[] = [0, POSTER_H_MM / 2, POSTER_H_MM];
      for (const oid of others) {
        const o = layout[oid];
        xTargets.push(o.x, o.x + o.w / 2, o.x + o.w);
        yTargets.push(o.y, o.y + o.h / 2, o.y + o.h);
      }

      // Inner snap lines (kun ved resize – holder move-snapping enkelt)
      if (interaction.kind === "resize") {
        xTargets = xTargets.concat(interaction.innerLines.xLines);
        yTargets = yTargets.concat(interaction.innerLines.yLines);
      }

      // Auto-detect mellomrom mellom andre bokser og snap til samme mellomrom
      const otherBoxes = others.map((oid) => layout[oid]);
      const { xGaps, yGaps } = detectGaps(otherBoxes);
      for (const oid of others) {
        const o = layout[oid];
        for (const g of xGaps) {
          xTargets.push(o.x - g, o.x + o.w + g);
        }
        for (const g of yGaps) {
          yTargets.push(o.y - g, o.y + o.h + g);
        }
      }

      const guides: Guide[] = [];

      if (interaction.kind === "move") {
        const left = newPos.x;
        const right = newPos.x + newPos.w;
        const hCen = newPos.x + newPos.w / 2;
        const sl = snapValue(left, xTargets);
        const sr = snapValue(right, xTargets);
        const sc = snapValue(hCen, xTargets);
        const xCandidates = [
          { snap: sl, apply: (v: number) => v },
          { snap: sr, apply: (v: number) => v - newPos.w },
          { snap: sc, apply: (v: number) => v - newPos.w / 2 },
        ].filter((c) => c.snap.matched !== undefined);
        if (xCandidates.length) {
          const best = xCandidates[0];
          newPos.x = best.apply(best.snap.value);
          guides.push({ type: "v", mm: best.snap.value });
        }

        const top = newPos.y;
        const bot = newPos.y + newPos.h;
        const vCen = newPos.y + newPos.h / 2;
        const st = snapValue(top, yTargets);
        const sb = snapValue(bot, yTargets);
        const svc = snapValue(vCen, yTargets);
        const yCandidates = [
          { snap: st, apply: (v: number) => v },
          { snap: sb, apply: (v: number) => v - newPos.h },
          { snap: svc, apply: (v: number) => v - newPos.h / 2 },
        ].filter((c) => c.snap.matched !== undefined);
        if (yCandidates.length) {
          const best = yCandidates[0];
          newPos.y = best.apply(best.snap.value);
          guides.push({ type: "h", mm: best.snap.value });
        }
      } else {
        const h = interaction.handle;
        if (h.includes("l")) {
          const s = snapValue(newPos.x, xTargets);
          if (s.matched !== undefined) {
            const right = sp.x + sp.w;
            newPos.x = s.value;
            newPos.w = right - s.value;
            guides.push({ type: "v", mm: s.value });
          }
        }
        if (h.includes("r")) {
          const right = newPos.x + newPos.w;
          const s = snapValue(right, xTargets);
          if (s.matched !== undefined) {
            newPos.w = s.value - newPos.x;
            guides.push({ type: "v", mm: s.value });
          }
        }
        if (h.includes("t")) {
          const s = snapValue(newPos.y, yTargets);
          if (s.matched !== undefined) {
            const bottom = sp.y + sp.h;
            newPos.y = s.value;
            newPos.h = bottom - s.value;
            guides.push({ type: "h", mm: s.value });
          }
        }
        if (h.includes("b")) {
          const bottom = newPos.y + newPos.h;
          const s = snapValue(bottom, yTargets);
          if (s.matched !== undefined) {
            newPos.h = s.value - newPos.y;
            guides.push({ type: "h", mm: s.value });
          }
        }
      }

      setGuides(guides);
      setPos(id, newPos);
    };

    const onUp = () => {
      setInteraction(null);
      setGuides([]);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [interaction, id, layout, ids, pxPerMm, setGuides, setPos]);

  if (!pos) return null;

  const startMove = (e: React.MouseEvent) => {
    if (!editMode) return;
    e.preventDefault();
    e.stopPropagation();
    pushHistory();
    setInteraction({
      kind: "move",
      startX: e.clientX,
      startY: e.clientY,
      startPos: { ...pos },
      innerLines: collectInnerSnapLines(boxRef.current),
    });
  };

  const startResize =
    (handle: "tl" | "tr" | "bl" | "br" | "t" | "b" | "l" | "r") =>
    (e: React.MouseEvent) => {
      if (!editMode) return;
      e.preventDefault();
      e.stopPropagation();
      pushHistory();
      setInteraction({
        kind: "resize",
        handle,
        startX: e.clientX,
        startY: e.clientY,
        startPos: { ...pos },
        innerLines: collectInnerSnapLines(boxRef.current),
      });
    };

  return (
    <div
      ref={boxRef}
      style={{
        position: "absolute",
        left: `${pos.x}mm`,
        top: `${pos.y}mm`,
        width: `${pos.w}mm`,
        height: `${pos.h}mm`,
      }}
      className={`${className} ${
        editMode
          ? "outline outline-2 outline-red/40 outline-offset-[-2px] cursor-move"
          : ""
      }`}
      onMouseDown={startMove}
    >
      <div className="w-full h-full relative">{children}</div>

      {editMode && (
        <>
          <Handle pos="tl" onMouseDown={startResize("tl")} />
          <Handle pos="tr" onMouseDown={startResize("tr")} />
          <Handle pos="bl" onMouseDown={startResize("bl")} />
          <Handle pos="br" onMouseDown={startResize("br")} />
          <Handle pos="t" onMouseDown={startResize("t")} />
          <Handle pos="b" onMouseDown={startResize("b")} />
          <Handle pos="l" onMouseDown={startResize("l")} />
          <Handle pos="r" onMouseDown={startResize("r")} />
        </>
      )}
    </div>
  );
}

function Handle({
  pos,
  onMouseDown,
}: {
  pos: "tl" | "tr" | "bl" | "br" | "t" | "b" | "l" | "r";
  onMouseDown: (e: React.MouseEvent) => void;
}) {
  const sz = 12;
  const half = sz / 2;
  const styles: Record<string, React.CSSProperties> = {
    tl: { top: -half, left: -half, cursor: "nwse-resize" },
    tr: { top: -half, right: -half, cursor: "nesw-resize" },
    bl: { bottom: -half, left: -half, cursor: "nesw-resize" },
    br: { bottom: -half, right: -half, cursor: "nwse-resize" },
    t: {
      top: -half,
      left: "50%",
      transform: "translateX(-50%)",
      cursor: "ns-resize",
    },
    b: {
      bottom: -half,
      left: "50%",
      transform: "translateX(-50%)",
      cursor: "ns-resize",
    },
    l: {
      left: -half,
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "ew-resize",
    },
    r: {
      right: -half,
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "ew-resize",
    },
  };

  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        position: "absolute",
        width: sz,
        height: sz,
        background: "#cc1a1a",
        border: "2px solid white",
        borderRadius: 2,
        zIndex: 50,
        ...styles[pos],
      }}
    />
  );
}
