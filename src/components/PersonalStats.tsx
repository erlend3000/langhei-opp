"use client";

import { useState } from "react";
import type { Result } from "@/lib/data";

interface PersonalResult {
  name: string;
  results: Result[];
  bestTime: Result;
  totalRaces: number;
}

export function PersonalStats({ allResults }: { allResults: Result[] }) {
  const [search, setSearch] = useState("");
  const [person, setPerson] = useState<PersonalResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;

    setHasSearched(true);
    const normalizedSearch = search.toLowerCase().trim();
    const personResults = allResults.filter((r) => {
      const fullName = `${r.firstName} ${r.lastName}`.toLowerCase().trim();
      const reverseName = `${r.lastName} ${r.firstName}`.toLowerCase().trim();
      return (
        fullName.includes(normalizedSearch) ||
        reverseName.includes(normalizedSearch)
      );
    });

    if (personResults.length === 0) {
      setPerson(null);
      return;
    }

    const sorted = [...personResults].sort(
      (a, b) => a.timeInSeconds - b.timeInSeconds
    );

    setPerson({
      name: `${sorted[0].firstName} ${sorted[0].lastName}`,
      results: personResults.sort((a, b) => a.year - b.year),
      bestTime: sorted[0],
      totalRaces: personResults.length,
    });
  }

  return (
    <div className="bg-white rounded-xl border border-navy/10 p-6">
      <h3 className="font-display text-2xl text-navy mb-4">
        DINE RESULTATER
      </h3>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Skriv inn navn..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setHasSearched(false);
          }}
          className="flex-1 px-4 py-2 rounded-lg border border-navy/20 bg-[#f8f5f0] focus:outline-none focus:ring-2 focus:ring-red/50 text-sm"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-red text-white rounded-lg font-medium text-sm hover:bg-red-dark transition-colors"
        >
          Søk
        </button>
      </form>

      {person && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 pb-3 border-b border-navy/10">
            <div>
              <h4 className="font-display text-xl text-navy">{person.name}</h4>
              <p className="text-sm text-navy/60">
                {person.totalRaces} {person.totalRaces === 1 ? "løp" : "løp"} registrert
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-navy/60">Personlig rekord</p>
              <p className="font-display text-3xl text-red">
                {person.bestTime.time}
              </p>
              <p className="text-xs text-navy/60">{person.bestTime.year}</p>
            </div>
          </div>

          {/* Progress chart */}
          <div>
            <h5 className="text-sm font-medium text-navy/70 mb-2">
              Utvikling over tid
            </h5>
            <TimeChart results={person.results} />
          </div>

          {/* Results list */}
          <div className="space-y-1">
            {person.results.map((r, i) => (
              <div
                key={i}
                className={`flex items-center px-3 py-2 rounded text-sm ${
                  r.timeInSeconds === person.bestTime.timeInSeconds
                    ? "bg-red/10 border border-red/20"
                    : "bg-cream-light/50"
                }`}
              >
                <span className="font-display text-lg w-14">{r.time}</span>
                <span className="text-navy/60 w-12">{r.year}</span>
                <span className="text-navy/60 w-16">{r.class}</span>
                <span className="text-navy/60">Plass: {r.place || "–"}</span>
                {r.timeInSeconds === person.bestTime.timeInSeconds && (
                  <span className="ml-auto text-xs text-red font-medium">PR</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!person && hasSearched && (
        <p className="text-sm text-navy/60 italic">
          Ingen resultater funnet for «{search}». Prøv et annet navn.
        </p>
      )}
    </div>
  );
}

function TimeChart({ results }: { results: Result[] }) {
  if (results.length < 2) return null;

  const times = results.map((r) => r.timeInSeconds);
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const range = maxTime - minTime || 60;

  const width = 300;
  const height = 80;
  const padding = { top: 10, bottom: 20, left: 10, right: 10 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const points = results.map((r, i) => ({
    x: padding.left + (i / (results.length - 1)) * chartWidth,
    y:
      padding.top +
      ((r.timeInSeconds - minTime) / range) * chartHeight,
    result: r,
  }));

  const pathData = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-20">
      {/* Grid line at PR */}
      <line
        x1={padding.left}
        y1={padding.top}
        x2={width - padding.right}
        y2={padding.top}
        stroke="#d63a3a"
        strokeWidth="0.5"
        strokeDasharray="3,3"
        opacity="0.5"
      />

      {/* Line */}
      <path d={pathData} fill="none" stroke="#1b2a4a" strokeWidth="2" />

      {/* Points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle
            cx={p.x}
            cy={p.y}
            r="3"
            fill={
              p.result.timeInSeconds === minTime ? "#d63a3a" : "#1b2a4a"
            }
          />
          <text
            x={p.x}
            y={height - 4}
            textAnchor="middle"
            fontSize="8"
            fill="#1b2a4a"
            opacity="0.6"
          >
            {p.result.year.toString().slice(-2)}
          </text>
        </g>
      ))}
    </svg>
  );
}
