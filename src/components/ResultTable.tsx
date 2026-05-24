"use client";

import { useState, useMemo } from "react";
import type { Result } from "@/lib/data";

type SortField = "time" | "name" | "year" | "class" | "place";
type SortDir = "asc" | "desc";

export function ResultTable({ results }: { results: Result[] }) {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("time");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const classes = useMemo(
    () => [...new Set(results.map((r) => r.class))].sort(),
    [results]
  );
  const years = useMemo(
    () => [...new Set(results.map((r) => r.year))].sort((a, b) => b - a),
    [results]
  );

  const filtered = useMemo(() => {
    let data = [...results];

    if (search) {
      const s = search.toLowerCase();
      data = data.filter(
        (r) =>
          `${r.firstName} ${r.lastName}`.toLowerCase().includes(s) ||
          `${r.lastName} ${r.firstName}`.toLowerCase().includes(s)
      );
    }

    if (classFilter !== "all") {
      data = data.filter((r) => r.class === classFilter);
    }

    if (yearFilter !== "all") {
      data = data.filter((r) => r.year === parseInt(yearFilter));
    }

    data.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "time":
          cmp = a.timeInSeconds - b.timeInSeconds;
          break;
        case "name":
          cmp = `${a.firstName} ${a.lastName}`.localeCompare(
            `${b.firstName} ${b.lastName}`
          );
          break;
        case "year":
          cmp = a.year - b.year;
          break;
        case "class":
          cmp = a.class.localeCompare(b.class);
          break;
        case "place":
          cmp = a.place - b.place;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return data;
  }, [results, search, classFilter, yearFilter, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <span className="opacity-30 ml-1">↕</span>;
    return <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Søk etter navn..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border border-navy/20 bg-white focus:outline-none focus:ring-2 focus:ring-red/50 text-sm"
        />
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="px-4 pr-8 py-2 rounded-lg border border-navy/20 bg-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-red/50 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%23001c43%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1rem]"
        >
          <option value="all">Alle klasser</option>
          {classes.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="px-4 pr-8 py-2 rounded-lg border border-navy/20 bg-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-red/50 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%23001c43%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:1rem]"
        >
          <option value="all">Alle år</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Result count */}
      <p className="text-sm text-navy/60 mb-2">
        {filtered.length} {filtered.length === 1 ? "resultat" : "resultater"}
        {search && ` for «${search}»`}
      </p>

      {/* Table */}
      <div className="bg-white rounded-lg border border-navy/10 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-navy text-white text-left">
              <th
                className="px-4 py-3 font-medium cursor-pointer hover:bg-navy-light select-none"
                onClick={() => toggleSort("time")}
              >
                Tid <SortIcon field="time" />
              </th>
              <th
                className="px-4 py-3 font-medium cursor-pointer hover:bg-navy-light select-none"
                onClick={() => toggleSort("name")}
              >
                Navn <SortIcon field="name" />
              </th>
              <th
                className="px-4 py-3 font-medium cursor-pointer hover:bg-navy-light select-none"
                onClick={() => toggleSort("year")}
              >
                År <SortIcon field="year" />
              </th>
              <th
                className="px-4 py-3 font-medium cursor-pointer hover:bg-navy-light select-none"
                onClick={() => toggleSort("class")}
              >
                Klasse <SortIcon field="class" />
              </th>
              <th
                className="px-4 py-3 font-medium cursor-pointer hover:bg-navy-light select-none"
                onClick={() => toggleSort("place")}
              >
                Plass <SortIcon field="place" />
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 100).map((r, i) => (
              <tr
                key={`${r.firstName}-${r.lastName}-${r.year}-${i}`}
                className={`${i % 2 === 0 ? "bg-[#fbf9f7]" : "bg-white"} hover:bg-[#f8f5f0] transition-colors`}
              >
                <td className="px-4 py-2 font-display text-lg">{r.time}</td>
                <td className="px-4 py-2">
                  {r.firstName} {r.lastName}
                </td>
                <td className="px-4 py-2">{r.year}</td>
                <td className="px-4 py-2">
                  <span className="inline-block px-2 py-0.5 rounded text-xs bg-navy/10">
                    {r.class}
                  </span>
                </td>
                <td className="px-4 py-2">{r.place || "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 100 && (
          <div className="px-4 py-3 text-sm text-navy/60 border-t border-navy/10 bg-[#fbf9f7]">
            Viser 100 av {filtered.length} resultater. Bruk søk/filter for å se
            spesifikke resultater.
          </div>
        )}
      </div>
    </div>
  );
}
