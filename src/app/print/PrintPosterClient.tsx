"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { CourseProfile } from "@/components/CourseProfile";
import {
  PrintCanvas,
  DraggableBox,
  usePrintOptions,
  type Layout,
} from "@/components/PrintEditor";
import type { AllStats } from "@/lib/data";

const DEFAULT_LAYOUT: Layout = {
  logo: { x: 20, y: 20, w: 100, h: 80 },
  course: { x: 20, y: 110, w: 175, h: 145 },
  records: { x: 20, y: 265, w: 175, h: 70 },
  keystats: { x: 20, y: 345, w: 175, h: 55 },
  funfacts: { x: 210, y: 20, w: 170, h: 275 },
  trofaste: { x: 210, y: 305, w: 170, h: 95 },
  top5: { x: 395, y: 20, w: 175, h: 320 },
  colophon: { x: 395, y: 350, w: 175, h: 50 },
};

const COURSE_INFO = {
  length: 2180,
  netElevationGain: 57,
  grossElevationGain: 94,
  averageGradient: 2.6,
  minElevation: 31,
  maxElevation: 88,
  elevationPerKmGross: 43,
};

const mainClasses = ["Mann", "Dame", "Gutt", "Jente"];

function autoFitGrid(minWidthMm: number) {
  return {
    gridTemplateColumns: `repeat(auto-fit, minmax(${minWidthMm}mm, 1fr))`,
    gridAutoRows: "1fr" as const,
  };
}

function TrofasteGrid({
  minWidth,
  count,
  children,
}: {
  minWidth: number;
  count: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(1);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const update = () => {
      const widthMm = el.clientWidth * (25.4 / 96);
      const c = Math.max(1, Math.floor(widthMm / minWidth));
      setCols(c);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [minWidth]);

  const rows = Math.ceil(count / cols);

  return (
    <div
      ref={ref}
      className="grid grid-flow-col gap-[6px] mt-[10px] flex-1 min-h-0"
      style={{
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gridAutoColumns: `minmax(${minWidth}mm, 1fr)`,
      }}
    >
      {children}
    </div>
  );
}

const sectionTitleStyle = { fontSize: "var(--ft-section-title)" };
const statValueStyle = { fontSize: "var(--ft-stat-value)" };
const statLabelStyle = { fontSize: "var(--ft-stat-label)" };
const recordTimeStyle = { fontSize: "var(--ft-record-time)" };
const funFactTitleStyle = { fontSize: "var(--ft-funfact-title)" };
const funFactTextStyle = { fontSize: "var(--ft-funfact-text)" };
const trofasteRowStyle = { fontSize: "var(--ft-trofaste-row)" };
const top5HeaderStyle = { fontSize: "var(--ft-top5-header)" };
const top5RowStyle = { fontSize: "var(--ft-top5-row)" };
const courseStatValueStyle = { fontSize: "var(--ft-course-stat-value)" };
const courseStatLabelStyle = { fontSize: "var(--ft-course-stat-label)" };
const colophonTitleStyle = { fontSize: "var(--ft-colophon-title)" };
const colophonTextStyle = { fontSize: "var(--ft-colophon-text)" };

export function PrintPosterClient({
  stats,
  classRecordsByClass,
}: {
  stats: AllStats;
  classRecordsByClass: Record<
    string,
    { time: string; name: string; year: number }
  >;
}) {
  return (
    <PrintCanvas defaults={DEFAULT_LAYOUT}>
      <PosterContent
        stats={stats}
        classRecordsByClass={classRecordsByClass}
      />
    </PrintCanvas>
  );
}

function PosterContent({
  stats,
  classRecordsByClass,
}: {
  stats: AllStats;
  classRecordsByClass: Record<
    string,
    { time: string; name: string; year: number }
  >;
}) {
  const options = usePrintOptions();

  return (
    <>
      {/* Logo */}
      <DraggableBox id="logo">
        <div className="w-full h-full relative" data-snap>
          <Image
            src="/images/Logo_langhei_opp.png"
            alt="Langhei Opp"
            fill
            sizes="50vw"
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
      </DraggableBox>

      {/* Løypa */}
      <DraggableBox id="course">
        <section className="w-full h-full flex flex-col">
          <SectionTitle>Løypa</SectionTitle>
          <div
            className="bg-white rounded-[10px] p-[14px] mt-[10px] border border-navy/10 flex-[3] flex flex-col min-h-0"
            data-snap
          >
            <div className="flex-1 min-h-0">
              <CourseProfile className="" />
            </div>
          </div>
          <div
            className="grid gap-[8px] mt-[10px] flex-1 min-h-0"
            style={autoFitGrid(options.statMinWidth)}
          >
            <CourseMiniStat value={`${COURSE_INFO.length} m`} label="Lengde" />
            <CourseMiniStat
              value={`${COURSE_INFO.netElevationGain} m`}
              label="Netto stigning"
            />
            <CourseMiniStat
              value={`${COURSE_INFO.grossElevationGain} m`}
              label="Bruttostigning"
            />
            <CourseMiniStat
              value={`${COURSE_INFO.averageGradient.toFixed(1)}%`}
              label="Snitt stigning"
            />
            <CourseMiniStat
              value="moh"
              label="Moh."
              customValue={<>{COURSE_INFO.minElevation} <span style={{ display: "inline-block", transform: "translateY(-0.1em)" }}>→</span> {COURSE_INFO.maxElevation}</>}
            />
            <CourseMiniStat
              value={`${Math.round(COURSE_INFO.elevationPerKmGross)} m/km`}
              label="Høydemeter/km"
            />
          </div>
        </section>
      </DraggableBox>

      {/* Løyperekorder */}
      <DraggableBox id="records">
        <section className="w-full h-full flex flex-col">
          <SectionTitle>Løyperekorder</SectionTitle>
          <div
            className="grid gap-[10px] mt-[10px] flex-1 min-h-0"
            style={autoFitGrid(options.recordMinWidth)}
          >
            {mainClasses.map((cls) => {
              const r = classRecordsByClass[cls];
              if (!r) return null;
              return (
                <RecordCard
                  key={cls}
                  classLabel={cls}
                  time={r.time}
                  name={r.name}
                  year={r.year}
                />
              );
            })}
          </div>
        </section>
      </DraggableBox>

      {/* Nøkkeltall */}
      <DraggableBox id="keystats">
        <section className="w-full h-full flex flex-col">
          <SectionTitle>Nøkkeltall</SectionTitle>
          <div
            className="grid gap-[8px] mt-[10px] flex-1 min-h-0"
            style={autoFitGrid(options.statMinWidth)}
          >
            <MiniStat
              value={stats.totalResults.toString()}
              label="Registrerte tider"
            />
            <MiniStat
              value={stats.totalUniqueRunners.toString()}
              label="Forskjellige løpere"
            />
            <MiniStat
              value={stats.yearsArranged.length.toString()}
              label="År arrangert"
            />
            <MiniStat
              value={`${stats.courseStats.genderPercentage.menPct}/${stats.courseStats.genderPercentage.womenPct}%`}
              label="Menn / Kvinner"
            />
            <MiniStat
              value={stats.courseStats.medianTime}
              label="Mediantid"
            />
            <MiniStat
              value={stats.courseStats.under10min.toString()}
              label="Løp under 10 min"
            />
            <MiniStat
              value={stats.courseStats.largestField.count.toString()}
              label={`Største felt (${stats.courseStats.largestField.year})`}
            />
            <MiniStat
              value={`${stats.funFacts.recordSpeedKmh} km/t`}
              label={`Rekordfart (${stats.funFacts.recordSpeedYear})`}
            />
          </div>
        </section>
      </DraggableBox>

      {/* Visste du at */}
      <DraggableBox id="funfacts">
        <section className="w-full h-full flex flex-col">
          <SectionTitle>Visste du...</SectionTitle>
          <div
            className="grid gap-[8px] mt-[10px] flex-1 min-h-0"
            style={autoFitGrid(options.funFactMinWidth)}
          >
            <FunFactCard
              title="Samlet distanse"
              text={`Alle deltakere har til sammen løpt ${stats.funFacts.totalKmRun} km. Nesten Oslo–Trondheim!`}
            />
            <FunFactCard
              title="Høydemeter samlet"
              text={`${stats.funFacts.totalElevationGain.toLocaleString(
                "nb-NO"
              )} høydemeter til sammen. ${stats.funFacts.everestMultiple} × Mount Everest!`}
            />
            <FunFactCard
              title="Størst forbedring"
              text={`${stats.funFacts.biggestImprovement.name}: fra ${stats.funFacts.biggestImprovement.from} til ${stats.funFacts.biggestImprovement.to}`}
            />
            <FunFactCard
              title="Maskinen"
              text={`${stats.funFacts.mostConsistent.name} varierer bare ${stats.funFacts.mostConsistent.variance} over ${stats.funFacts.mostConsistent.races} løp`}
            />
            <FunFactCard
              title="Største familie"
              text={`${stats.funFacts.biggestFamily.lastName}: ${stats.funFacts.biggestFamily.members} løpere, ${stats.funFacts.biggestFamily.participations} deltakelser`}
            />
            <FunFactCard
              title="Hurtigste debut"
              text={`${stats.funFacts.fastestDebut.name} debuterte med ${stats.funFacts.fastestDebut.time} (${stats.funFacts.fastestDebut.year}). Nær løyperekorden allerede første gang!`}
            />
            <FunFactCard
              title="Raskeste fotofinish"
              text={`${stats.funFacts.closestFinish.time}, ${stats.funFacts.closestFinish.names[0]} og ${stats.funFacts.closestFinish.names[1]} (${stats.funFacts.closestFinish.year})`}
            />
            <FunFactCard
              title="Stadig raskere"
              text={`Første vinner løp på ${stats.funFacts.firstEditionWinnerTime}. Dagens rekord er ${Math.floor(stats.funFacts.recordImprovedBy / 60)}:${String(stats.funFacts.recordImprovedBy % 60).padStart(2, "0")} raskere!`}
            />
            <FunFactCard
              title="Alle har bidratt"
              text={`${stats.funFacts.totalParticipantsAllTime} deltakelser totalt, inkludert trim- og barneklasse`}
            />
          </div>
        </section>
      </DraggableBox>

      {/* Trofaste løpere */}
      <DraggableBox id="trofaste">
        <section className="w-full h-full flex flex-col">
          <SectionTitle>Trofaste løpere</SectionTitle>
          <TrofasteGrid minWidth={options.trofasteMinWidth} count={options.trofasteCount}>
            {stats.courseStats.allEditionsRunners
              .slice(0, options.trofasteCount)
              .map((r, i) => (
                <div
                  key={i}
                  className="bg-white rounded-[8px] border border-navy/10 px-[12px] flex items-center min-h-0 overflow-hidden"
                  style={trofasteRowStyle}
                  data-snap
                >
                  <span
                    className="font-display text-red w-[24px] shrink-0"
                    style={{ fontSize: "calc(var(--ft-trofaste-row) * 1.2)" }}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 truncate">{r.name}</span>
                  <span
                    className="font-display text-navy ml-[8px] shrink-0"
                    style={{ fontSize: "calc(var(--ft-trofaste-row) * 1.2)" }}
                  >
                    {r.editions} år
                  </span>
                </div>
              ))}
          </TrofasteGrid>
        </section>
      </DraggableBox>

      {/* Topp pr. klasse */}
      <DraggableBox id="top5">
        <section className="w-full h-full flex flex-col">
          <SectionTitle>Topp {options.top5Count} per klasse</SectionTitle>
          <div
            className="grid gap-[10px] mt-[10px] flex-1 min-h-0"
            style={autoFitGrid(options.top5MinWidth)}
          >
            {mainClasses.map((cls) => (
              <div
                key={cls}
                className="bg-white rounded-[10px] border border-navy/10 overflow-hidden flex flex-col min-h-0"
                data-snap
              >
                <div
                  className="bg-red px-[12px] py-[6px] shrink-0"
                  style={top5HeaderStyle}
                >
                  <h4 className="font-display text-white tracking-wide">
                    {cls}
                  </h4>
                </div>
                <div className="flex-1 min-h-0 flex flex-col">
                  {(stats.topTenByClass[cls] || [])
                    .slice(0, options.top5Count)
                    .map((r, i) => (
                      <div
                        key={i}
                        className="flex items-center px-[12px] flex-1 min-h-0 border-b border-navy/5 last:border-b-0"
                        style={top5RowStyle}
                        data-snap
                      >
                        <span
                          className="font-display text-red w-[20px]"
                          style={{
                            fontSize: "calc(var(--ft-top5-row) * 1.15)",
                          }}
                        >
                          {i + 1}
                        </span>
                        <span
                          className="font-display w-[52px]"
                          style={{
                            fontSize: "calc(var(--ft-top5-row) * 1.15)",
                          }}
                        >
                          {r.time}
                        </span>
                        <span className="flex-1 truncate">
                          {r.firstName} {r.lastName}
                        </span>
                        <span className="text-navy/60 ml-[6px]">{r.year}</span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </DraggableBox>

      {/* Kolofon: Gjeving IL-logo, info og CTA til langheiopp.no */}
      <DraggableBox id="colophon">
        <div
          className="w-full h-full flex items-center gap-[16px]"
          data-snap
        >
          <div className="flex-1 min-w-0 flex flex-col justify-center text-right pr-[12px]">
            <p
              className="font-display text-navy uppercase leading-tight tracking-wide"
              style={colophonTitleStyle}
            >
              Langhei Opp {stats.yearsArranged.length} år · Gjeving IL 100 år
            </p>
            <p
              className="text-navy/70 leading-relaxed mt-[6px]"
              style={colophonTextStyle}
            >
              Data fra {stats.yearsArranged.length} arrangerte år,{" "}
              {stats.yearsArranged[0]}–
              {stats.yearsArranged[stats.yearsArranged.length - 1]}
              <br />
              Søkbar data og mer på{" "}
              <span className="underline underline-offset-2">
                langheiopp.no
              </span>
            </p>
          </div>
          <div className="relative h-full aspect-square shrink-0">
            <Image
              src="/images/GIL.svg"
              alt="Gjeving IL"
              fill
              sizes="120px"
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>
      </DraggableBox>
    </>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="font-display text-navy tracking-wide border-b-[3px] border-red pb-[3px] shrink-0 leading-tight"
      style={sectionTitleStyle}
    >
      {children}
    </h3>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div
      className="bg-white rounded-[8px] px-[8px] py-[8px] border border-navy/10 text-center flex flex-col justify-center min-h-0"
      data-snap
    >
      <div
        className="font-display text-red leading-none"
        style={statValueStyle}
      >
        {value}
      </div>
      <div
        className="text-navy/70 mt-[3px] leading-tight"
        style={statLabelStyle}
      >
        {label}
      </div>
    </div>
  );
}

function CourseMiniStat({ value, label, customValue }: { value: string; label: string; customValue?: React.ReactNode }) {
  return (
    <div
      className="bg-white rounded-[8px] px-[8px] py-[8px] border border-navy/10 text-center flex flex-col justify-center min-h-0"
      data-snap
    >
      <div
        className="font-display text-red leading-none"
        style={courseStatValueStyle}
      >
        {customValue ?? value}
      </div>
      <div
        className="text-navy/70 mt-[3px] leading-tight"
        style={courseStatLabelStyle}
      >
        {label}
      </div>
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
    <div
      className="bg-white rounded-[10px] p-[12px] border-2 border-red/20 relative overflow-hidden flex flex-col justify-center min-h-0"
      data-snap
    >
      <div className="absolute top-0 right-0 bg-red text-white text-[12px] px-[8px] py-[3px] rounded-bl font-medium">
        {classLabel}
      </div>
      <div
        className="font-display text-navy leading-none"
        style={recordTimeStyle}
      >
        {time}
      </div>
      <div
        className="mt-[6px] font-medium truncate"
        style={{ fontSize: "var(--ft-record-name)" }}
      >
        {name}
      </div>
      <div
        className="text-navy/60"
        style={{ fontSize: "calc(var(--ft-record-name) * 0.85)" }}
      >
        {year}
      </div>
    </div>
  );
}

function FunFactCard({ title, text }: { title: string; text: string }) {
  return (
    <div
      className="bg-white rounded-[8px] px-[14px] py-[8px] border border-navy/10 min-h-0 flex flex-col justify-center"
      data-snap
    >
      <p
        className="font-display text-red leading-none"
        style={funFactTitleStyle}
      >
        {title}
      </p>
      <p
        className="text-navy/80 leading-snug mt-[5px]"
        style={funFactTextStyle}
      >
        {text}
      </p>
    </div>
  );
}
