"use client";

import { useState, useMemo } from "react";
import type { Result } from "@/lib/data";

interface PersonalResult {
  name: string;
  timedResults: Result[];
  untimedResults: Result[];
  bestTime: Result | null;
  totalParticipations: number;
}

function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase().replace(/[-]/g, " ").trim();
  const t = target.toLowerCase().replace(/[-]/g, " ").trim();

  if (q === t) return 1;

  const qParts = q.split(/\s+/);
  const tParts = t.split(/\s+/);

  let totalScore = 0;
  let exactPartMatches = 0;

  for (const qp of qParts) {
    let bestPartScore = 0;
    for (const tp of tParts) {
      if (qp === tp) {
        bestPartScore = 1;
        exactPartMatches++;
        break;
      }
      const score = levenshteinSimilarity(qp, tp);
      if (score > bestPartScore) bestPartScore = score;
    }
    totalScore += bestPartScore;
  }

  const baseScore = totalScore / Math.max(qParts.length, tParts.length);

  // Bonus for exact word matches (prioritizes "Anne" matching firstName "Anne"
  // over "Johannes" which merely contains "anne" as substring)
  const exactBonus = exactPartMatches * 0.15;

  return Math.min(baseScore + exactBonus, 1);
}

function levenshteinSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;

  const matrix: number[][] = [];
  for (let i = 0; i <= a.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return 1 - matrix[a.length][b.length] / maxLen;
}

export function PersonalStats({ allResults }: { allResults: Result[] }) {
  const [search, setSearch] = useState("");
  const [person, setPerson] = useState<PersonalResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const uniqueNames = useMemo(() => {
    const nameMap = new Map<string, { firstName: string; lastName: string }>();
    for (const r of allResults) {
      const key = `${r.firstName} ${r.lastName}`.toLowerCase().trim();
      if (!nameMap.has(key)) {
        nameMap.set(key, { firstName: r.firstName, lastName: r.lastName });
      }
    }
    return Array.from(nameMap.values());
  }, [allResults]);

  function findBestMatch(query: string): { firstName: string; lastName: string } | null {
    let bestScore = 0;
    let bestMatch: { firstName: string; lastName: string } | null = null;

    for (const { firstName, lastName } of uniqueNames) {
      const fullName = `${firstName} ${lastName}`;
      const reverseName = `${lastName} ${firstName}`;

      // Exact full match gets highest priority
      if (fullName.toLowerCase() === query || reverseName.toLowerCase() === query) {
        return { firstName, lastName };
      }

      const score = Math.max(
        fuzzyScore(query, fullName),
        fuzzyScore(query, reverseName)
      );
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { firstName, lastName };
      }
    }

    if (bestScore >= 0.4) return bestMatch;
    return null;
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;

    setHasSearched(true);
    const normalizedSearch = search.toLowerCase().trim();

    // Find the best matching person (always resolve to one individual)
    const match = findBestMatch(normalizedSearch);
    if (!match) {
      setPerson(null);
      return;
    }

    const personResults = allResults.filter(
      (r) => r.firstName === match.firstName && r.lastName === match.lastName
    );

    if (personResults.length === 0) {
      setPerson(null);
      return;
    }

    const timedResults = personResults
      .filter((r) => r.timed)
      .sort((a, b) => a.year - b.year);
    const untimedResults = personResults
      .filter((r) => !r.timed)
      .sort((a, b) => a.year - b.year);

    const sortedByTime = [...timedResults].sort(
      (a, b) => a.timeInSeconds - b.timeInSeconds
    );

    setPerson({
      name: `${match.firstName} ${match.lastName}`,
      timedResults,
      untimedResults,
      bestTime: sortedByTime.length > 0 ? sortedByTime[0] : null,
      totalParticipations: personResults.length,
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
          {person.timedResults.length > 0 ? (
            <>
              <div className="flex items-center gap-4 pb-3 border-b border-navy/10">
                <div>
                  <h4 className="font-display text-xl text-navy">{person.name}</h4>
                  <p className="text-sm text-navy/60">
                    {person.totalParticipations} {person.totalParticipations === 1 ? "deltakelse" : "deltakelser"} registrert
                  </p>
                </div>
                {person.bestTime && (
                  <div className="ml-auto text-right">
                    <p className="text-xs text-navy/60 mb-1">Personlig rekord</p>
                    <p className="font-display text-3xl text-red leading-none mb-1">
                      {person.bestTime.time}
                    </p>
                    <p className="text-xs text-navy/60">{person.bestTime.year}</p>
                  </div>
                )}
              </div>

              {/* Progress chart – only timed results */}
              {person.timedResults.length >= 2 && (
                <div>
                  <h5 className="text-sm font-medium text-navy/70 mb-2">
                    Utvikling over tid
                  </h5>
                  <TimeChart results={person.timedResults} />
                </div>
              )}

              {/* Timed results list */}
              <div className="space-y-1">
                {person.timedResults.map((r, i) => (
                  <div
                    key={i}
                    className={`flex items-center px-3 py-2 rounded text-sm ${
                      person.bestTime && r.timeInSeconds === person.bestTime.timeInSeconds
                        ? "bg-red/10 border border-red/20"
                        : "bg-[#fbf9f7]"
                    }`}
                  >
                    <span className="font-display text-lg w-14">{r.time}</span>
                    <span className="text-navy/60 w-12">{r.year}</span>
                    <span className="text-navy/60 w-16">{r.class}</span>
                    <span className="text-navy/60">Plass: {r.place || "–"}</span>
                    {person.bestTime && r.timeInSeconds === person.bestTime.timeInSeconds && (
                      <span className="ml-auto text-xs text-red font-medium">PR</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Untimed participations (trim/barn) – when also has timed */}
              {person.untimedResults.length > 0 && (
                <div className="pt-2 border-t border-navy/10">
                  <p className="text-sm text-navy/60 mb-2">
                    Deltok også uten tidtaking:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {person.untimedResults.map((r, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#f8f5f0] text-xs text-navy/70"
                      >
                        {r.year}
                        <span className="text-navy/40">({r.class})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <h4 className="font-display text-xl text-navy">{person.name}</h4>
                <p className="text-sm text-navy/60 mt-1">
                  {person.untimedResults.length} {person.untimedResults.length === 1 ? "deltakelse" : "deltakelser"} registrert uten tidtaking:
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {person.untimedResults.map((r, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#f8f5f0] text-xs text-navy/70"
                  >
                    {r.year}
                    <span className="text-navy/40">({r.class})</span>
                  </span>
                ))}
              </div>
            </>
          )}
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
