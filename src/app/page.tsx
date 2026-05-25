import { parseAllResults, computeStats, getFullName, COURSE } from "@/lib/data";
import { ResultTable } from "@/components/ResultTable";
import { PersonalStats } from "@/components/PersonalStats";
import { CourseProfile } from "@/components/CourseProfile";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const { timed, all } = parseAllResults();
  const stats = computeStats(timed, all);

  const mainClasses = ["Mann", "Dame", "Gutt", "Jente"];

  return (
    <div className="min-h-screen">
      <main className="max-w-6xl mx-auto px-6 pt-6 pb-8 space-y-10">
        {/* Hero: Logo + key stats */}
        <section className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Logo */}
            <div className="relative z-0">
              <Image
                src="/images/Logo_langhei_opp.png"
                alt="Langhei Opp"
                width={800}
                height={800}
                className="w-full h-auto"
                priority
              />
            </div>

            {/* Key stats */}
            <div className="relative z-10 md:pt-[35px]">
              <h2 className="font-display text-3xl text-navy border-b-2 border-red pb-1 mb-4">
                NORGES SNILLESTE MOTBAKKELØP
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <StatBox value={stats.totalResults.toString()} label="Registrerte tider" />
                <StatBox value={stats.totalUniqueRunners.toString()} label="Forskjellige løpere" />
                <StatBox value={stats.yearsArranged.length.toString()} label="År arrangert" />
                <StatBox value={`${COURSE.length} m`} label="Løypelengde" />
                <StatBox value={`${COURSE.grossElevationGain} m`} label="Brutto stigning" />
                <StatBox value={stats.courseStats.medianTime} label="Mediantid" />
              </div>
            </div>
          </div>
        </section>

        {/* Course info */}
        <section className="bg-white rounded-xl border border-navy/10 p-6">
          <h2 className="font-display text-3xl text-navy border-b-2 border-red pb-1 mb-4">
            LØYPA
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 items-stretch">
            <div className="grid grid-cols-2 gap-3 content-start">
              <CourseStatCard value={`${COURSE.length} m`} label="Total lengde" />
              <CourseStatCard value={`${COURSE.netElevationGain} m`} label="Netto stigning" />
              <CourseStatCard value={`${COURSE.grossElevationGain} m`} label="Brutto stigning" />
              <CourseStatCard value={`${COURSE.totalDescent} m`} label="Totalt fall" />
              <CourseStatCard value={`${COURSE.averageGradient.toFixed(1)}%`} label="Snitt stigning" />
              <CourseStatCard value={`${Math.round(COURSE.elevationPerKmGross)} m/km`} label="Høydemeter/km" />
            </div>
            <div className="relative h-[240px] md:h-auto">
              <div className="absolute inset-0">
                <CourseProfile />
              </div>
            </div>
          </div>
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
                  <p className="text-base font-medium mt-4">
                    {getFullName(record.record)}
                  </p>
                  <p className="text-sm text-navy/60">{record.record.year}</p>
                </div>
              );
            })}
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
            <CourseStatCard value={stats.courseStats.under10min.toString()} label="Løp under 10 min" />
            <CourseStatCard value={stats.courseStats.under15min.toString()} label="Løp under 15 min" />
            <CourseStatCard value={`${stats.courseStats.recordVerticalSpeed} m/t`} label="Vertikal fart (rekord menn)" />
            <CourseStatCard value={`${stats.courseStats.recordVerticalSpeedWomen} m/t`} label="Vertikal fart (rekord kvinner)" />
            <CourseStatCard value={`${stats.courseStats.largestField.count} (${stats.courseStats.largestField.year})`} label="Største felt" />
            <CourseStatCard value={`${stats.courseStats.genderPercentage.menPct}% / ${stats.courseStats.genderPercentage.womenPct}%`} label="Menn / Kvinner" />
          </div>

          <p className="text-xs text-navy/50 mt-4">
            Barneklasse 2013–2019 og trimklasse fra 2015 – uten tidtaking.
            Disse er inkludert i deltakertall og trofaste løpere.
          </p>

          {/* Most editions */}
          <h3 className="font-display text-xl text-navy mt-6 mb-2">TROFASTE LØPERE</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {stats.courseStats.allEditionsRunners.slice(0, 9).map((r, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#f8f5f0]">
                <span className="font-display text-lg leading-none text-red translate-y-[1px]">{i + 1}</span>
                <span className="text-sm leading-none flex-1">{r.name}</span>
                <span className="text-base leading-none font-display text-navy translate-y-[1px]">{r.editions} år</span>
              </div>
            ))}
          </div>
        </section>

        {/* Personal stats */}
        <section>
          <h2 className="font-display text-3xl text-navy border-b-2 border-red pb-1 mb-4">
            FINN DINE RESULTATER
          </h2>
          <PersonalStats allResults={all} />
        </section>

        {/* Full results table */}
        <section>
          <h2 className="font-display text-3xl text-navy border-b-2 border-red pb-1 mb-4">
            ALLE RESULTATER
          </h2>
          <ResultTable results={timed} />
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
      <footer className="bg-navy text-white/70 py-6">
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
    <div className="bg-[#f8f5f0] rounded-lg p-3 text-center">
      <div className="font-display text-xl text-navy leading-none">{value}</div>
      <div className="text-xs text-navy/60 mt-1">{label}</div>
    </div>
  );
}
