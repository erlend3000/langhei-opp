import { parseCSV, computeStats, getFullName, COURSE } from "@/lib/data";
import { ResultTable } from "@/components/ResultTable";
import { PersonalStats } from "@/components/PersonalStats";
import { CourseProfile } from "@/components/CourseProfile";
import Link from "next/link";

export default function Home() {
  const results = parseCSV();
  const stats = computeStats(results);

  const mainClasses = ["Mann", "Dame", "Gutt", "Jente"];

  return (
    <div className="min-h-screen">
      {/* Hero header */}
      <header className="bg-navy text-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-6xl md:text-7xl tracking-wide leading-none">
                LANGHEI OPP
              </h1>
              <p className="text-cream mt-2 text-lg">
                Alle resultater fra motbakkeløpet i Gjeving &middot; Siden 2013
              </p>
            </div>
            <div className="hidden md:flex flex-col items-center">
              <div className="w-20 h-20 rounded-full border-2 border-white/60 flex flex-col items-center justify-center">
                <span className="text-[9px] text-cream/80">GJEVING IL</span>
                <span className="font-display text-2xl leading-none">100</span>
                <span className="text-[9px] text-cream/80">ÅR</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-10">
        {/* Key stats bar */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatBox value={stats.totalResults.toString()} label="Registrerte tider" />
          <StatBox value={stats.totalUniqueRunners.toString()} label="Unike løpere" />
          <StatBox value={stats.yearsArranged.length.toString()} label="År arrangert" />
          <StatBox value={`${COURSE.length} m`} label="Løypelengde" />
          <StatBox value={`${COURSE.grossElevationGain} m`} label="Brutto stigning" />
          <StatBox value={stats.courseStats.medianTime} label="Mediantid" />
        </section>

        {/* Records */}
        <section>
          <h2 className="font-display text-3xl text-navy border-b-2 border-red pb-1 mb-4">
            LØYPEREKORDER
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mainClasses.map((cls) => {
              const record = stats.classRecords.find((cr) => cr.class === cls);
              if (!record) return null;
              return (
                <div
                  key={cls}
                  className="bg-white rounded-xl p-5 border-2 border-red/20 relative"
                >
                  <span className="absolute top-3 right-3 text-xs font-medium bg-red text-white px-2 py-0.5 rounded">
                    {cls}
                  </span>
                  <p className="font-display text-5xl text-navy leading-none">
                    {record.record.time}
                  </p>
                  <p className="text-sm font-medium mt-3">
                    {getFullName(record.record)}
                  </p>
                  <p className="text-xs text-navy/60">{record.record.year}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Course info */}
        <section className="bg-white rounded-xl border border-navy/10 p-6">
          <h2 className="font-display text-3xl text-navy border-b-2 border-red pb-1 mb-4">
            LØYPA
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <CourseProfile className="w-full h-32" />
              <p className="text-sm text-navy/60 text-center mt-2">
                Fra Gjeving skole ({COURSE.startElevation} moh.) til toppen av Langhei ({COURSE.finishElevation} moh.)
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CourseStatCard value={`${COURSE.length} m`} label="Total lengde" />
              <CourseStatCard value={`${COURSE.netElevationGain} m`} label="Netto stigning" />
              <CourseStatCard value={`${COURSE.grossElevationGain} m`} label="Brutto stigning" />
              <CourseStatCard value={`${COURSE.totalDescent} m`} label="Totalt fall" />
              <CourseStatCard value={`${COURSE.averageGradient.toFixed(1)}%`} label="Snitt helning" />
              <CourseStatCard value={`${Math.round(COURSE.elevationPerKmGross)} m/km`} label="Høydemeter/km" />
            </div>
          </div>
        </section>

        {/* More stats */}
        <section className="bg-white rounded-xl border border-navy/10 p-6">
          <h2 className="font-display text-3xl text-navy border-b-2 border-red pb-1 mb-4">
            STATISTIKK
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <CourseStatCard value={stats.courseStats.averageTime} label="Gjennomsnittstid" />
            <CourseStatCard value={stats.courseStats.medianTime} label="Mediantid" />
            <CourseStatCard value={stats.courseStats.under10min.toString()} label="Ganger under 10 min" />
            <CourseStatCard value={stats.courseStats.under15min.toString()} label="Ganger under 15 min" />
            <CourseStatCard value={`${stats.courseStats.recordVerticalSpeed} m/t`} label="Vertikal fart (rekord menn)" />
            <CourseStatCard value={`${stats.courseStats.recordVerticalSpeedWomen} m/t`} label="Vertikal fart (rekord kvinner)" />
            <CourseStatCard value={`${stats.courseStats.largestField.count} (${stats.courseStats.largestField.year})`} label="Største felt" />
            <CourseStatCard value={`${stats.courseStats.genderPercentage.menPct}% / ${stats.courseStats.genderPercentage.womenPct}%`} label="Menn / Kvinner" />
          </div>

          {/* Most editions */}
          <h3 className="font-display text-xl text-navy mt-6 mb-2">TROFASTE LØPERE</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {stats.courseStats.allEditionsRunners.slice(0, 6).map((r, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cream-light/50">
                <span className="font-display text-lg text-red">{i + 1}</span>
                <span className="text-sm flex-1">{r.name}</span>
                <span className="text-sm font-display text-navy">{r.editions} år</span>
              </div>
            ))}
          </div>
        </section>

        {/* Personal stats */}
        <section>
          <h2 className="font-display text-3xl text-navy border-b-2 border-red pb-1 mb-4">
            FINN DINE RESULTATER
          </h2>
          <PersonalStats allResults={results} />
        </section>

        {/* Full results table */}
        <section>
          <h2 className="font-display text-3xl text-navy border-b-2 border-red pb-1 mb-4">
            ALLE RESULTATER
          </h2>
          <ResultTable results={results} />
        </section>

        {/* Print link */}
        <section className="text-center py-6 border-t border-navy/10">
          <Link
            href="/print"
            className="inline-block px-6 py-3 bg-navy text-white rounded-lg font-medium hover:bg-navy-light transition-colors"
          >
            Se trykkversjon (A2-plakat)
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-navy text-cream/70 py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-2 text-sm">
          <p>Langhei Opp &middot; Gjeving IL &middot; 100 år (1926–2026)</p>
          <p>
            Data fra {stats.yearsArranged.length} arrangerte år (
            {stats.yearsArranged[0]}–{stats.yearsArranged[stats.yearsArranged.length - 1]})
          </p>
        </div>
      </footer>
    </div>
  );
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-navy/10 text-center">
      <div className="font-display text-3xl text-red leading-none">{value}</div>
      <div className="text-xs text-navy/70 mt-1">{label}</div>
    </div>
  );
}

function CourseStatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-cream-light/50 rounded-lg p-3 text-center">
      <div className="font-display text-xl text-navy leading-none">{value}</div>
      <div className="text-[11px] text-navy/60 mt-1">{label}</div>
    </div>
  );
}
