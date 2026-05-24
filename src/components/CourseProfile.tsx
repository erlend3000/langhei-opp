"use client";
import { useRef, useState, useEffect } from "react";
import { PROFILE_PATH } from "./profile-path";

export function CourseProfile({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 600, height: 280 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) setDims({ width, height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ===== JUSTERBARE VERDIER =====
  const STROKE_WIDTH = 2.5;        // px (non-scaling)
  const FONT_SIZE = 11;            // px – konstant tekststørrelse
  const Y_TEXT_AREA = 26;          // px – plass til "90m"-teksten (mindre = mindre luft mot faktaboksene)
  const Y_LABEL_GAP = 28;          // px – luft mellom y-labels og selve profilen
  const X_LABEL_HEIGHT = 14;       // px – tekst-høyde for distansetallene
  const X_LABEL_TOP_GAP = 24;      // px – luft mellom profilbunn og distansetallene
  // ==============================

  // Profile coords (i viewBox-enheter, må ikke endres)
  const profileTop = 52;
  const profileRange = 544;
  const profileLeft = 4;
  const profileRight = 3340;
  const profileWidth = profileRight - profileLeft;

  // SVG fyller høyre del av containeren (venstre del er reservert til y-labels)
  const svgAreaLeft = Y_TEXT_AREA + Y_LABEL_GAP;
  const svgAreaWidth = Math.max(1, dims.width - svgAreaLeft);
  const svgAreaHeight = Math.max(1, dims.height - X_LABEL_HEIGHT - X_LABEL_TOP_GAP);

  // viewBox – aspekt matches svg-areaet, så innholdet fyller eksakt
  const vbX = profileLeft;
  const vbY = -20;
  const vbW = profileWidth + 8; // litt høyremargin til siste sirkel
  const vbH = vbW * (svgAreaHeight / svgAreaWidth);

  const topSpace = profileTop - vbY;
  const bottomMargin = 40; // viewBox-enheter under profilen til startsirkelen
  const availableForProfile = vbH - topSpace - bottomMargin;
  const profileScaleY = Math.max(0.8, availableForProfile / profileRange);

  const scaledBottom = profileTop + profileRange * profileScaleY;
  const profileTransform = `translate(0, ${profileTop}) scale(1, ${profileScaleY}) translate(0, ${-profileTop})`;

  // Fyll-path-en slutter eksakt på viewBox-bunnen (etter at transformen er anvendt)
  // → ingen overflow nedover, selv med overflow="visible" for kulene
  const fillBottomY = profileTop + (vbH + vbY - profileTop) / profileScaleY;

  const elevToY = (elev: number) =>
    profileTop + ((88 - elev) / (88 - 31)) * profileRange * profileScaleY;

  const gridLines = [30, 50, 70, 90];

  const pxPerKm = profileWidth / 2.18;
  const distMarkers = [
    { dist: 0, label: "0 m" },
    { dist: 0.5, label: "500 m" },
    { dist: 1.0, label: "1000 m" },
    { dist: 1.5, label: "1500 m" },
    { dist: 2.0, label: "2000 m" },
  ];

  // Konverter viewBox-koordinater til piksler relativt til containeren
  const elevToPxY = (elev: number) =>
    ((elevToY(elev) - vbY) / vbH) * svgAreaHeight;

  const distToPxX = (dist: number) => {
    const xVb = profileLeft + dist * pxPerKm;
    return svgAreaLeft + ((xVb - vbX) / vbW) * svgAreaWidth;
  };

  return (
    <div className={`flex flex-col h-full w-full ${className}`}>
      <p className="text-center text-sm text-gray-500 font-body mb-1">
        Fra Gjeving skole (31 moh.) til Toppen av Langhei (88 moh.)
      </p>

      <div ref={containerRef} className="relative flex-1 min-h-0 w-full">
        <svg
          viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
          preserveAspectRatio="xMidYMid meet"
          overflow="visible"
          className="absolute block"
          style={{
            left: `${svgAreaLeft}px`,
            top: 0,
            width: `${svgAreaWidth}px`,
            height: `${svgAreaHeight}px`,
          }}
          aria-label="Løypeprofil Langhei Opp"
        >
          <defs>
            <linearGradient id="profileFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#cc1a1a" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#cc1a1a" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#cc1a1a" stopOpacity="0.25" />
            </linearGradient>
          </defs>

          {gridLines.map((elev) => {
            const y = elevToY(elev);
            return (
              <line
                key={elev}
                x1={profileLeft}
                y1={y}
                x2={profileRight}
                y2={y}
                stroke="#ddd"
                strokeWidth="2"
              />
            );
          })}

          <path
            d={`${PROFILE_PATH} L ${profileLeft} ${fillBottomY} L ${profileRight} ${fillBottomY} Z`}
            fill="url(#profileFillGrad)"
            transform={profileTransform}
          />

          <path
            d={PROFILE_PATH}
            fill="none"
            stroke="#cc1a1a"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
            transform={profileTransform}
            vectorEffect="non-scaling-stroke"
          />

          <circle cx={profileLeft} cy={scaledBottom} r="32" fill="#001c43" />
          <circle cx={profileRight} cy={profileTop} r="32" fill="#cc1a1a" />
        </svg>

        {/* Y-axis labels – HTML, konstant fontstørrelse */}
        {gridLines.map((elev) => (
          <div
            key={elev}
            className="absolute font-body pointer-events-none"
            style={{
              top: `${elevToPxY(elev)}px`,
              left: 0,
              width: `${Y_TEXT_AREA}px`,
              transform: "translateY(-50%)",
              textAlign: "right",
              fontSize: `${FONT_SIZE}px`,
              color: "#6b7280",
              lineHeight: 1,
            }}
          >
            {elev}m
          </div>
        ))}

        {/* X-axis labels – HTML, bunnen kant-i-kant med faktaboksene */}
        {distMarkers.map(({ dist, label }) => (
          <div
            key={label}
            className="absolute font-body pointer-events-none"
            style={{
              left: `${distToPxX(dist)}px`,
              bottom: 0,
              transform: "translateX(-50%)",
              fontSize: `${FONT_SIZE}px`,
              color: "#6b7280",
              whiteSpace: "nowrap",
              lineHeight: 1,
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
