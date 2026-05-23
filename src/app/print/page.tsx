import { parseCSV, computeStats, getFullName, COURSE } from "@/lib/data";
import { CourseProfile } from "@/components/CourseProfile";

export default function PrintPoster() {
  const results = parseCSV();
  const stats = computeStats(results);

  const mainClasses = ["Mann", "Dame", "Gutt", "Jente"];

  return (
    <div className="print-poster w-[594mm] h-[420mm] bg-cream-light relative flex flex-col font-body overflow-hidden">
      {/* Header */}
      <header className="bg-navy text-white px-[30px] py-[20px] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-[20px]">
          <FlagLogo />
          <div>
            <h1 className="font-display text-[48px] leading-none tracking-wide">
              LANGHEI OPP
            </h1>
            <p className="text-cream text-[14px] mt-[4px]">
              Motbakkeløp &middot; Gjeving IL &middot; Siden 2013
            </p>
          </div>
        </div>
        <div className="flex items-center gap-[24px]">
          <div className="text-right text-[12px] text-cream/80">
            <p>{COURSE.length} m &middot; {COURSE.grossElevationGain} m stigning &middot; {COURSE.averageGradient.toFixed(1)}% snitt</p>
          </div>
          <JubileumsBadge />
        </div>
      </header>

      {/* Main content - three columns */}
      <div className="flex-1 grid grid-cols-[1.3fr_1.6fr_1fr] gap-[28px] px-[30px] py-[24px] overflow-hidden">
        {/* LEFT: Course + Records + Key numbers */}
        <div className="flex flex-col gap-[20px] overflow-hidden">
          {/* Course profile */}
          <section>
            <SectionTitle>Løypa</SectionTitle>
            <div className="bg-white rounded-[6px] p-[10px] mt-[8px] border border-navy/10">
              <CourseProfile className="w-full h-auto" />
              <p className="text-[9px] text-navy/60 mt-[4px] text-center">
                Gjeving skole → Toppen av Langhei
              </p>
            </div>
            <div className="grid grid-cols-3 gap-[6px] mt-[8px]">
              <MiniStat value={`${COURSE.length} m`} label="Lengde" />
              <MiniStat value={`${COURSE.netElevationGain} m`} label="Netto stig." />
              <MiniStat value={`${COURSE.grossElevationGain} m`} label="Brutto stig." />
              <MiniStat value={`${COURSE.averageGradient.toFixed(1)}%`} label="Snitt helning" />
              <MiniStat value={`${COURSE.minElevation}–${COURSE.maxElevation}`} label="Moh." />
              <MiniStat value={`${Math.round(COURSE.elevationPerKmGross)} m/km`} label="Hm/km" />
            </div>
          </section>

          {/* Records */}
          <section>
            <SectionTitle>Løyperekorder</SectionTitle>
            <div className="grid grid-cols-2 gap-[8px] mt-[8px]">
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

          {/* Key numbers */}
          <section>
            <SectionTitle>Nøkkeltall</SectionTitle>
            <div className="grid grid-cols-3 gap-[6px] mt-[8px]">
              <MiniStat value={stats.totalResults.toString()} label="Reg. tider" />
              <MiniStat value={stats.totalUniqueRunners.toString()} label="Unike løpere" />
              <MiniStat value={stats.yearsArranged.length.toString()} label="År arrangert" />
              <MiniStat value={stats.courseStats.medianTime} label="Mediantid" />
              <MiniStat value={`${stats.courseStats.genderPercentage.menPct}/${stats.courseStats.genderPercentage.womenPct}%`} label="M/K (voksne)" />
              <MiniStat value={stats.courseStats.under10min.toString()} label="Under 10 min" />
            </div>
          </section>
        </div>

        {/* CENTER: Curiosa + Trofaste */}
        <div className="flex flex-col gap-[20px] overflow-hidden">
          {/* Visste du at */}
          <section>
            <SectionTitle>Visste du at...</SectionTitle>
            <div className="grid grid-cols-2 gap-[8px] mt-[10px]">
              <FunFactCard
                title="Samlet distanse"
                text={`Alle deltakere til sammen har løpt ${stats.funFacts.totalKmRun} km i Langhei Opp – nesten Oslo–Trondheim!`}
              />
              <FunFactCard
                title="Høydemeter samlet"
                text={`Alle deltakere til sammen har klatret ${stats.funFacts.totalElevationGain.toLocaleString("nb-NO")} høydemeter – ${stats.funFacts.everestMultiple}× Everest!`}
              />
              <FunFactCard
                title="Størst forbedring"
                text={`${stats.funFacts.biggestImprovement.name} gikk fra ${stats.funFacts.biggestImprovement.from} til ${stats.funFacts.biggestImprovement.to}`}
              />
              <FunFactCard
                title="Mest konsistent"
                text={`${stats.funFacts.mostConsistent.name} varierer bare ${stats.funFacts.mostConsistent.variance} over ${stats.funFacts.mostConsistent.races} løp`}
              />
              <FunFactCard
                title="Største familie"
                text={`Familien ${stats.funFacts.biggestFamily.lastName}: ${stats.funFacts.biggestFamily.members} ulike medlemmer, ${stats.funFacts.biggestFamily.participations} deltakelser`}
              />
              <FunFactCard
                title="Rekordfart"
                text={`${stats.funFacts.recordSpeedKmh} km/t – vertikal hastighet ${stats.courseStats.recordVerticalSpeed} m/t`}
              />
              <FunFactCard
                title="Rekordutvikling"
                text={`Første vinner (2013): ${stats.funFacts.firstEditionWinnerTime}. Rekorden er forbedret med ${stats.funFacts.recordImprovedBy} sek siden`}
              />
              <FunFactCard
                title="Nærmeste innkomst"
                text={`${stats.funFacts.closestFinish.names[0]} og ${stats.funFacts.closestFinish.names[1]} – begge på ${stats.funFacts.closestFinish.time} (${stats.funFacts.closestFinish.year})`}
              />
            </div>
          </section>

          {/* Trofaste løpere */}
          <section>
            <SectionTitle>Trofaste løpere</SectionTitle>
            <div className="bg-white rounded-[6px] border border-navy/10 mt-[10px] overflow-hidden">
              <div className="grid grid-cols-2 divide-x divide-navy/5">
                <div className="divide-y divide-navy/5">
                  {stats.courseStats.allEditionsRunners.slice(0, 5).map((r, i) => (
                    <div key={i} className="flex items-center px-[10px] py-[7px] text-[12px]">
                      <span className="font-display text-[14px] text-red w-[18px]">{i + 1}</span>
                      <span className="flex-1 truncate">{r.name}</span>
                      <span className="font-display text-[14px] text-navy ml-[6px]">{r.editions} år</span>
                    </div>
                  ))}
                </div>
                <div className="divide-y divide-navy/5">
                  {stats.courseStats.allEditionsRunners.slice(5, 10).map((r, i) => (
                    <div key={i} className="flex items-center px-[10px] py-[7px] text-[12px]">
                      <span className="font-display text-[14px] text-red w-[18px]">{i + 6}</span>
                      <span className="flex-1 truncate">{r.name}</span>
                      <span className="font-display text-[14px] text-navy ml-[6px]">{r.editions} år</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Extra note */}
          <div className="mt-auto bg-navy/5 rounded-[6px] px-[12px] py-[10px]">
            <p className="text-[11px] text-navy/70 text-center">
              Ikke arrangert i 2020, 2021 og 2023 &middot; Løpet arrangeres årlig av Gjeving IL
            </p>
          </div>
        </div>

        {/* RIGHT: Top 5 per class */}
        <div className="flex flex-col gap-[10px] overflow-hidden">
          <SectionTitle>Topp 5 per klasse</SectionTitle>
          {mainClasses.map((cls) => (
            <div key={cls} className="bg-white rounded-[6px] border border-navy/10 overflow-hidden">
              <div className="bg-red px-[10px] py-[5px]">
                <h4 className="font-display text-[14px] text-white tracking-wide">
                  {cls}
                </h4>
              </div>
              <div className="divide-y divide-navy/5">
                {(stats.topTenByClass[cls] || []).slice(0, 5).map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center px-[10px] py-[4px] text-[10px]"
                  >
                    <span className="font-display text-[12px] text-red w-[14px]">
                      {i + 1}
                    </span>
                    <span className="font-display text-[12px] w-[40px]">
                      {r.time}
                    </span>
                    <span className="flex-1 truncate">{getFullName(r)}</span>
                    <span className="text-navy/60 ml-[4px]">{r.year}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-navy text-white px-[30px] py-[10px] flex items-center justify-between shrink-0">
        <p className="text-[11px] text-cream/80">
          Data fra {stats.yearsArranged.length} arrangerte år ({stats.yearsArranged[0]}–{stats.yearsArranged[stats.yearsArranged.length - 1]})
        </p>
        <p className="text-[11px] text-cream/60">
          Søk i alle resultater: langhei-opp.vercel.app
        </p>
      </footer>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display text-[18px] text-navy tracking-wide border-b-2 border-red pb-[2px]">
      {children}
    </h3>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-white rounded-[4px] p-[6px] border border-navy/10 text-center">
      <div className="font-display text-[15px] text-red leading-none">{value}</div>
      <div className="text-[8px] text-navy/70 mt-[2px]">{label}</div>
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
    <div className="bg-white rounded-[6px] p-[10px] border-2 border-red/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-red text-white text-[9px] px-[6px] py-[2px] rounded-bl font-medium">
        {classLabel}
      </div>
      <div className="font-display text-[30px] text-navy leading-none">
        {time}
      </div>
      <div className="text-[10px] mt-[6px] font-medium truncate">{name}</div>
      <div className="text-[9px] text-navy/60">{year}</div>
    </div>
  );
}

function FunFactCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-white rounded-[6px] px-[10px] py-[8px] border border-navy/10">
      <p className="font-display text-[12px] text-red leading-none">{title}</p>
      <p className="text-[10px] text-navy/80 leading-snug mt-[4px]">{text}</p>
    </div>
  );
}

function FlagLogo() {
  return (
    <svg width="48" height="40" viewBox="0 0 60 50" className="shrink-0">
      <line x1="8" y1="2" x2="8" y2="48" stroke="white" strokeWidth="2" />
      <rect x="10" y="4" width="45" height="28" fill="#d63a3a" rx="1" />
      <rect x="10" y="10" width="45" height="16" fill="#1b2a4a" />
      <path d="M 6 2 Q 10 0 14 2 Q 10 4 6 2" fill="#d63a3a" />
    </svg>
  );
}

function JubileumsBadge() {
  return (
    <div className="w-[52px] h-[52px] rounded-full border-2 border-white flex flex-col items-center justify-center text-center shrink-0">
      <span className="text-[6px] text-cream/80 leading-none">GJEVING IL</span>
      <span className="font-display text-[20px] leading-none">100</span>
      <span className="text-[6px] text-cream/80 leading-none">ÅR 1926–2026</span>
    </div>
  );
}
