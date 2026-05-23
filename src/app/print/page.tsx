import { parseCSV, computeStats, getFullName, COURSE } from "@/lib/data";
import { CourseProfile } from "@/components/CourseProfile";

export default function PrintPoster() {
  const results = parseCSV();
  const stats = computeStats(results);

  const mainClasses = ["Mann", "Dame", "Gutt", "Jente"];

  return (
    <div className="print-poster w-[594mm] h-[420mm] bg-cream-light relative overflow-hidden flex flex-col font-body">
      {/* Header */}
      <header className="bg-navy text-white px-10 py-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-5">
          <FlagLogo />
          <div>
            <h1 className="font-display text-6xl leading-none tracking-wide">
              LANGHEI OPP
            </h1>
            <p className="text-cream text-base mt-1">
              Motbakkeløp &middot; Gjeving IL &middot; Siden 2013
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right text-sm text-cream/80">
            <p>{COURSE.length} m &middot; {COURSE.netElevationGain} m stigning &middot; {COURSE.averageGradient.toFixed(1)}% snitt</p>
          </div>
          <JubileumsBadge />
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex gap-6 px-10 py-6 overflow-hidden">
        {/* Left column - Course data + stats */}
        <div className="w-[260px] shrink-0 flex flex-col gap-5">
          {/* Course profile */}
          <section>
            <SectionTitle>Løypa</SectionTitle>
            <div className="bg-white rounded-lg p-3 mt-2 border border-navy/10">
              <CourseProfile className="w-full h-auto" />
              <p className="text-[10px] text-navy/60 mt-1 text-center">
                Gjeving skole → Toppen av Langhei
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <MiniStat value={`${COURSE.length} m`} label="Lengde" />
              <MiniStat value={`${COURSE.netElevationGain} m`} label="Netto stigning" />
              <MiniStat value={`${COURSE.grossElevationGain} m`} label="Brutto stigning" />
              <MiniStat value={`${COURSE.averageGradient.toFixed(1)}%`} label="Snitt helning" />
              <MiniStat value={`${COURSE.minElevation}–${COURSE.maxElevation}`} label="Moh." />
              <MiniStat value={`${Math.round(COURSE.elevationPerKmGross)} m/km`} label="Hm/km" />
            </div>
          </section>

          {/* Key numbers */}
          <section>
            <SectionTitle>Nøkkeltall</SectionTitle>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <MiniStat value={stats.totalResults.toString()} label="Registrerte tider" />
              <MiniStat value={stats.totalUniqueRunners.toString()} label="Unike løpere" />
              <MiniStat value={stats.yearsArranged.length.toString()} label="År arrangert" />
              <MiniStat value={stats.courseStats.medianTime} label="Mediantid" />
              <MiniStat value={`${stats.courseStats.genderPercentage.menPct}/${stats.courseStats.genderPercentage.womenPct}%`} label="Menn/kvinner" />
              <MiniStat value={stats.courseStats.under10min.toString()} label="Under 10 min" />
            </div>
          </section>

          {/* Fun facts */}
          <section>
            <SectionTitle>Visste du at...</SectionTitle>
            <div className="space-y-1.5 mt-2 text-[11px]">
              <FunFactCard
                text={`${stats.funFacts.mostParticipations.name} har deltatt hele ${stats.funFacts.mostParticipations.count} ganger`}
              />
              <FunFactCard
                text={`Størst forbedring: ${stats.funFacts.biggestImprovement.name} (${stats.funFacts.biggestImprovement.from} → ${stats.funFacts.biggestImprovement.to})`}
              />
              <FunFactCard
                text={`Rekordens vertikale fart: ${stats.courseStats.recordVerticalSpeed} m/t (menn) / ${stats.courseStats.recordVerticalSpeedWomen} m/t (kvinner)`}
              />
              <FunFactCard
                text={`Største felt: ${stats.courseStats.largestField.count} deltakere (${stats.courseStats.largestField.year})`}
              />
              <FunFactCard
                text={`Ikke arrangert 2020, 2021 og 2023`}
              />
            </div>
          </section>
        </div>

        {/* Center column - Records + Top 10 */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">
          {/* Records */}
          <section>
            <SectionTitle>Løyperekorder</SectionTitle>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {mainClasses.map((cls) => {
                const record = stats.classRecords.find((cr) => cr.class === cls);
                if (!record) return null;
                return (
                  <RecordCard
                    key={cls}
                    classLabel={cls}
                    time={record.record.time}
                    name={getFullName(record.record)}
                    year={record.record.year}
                  />
                );
              })}
            </div>
          </section>

          {/* Top 10 all time */}
          <section className="flex-1 min-h-0">
            <SectionTitle>Topp 10 – Alle tider</SectionTitle>
            <div className="bg-white rounded-lg border border-navy/10 mt-2 overflow-hidden">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-navy text-white text-left">
                    <th className="px-2 py-1.5 font-medium w-6">#</th>
                    <th className="px-2 py-1.5 font-medium">Tid</th>
                    <th className="px-2 py-1.5 font-medium">Navn</th>
                    <th className="px-2 py-1.5 font-medium">År</th>
                    <th className="px-2 py-1.5 font-medium">Klasse</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topTenAllTime.map((r, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "bg-cream-light/50" : "bg-white"}
                    >
                      <td className="px-2 py-1 font-display text-base text-red">
                        {i + 1}
                      </td>
                      <td className="px-2 py-1 font-display text-lg">
                        {r.time}
                      </td>
                      <td className="px-2 py-1">{getFullName(r)}</td>
                      <td className="px-2 py-1">{r.year}</td>
                      <td className="px-2 py-1">{r.class}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right column - Top lists per class + trofaste */}
        <div className="w-[300px] shrink-0 flex flex-col gap-3">
          <SectionTitle>Topp 5 per klasse</SectionTitle>
          {mainClasses.map((cls) => (
            <div key={cls} className="bg-white rounded-lg border border-navy/10 overflow-hidden">
              <div className="bg-red px-2.5 py-1">
                <h4 className="font-display text-base text-white tracking-wide">
                  {cls}
                </h4>
              </div>
              <div className="divide-y divide-navy/5">
                {(stats.topTenByClass[cls] || []).slice(0, 5).map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center px-2.5 py-0.5 text-[11px]"
                  >
                    <span className="font-display text-sm text-red w-4">
                      {i + 1}
                    </span>
                    <span className="font-display text-sm w-11">
                      {r.time}
                    </span>
                    <span className="flex-1 truncate">{getFullName(r)}</span>
                    <span className="text-navy/60 ml-1">{r.year}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Most editions */}
          <div className="bg-white rounded-lg border border-navy/10 overflow-hidden mt-1">
            <div className="bg-navy px-2.5 py-1">
              <h4 className="font-display text-base text-white tracking-wide">
                Trofaste løpere
              </h4>
            </div>
            <div className="divide-y divide-navy/5">
              {stats.courseStats.allEditionsRunners.slice(0, 5).map((r, i) => (
                <div
                  key={i}
                  className="flex items-center px-2.5 py-0.5 text-[11px]"
                >
                  <span className="font-display text-sm text-red w-4">
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate">{r.name}</span>
                  <span className="font-display text-sm text-navy ml-1">
                    {r.editions} år
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-navy text-white px-10 py-2.5 flex items-center justify-between shrink-0">
        <p className="text-xs text-cream/80">
          Data fra {stats.yearsArranged.length} arrangerte år ({stats.yearsArranged[0]}–{stats.yearsArranged[stats.yearsArranged.length - 1]})
          &middot; Ikke arrangert 2020, 2021, 2023
        </p>
        <p className="text-xs text-cream/60">
          Alle resultater og mer statistikk: langhei-opp.vercel.app
        </p>
      </footer>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display text-xl text-navy tracking-wide border-b-2 border-red pb-0.5">
      {children}
    </h3>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-white rounded p-2 border border-navy/10 text-center">
      <div className="font-display text-lg text-red leading-none">{value}</div>
      <div className="text-[9px] text-navy/70 mt-0.5">{label}</div>
    </div>
  );
}

function RecordCard({
  classLabel,
  time,
  name,
  year,
}: {
  classLabel: string;
  time: string;
  name: string;
  year: number;
}) {
  return (
    <div className="bg-white rounded-lg p-3 border-2 border-red/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-red text-white text-[10px] px-2 py-0.5 rounded-bl font-medium">
        {classLabel}
      </div>
      <div className="font-display text-4xl text-navy leading-none">
        {time}
      </div>
      <div className="text-xs mt-1.5 font-medium">{name}</div>
      <div className="text-[10px] text-navy/60">{year}</div>
    </div>
  );
}

function FunFactCard({ text }: { text: string }) {
  return (
    <div className="bg-white rounded px-2.5 py-1.5 border border-navy/10">
      <p className="text-[11px] text-navy/80 leading-snug">{text}</p>
    </div>
  );
}

function FlagLogo() {
  return (
    <svg width="56" height="46" viewBox="0 0 60 50" className="shrink-0">
      <line x1="8" y1="2" x2="8" y2="48" stroke="white" strokeWidth="2" />
      <rect x="10" y="4" width="45" height="28" fill="#d63a3a" rx="1" />
      <rect x="10" y="10" width="45" height="16" fill="#1b2a4a" />
      <path d="M 6 2 Q 10 0 14 2 Q 10 4 6 2" fill="#d63a3a" />
    </svg>
  );
}

function JubileumsBadge() {
  return (
    <div className="w-16 h-16 rounded-full border-2 border-white flex flex-col items-center justify-center text-center shrink-0">
      <span className="text-[7px] text-cream/80 leading-none">GJEVING IL</span>
      <span className="font-display text-2xl leading-none">100</span>
      <span className="text-[7px] text-cream/80 leading-none">ÅR 1926–2026</span>
    </div>
  );
}
