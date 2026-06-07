import fs from "fs";
import path from "path";

/**
 * Returns the date of the next Langhei Opp race (first Saturday in June).
 * After 12:00 on race day, returns next year's date.
 */
export function getNextRaceDate(): { day: number; year: number } {
  const now = new Date();
  const year = now.getFullYear();

  const firstSat = findFirstSaturdayInJune(year);
  const cutoff = new Date(year, 5, firstSat, 12, 0, 0);

  if (now < cutoff) {
    return { day: firstSat, year };
  }
  return { day: findFirstSaturdayInJune(year + 1), year: year + 1 };
}

function findFirstSaturdayInJune(year: number): number {
  const june1 = new Date(year, 5, 1);
  const dayOfWeek = june1.getDay(); // 0=Sun, 6=Sat
  return 1 + ((6 - dayOfWeek + 7) % 7);
}

// --- Course constants ---
export const COURSE = {
  length: 2180, // meters
  netElevationGain: 57, // meters (start to finish)
  grossElevationGain: 94, // meters (total climb including micro-descents)
  totalDescent: 39, // meters
  minElevation: 31, // meters above sea level
  maxElevation: 88, // meters above sea level
  startElevation: 31,
  finishElevation: 88,
  averageGradient: (57 / 2180) * 100, // ~2.6% net
  averageGradientGross: (94 / 2180) * 100, // ~4.3% gross
  elevationPerKm: 57 / 2.18, // ~26 m/km net
  elevationPerKmGross: 94 / 2.18, // ~43 m/km gross
} as const;

// --- Interfaces ---
export interface Result {
  time: string;
  timeInSeconds: number;
  lastName: string;
  firstName: string;
  year: number;
  class: string;
  place: number;
  bibNumber: number | null;
  timed: boolean;
}

export interface PersonalStats {
  name: string;
  results: Result[];
  bestTime: Result;
  totalRaces: number;
  years: number[];
}

export interface ClassRecord {
  class: string;
  record: Result;
}

export interface YearStats {
  year: number;
  totalParticipants: number;
  classes: string[];
}

export interface AllStats {
  results: Result[];
  totalResults: number;
  totalUniqueRunners: number;
  yearsArranged: number[];
  langheiOppAge: number;
  gjevingILAge: number;
  classRecords: ClassRecord[];
  topTenAllTime: Result[];
  topTenByClass: Record<string, Result[]>;
  yearStats: YearStats[];
  funFacts: FunFacts;
  courseStats: CourseStats;
}

export interface CourseStats {
  averageTimeSeconds: number;
  averageTime: string;
  medianTimeSeconds: number;
  medianTime: string;
  under10min: number;
  under15min: number;
  under20min: number;
  largestField: { year: number; count: number };
  smallestField: { year: number; count: number };
  genderSplit: { men: number; women: number; boys: number; girls: number };
  genderPercentage: { menPct: number; womenPct: number };
  recordVerticalSpeed: number; // m/h for course record
  recordVerticalSpeedWomen: number;
  allEditionsRunners: { name: string; editions: number }[];
}

export interface FunFacts {
  mostParticipations: { name: string; count: number };
  biggestImprovement: {
    name: string;
    from: string;
    to: string;
    improvementSeconds: number;
    yearFrom: number;
    yearTo: number;
  };
  oldestEdition: number;
  newestEdition: number;
  totalParticipantsAllTime: number;
  totalKmRun: number;
  totalKmComparison: string;
  totalElevationGain: number;
  totalElevationComparison: string;
  everestMultiple: number;
  biggestFamily: { lastName: string; members: number; participations: number };
  recordSpeedKmh: number;
  recordSpeedYear: number;
  firstEditionWinnerTime: string;
  recordImprovedBy: number;
  mostConsistent: { name: string; variance: string; races: number };
  closestFinish: { names: string[]; time: string; year: number };
  fastestDebut: { name: string; time: string; year: number };
}

function parseTime(timeStr: string): number {
  const parts = timeStr.split(":");
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  return 0;
}

export function formatTime(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

export function parseCSV(): Result[] {
  const csvPath = path.join(process.cwd(), "src/data/results.csv");
  const content = fs.readFileSync(csvPath, "utf-8");
  const lines = content.split("\n");

  const results: Result[] = [];

  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(",");
    if (parts.length < 6) continue;

    const time = parts[0].trim();
    if (!time || !time.includes(":")) continue;

    const result: Result = {
      time,
      timeInSeconds: parseTime(time),
      lastName: parts[1].trim(),
      firstName: parts[2].trim(),
      year: parseInt(parts[3].trim()),
      class: parts[4].trim(),
      place: parseInt(parts[5].trim()) || 0,
      bibNumber: parts[6] ? parseInt(parts[6].trim()) || null : null,
      timed: true,
    };

    if (result.timeInSeconds > 0 && result.year > 0) {
      results.push(result);
    }
  }

  return results;
}

export function parseTrimBarnCSV(): Result[] {
  const csvPath = path.join(process.cwd(), "src/data/trim_barn.csv");
  if (!fs.existsSync(csvPath)) return [];
  const content = fs.readFileSync(csvPath, "utf-8");
  const lines = content.split("\n");

  const results: Result[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(",");
    if (parts.length < 5) continue;

    const lastName = parts[1].trim();
    const firstName = parts[2].trim();
    const year = parseInt(parts[3].trim());
    const cls = parts[4].trim();

    if (!lastName && !firstName) continue;
    if (!year) continue;

    results.push({
      time: "",
      timeInSeconds: 0,
      lastName,
      firstName,
      year,
      class: cls,
      place: 0,
      bibNumber: null,
      timed: false,
    });
  }

  return results;
}

export function parseAllResults(): { timed: Result[]; untimed: Result[]; all: Result[] } {
  const timed = parseCSV();
  const untimed = parseTrimBarnCSV();
  return { timed, untimed, all: [...timed, ...untimed] };
}

export function getFullName(result: Result): string {
  return `${result.firstName} ${result.lastName}`;
}

export function computeStats(timedResults: Result[], allResults?: Result[]): AllStats {
  const all = allResults || timedResults;

  const sortedByTime = [...timedResults].sort(
    (a, b) => a.timeInSeconds - b.timeInSeconds
  );

  // Unique runners counts everyone (incl. trim/barn)
  const uniqueRunners = new Set(
    all.map((r) => `${r.firstName.trim()} ${r.lastName.trim()}`)
  );

  const years = [...new Set(all.map((r) => r.year))].sort();

  // Class records and top lists only from timed results
  const timedClasses = [...new Set(timedResults.map((r) => r.class))];
  const classRecords: ClassRecord[] = timedClasses.map((cls) => {
    const classResults = sortedByTime.filter((r) => r.class === cls);
    return { class: cls, record: classResults[0] };
  });

  const topTenAllTime = sortedByTime.slice(0, 10);

  const topTenByClass: Record<string, Result[]> = {};
  for (const cls of timedClasses) {
    topTenByClass[cls] = sortedByTime
      .filter((r) => r.class === cls)
      .slice(0, 10);
  }

  // Year stats includes all participants
  const yearStats: YearStats[] = years.map((year) => {
    const yearResults = all.filter((r) => r.year === year);
    return {
      year,
      totalParticipants: yearResults.length,
      classes: [...new Set(yearResults.map((r) => r.class))],
    };
  });

  const funFacts = computeFunFacts(timedResults, all);
  const courseStats = computeCourseStats(timedResults, sortedByTime, years, classRecords, all);

  const GJEVING_IL_FOUNDED = 1926;
  const currentYear = new Date().getFullYear();
  const lastDataYear = years[years.length - 1];
  const langheiOppAge = years.length + (currentYear > lastDataYear ? 1 : 0);
  const gjevingILAge = currentYear - GJEVING_IL_FOUNDED;

  return {
    results: sortedByTime,
    totalResults: timedResults.length,
    totalUniqueRunners: uniqueRunners.size,
    yearsArranged: years,
    langheiOppAge,
    gjevingILAge,
    classRecords,
    topTenAllTime,
    topTenByClass,
    yearStats,
    funFacts,
    courseStats,
  };
}

function computeCourseStats(
  results: Result[],
  sortedByTime: Result[],
  years: number[],
  classRecords: ClassRecord[],
  allResults?: Result[]
): CourseStats {
  const times = results.map((r) => r.timeInSeconds);
  const totalTime = times.reduce((sum, t) => sum + t, 0);
  const averageTimeSeconds = Math.round(totalTime / times.length);

  const sortedTimes = [...times].sort((a, b) => a - b);
  const mid = Math.floor(sortedTimes.length / 2);
  const medianTimeSeconds =
    sortedTimes.length % 2 === 0
      ? Math.round((sortedTimes[mid - 1] + sortedTimes[mid]) / 2)
      : sortedTimes[mid];

  const under10min = results.filter((r) => r.timeInSeconds < 600).length;
  const under15min = results.filter((r) => r.timeInSeconds < 900).length;
  const under20min = results.filter((r) => r.timeInSeconds < 1200).length;

  const yearCounts = years.map((year) => ({
    year,
    count: results.filter((r) => r.year === year).length,
  }));
  const largestField = yearCounts.reduce((max, yc) =>
    yc.count > max.count ? yc : max
  );
  const smallestField = yearCounts.reduce((min, yc) =>
    yc.count < min.count ? yc : min
  );

  const men = results.filter((r) => r.class === "Mann").length;
  const women = results.filter((r) => r.class === "Dame").length;
  const boys = results.filter((r) => r.class === "Gutt").length;
  const girls = results.filter((r) => r.class === "Jente").length;
  const totalAdult = men + women;
  const menPct = totalAdult > 0 ? Math.round((men / totalAdult) * 100) : 0;
  const womenPct = totalAdult > 0 ? Math.round((women / totalAdult) * 100) : 0;

  // Vertical speed: elevation gain / time in hours
  const recordMen = classRecords.find((cr) => cr.class === "Mann");
  const recordWomen = classRecords.find((cr) => cr.class === "Dame");
  const recordVerticalSpeed = recordMen
    ? Math.round(
        COURSE.grossElevationGain / (recordMen.record.timeInSeconds / 3600)
      )
    : 0;
  const recordVerticalSpeedWomen = recordWomen
    ? Math.round(
        COURSE.grossElevationGain / (recordWomen.record.timeInSeconds / 3600)
      )
    : 0;

  // Runners who have completed most unique editions (counting ALL participations)
  const editionsSource = allResults || results;
  const personEditions: Record<string, Set<number>> = {};
  for (const r of editionsSource) {
    const name = `${r.firstName.trim()} ${r.lastName.trim()}`;
    if (!personEditions[name]) personEditions[name] = new Set();
    personEditions[name].add(r.year);
  }
  const allEditionsRunners = Object.entries(personEditions)
    .map(([name, editionSet]) => ({ name, editions: editionSet.size }))
    .sort((a, b) => b.editions - a.editions)
    .slice(0, 10);

  return {
    averageTimeSeconds,
    averageTime: formatTime(averageTimeSeconds),
    medianTimeSeconds,
    medianTime: formatTime(medianTimeSeconds),
    under10min,
    under15min,
    under20min,
    largestField,
    smallestField,
    genderSplit: { men, women, boys, girls },
    genderPercentage: { menPct, womenPct },
    recordVerticalSpeed,
    recordVerticalSpeedWomen,
    allEditionsRunners,
  };
}

const DISTANCE_LANDMARKS = [
  { city: "Oslo", km: 177 },
  { city: "Stavanger", km: 189 },
  { city: "Bergen", km: 284 },
  { city: "København", km: 395 },
  { city: "Stockholm", km: 531 },
  { city: "Trondheim", km: 542 },
  { city: "Berlin", km: 735 },
  { city: "Amsterdam", km: 741 },
  { city: "Edinburgh", km: 788 },
  { city: "Helsinki", km: 923 },
  { city: "London", km: 979 },
  { city: "Bodø", km: 1002 },
  { city: "Warszawa", km: 1042 },
  { city: "Paris", km: 1169 },
  { city: "Wien", km: 1258 },
  { city: "Tromsø", km: 1319 },
  { city: "Nordkapp", km: 1500 },
  { city: "Reykjavik", km: 1740 },
  { city: "Moskva", km: 1750 },
  { city: "Roma", km: 1877 },
  { city: "Barcelona", km: 1975 },
  { city: "Madrid", km: 2214 },
  { city: "Istanbul", km: 2412 },
  { city: "Athen", km: 2532 },
  { city: "Lisboa", km: 2563 },
  { city: "Kairo", km: 3602 },
  { city: "Dubai", km: 5165 },
  { city: "Dakar", km: 5345 },
  { city: "New York", km: 5881 },
] as const;

function getDistanceComparison(km: number): string {
  let best: { city: string; km: number; ratio: number } | null = null;

  for (const landmark of DISTANCE_LANDMARKS) {
    const ratio = km / landmark.km;
    if (ratio < 0.8 || ratio > 2.5) continue;
    if (!best || Math.abs(ratio - 1) < Math.abs(best.ratio - 1)) {
      best = { ...landmark, ratio };
    }
  }

  if (!best) return `${km} km`;

  const ratio = best.ratio;
  const dest = `Gjeving-${best.city}`;

  if (ratio >= 0.95 && ratio <= 1.05) return `Omtrent som ${dest}`;
  if (ratio > 1.05 && ratio <= 1.15) return `Litt mer enn ${dest}`;
  if (ratio > 1.15 && ratio <= 1.35) return `Godt over ${dest}`;
  if (ratio > 1.35 && ratio <= 1.6) return `Nesten halvannen gang ${dest}`;
  if (ratio > 1.6 && ratio <= 2.1) return `Nesten to ganger ${dest}`;
  if (ratio > 2.1 && ratio <= 2.5) return `Over dobbelt ${dest}`;
  if (ratio >= 0.85 && ratio < 0.95) return `Nesten like langt som ${dest}`;
  if (ratio >= 0.8 && ratio < 0.85) return `Ikke langt unna ${dest}`;

  return `${km} km`;
}

const ELEVATION_THINGS = [
  { name: "Eiffeltårnet", m: 330, roundOnly: [50, 100, 150, 200, 250, 500, 1000] },
  { name: "Prekestolen", m: 604, roundOnly: [25, 50, 75, 100, 150, 200, 500] },
  { name: "Burj Khalifa", m: 830, roundOnly: [25, 50, 75, 100, 150, 200] },
  { name: "Galdhøpiggen", m: 2469, roundOnly: [10, 15, 20, 25, 30, 40, 50, 75, 100] },
  { name: "Kilimanjaro", m: 5895, nice: true },
  { name: "Mount Everest", m: 8849, nice: true },
] as const;

function getElevationComparison(m: number): string {
  let best: { text: string; score: number } | null = null;

  for (const thing of ELEVATION_THINGS) {
    const n = m / thing.m;
    if (n < 2) continue;

    if ("roundOnly" in thing && thing.roundOnly) {
      for (const target of thing.roundOnly) {
        const err = Math.abs(n - target) / target;
        if (err <= 0.06) {
          const impressiveness = target >= 1000 ? 5 : target >= 500 ? 4 : target >= 100 ? 3 : target >= 50 ? 2 : 1;
          const score = err - impressiveness * 0.02;
          if (!best || score < best.score) {
            best = { text: `${target} × ${thing.name}`, score };
          }
        }
      }
    }

    if ("nice" in thing && thing.nice) {
      const rounded = Math.round(n * 10) / 10;
      const err = Math.abs(n - rounded) / n;
      const isWholeNumber = Math.abs(rounded - Math.round(rounded)) < 0.01;
      const display = isWholeNumber ? `${Math.round(rounded)}` : rounded.toFixed(1);
      const famousBonus = thing.m >= 8000 ? 0.03 : 0.015;
      const score = err - famousBonus;
      if (!best || score < best.score) {
        best = { text: `${display} × ${thing.name}`, score };
      }
    }
  }

  return best?.text ?? `${(m / 8849).toFixed(1)} × Mount Everest`;
}

function computeFunFacts(results: Result[], allResults?: Result[]): FunFacts {
  const all = allResults || results;
  // Most participations counts ALL (including trim/barn)
  const participationCount: Record<string, number> = {};
  for (const r of all) {
    const name = `${r.firstName.trim()} ${r.lastName.trim()}`;
    participationCount[name] = (participationCount[name] || 0) + 1;
  }
  const mostParticipationsEntry = Object.entries(participationCount).sort(
    (a, b) => b[1] - a[1]
  )[0];

  // Biggest improvement: only consider people in adult class both times
  const personResults: Record<string, Result[]> = {};
  for (const r of results) {
    const name = `${r.firstName.trim()} ${r.lastName.trim()}`;
    if (!personResults[name]) personResults[name] = [];
    personResults[name].push(r);
  }

  let biggestImprovement = {
    name: "",
    from: "",
    to: "",
    improvementSeconds: 0,
    yearFrom: 0,
    yearTo: 0,
  };

  for (const [name, pResults] of Object.entries(personResults)) {
    if (pResults.length < 2) continue;
    const adultResults = pResults.filter(
      (r) => r.class === "Mann" || r.class === "Dame"
    );
    if (adultResults.length < 2) continue;

    const sorted = [...adultResults].sort((a, b) => a.year - b.year);
    const firstTime = sorted[0];
    const bestAfterFirst = sorted
      .slice(1)
      .reduce(
        (best, r) => (r.timeInSeconds < best.timeInSeconds ? r : best),
        sorted[1]
      );

    if (bestAfterFirst.timeInSeconds < firstTime.timeInSeconds) {
      const improvement = firstTime.timeInSeconds - bestAfterFirst.timeInSeconds;
      if (improvement > biggestImprovement.improvementSeconds) {
        biggestImprovement = {
          name,
          from: firstTime.time,
          to: bestAfterFirst.time,
          improvementSeconds: improvement,
          yearFrom: firstTime.year,
          yearTo: bestAfterFirst.year,
        };
      }
    }
  }

  const years = [...new Set(results.map((r) => r.year))].sort();

  // Total distance and elevation
  const totalKmRun = Math.round((results.length * COURSE.length) / 1000);
  const totalKmComparison = getDistanceComparison(totalKmRun);
  const totalElevationGain = results.length * COURSE.grossElevationGain;
  const totalElevationComparison = getElevationComparison(totalElevationGain);
  const everestMultiple = parseFloat((totalElevationGain / 8849).toFixed(1));

  // Biggest family (by last name)
  const familyCount: Record<string, Set<string>> = {};
  const familyParticipations: Record<string, number> = {};
  for (const r of results) {
    const ln = r.lastName.trim();
    if (!familyCount[ln]) familyCount[ln] = new Set();
    familyCount[ln].add(r.firstName.trim());
    familyParticipations[ln] = (familyParticipations[ln] || 0) + 1;
  }
  const biggestFamilyEntry = Object.entries(familyCount).sort(
    (a, b) => b[1].size - a[1].size
  )[0];

  // Record speed in km/h
  const fastestTime = results.reduce((min, r) =>
    r.timeInSeconds < min.timeInSeconds ? r : min
  );
  const recordSpeedKmh = parseFloat(
    ((COURSE.length / 1000) / (fastestTime.timeInSeconds / 3600)).toFixed(1)
  );

  // First edition winner vs current record
  const firstEditionResults = results
    .filter((r) => r.year === years[0] && r.class === "Mann")
    .sort((a, b) => a.timeInSeconds - b.timeInSeconds);
  const firstEditionWinnerTime = firstEditionResults[0]?.time || "";
  const recordImprovedBy = firstEditionResults[0]
    ? firstEditionResults[0].timeInSeconds - fastestTime.timeInSeconds
    : 0;

  // Most consistent runner (lowest time variance with 3+ races in same class)
  let mostConsistent = { name: "", variance: "", races: 0 };
  let lowestVariance = Infinity;
  for (const [name, pResults] of Object.entries(personResults)) {
    const adultResults = pResults.filter(
      (r) => r.class === "Mann" || r.class === "Dame"
    );
    if (adultResults.length < 5) continue;
    const times = adultResults.map((r) => r.timeInSeconds);
    const avg = times.reduce((s, t) => s + t, 0) / times.length;
    const variance = Math.sqrt(
      times.reduce((s, t) => s + (t - avg) ** 2, 0) / times.length
    );
    if (variance < lowestVariance) {
      lowestVariance = variance;
      mostConsistent = {
        name,
        variance: `±${Math.round(variance)} sek`,
        races: adultResults.length,
      };
    }
  }

  // Closest finish (same time, same year, same class)
  let closestFinish = { names: ["", ""], time: "", year: 0 };
  const byYearClass: Record<string, Result[]> = {};
  for (const r of results) {
    const key = `${r.year}-${r.class}`;
    if (!byYearClass[key]) byYearClass[key] = [];
    byYearClass[key].push(r);
  }
  for (const group of Object.values(byYearClass)) {
    const sorted = [...group].sort((a, b) => a.timeInSeconds - b.timeInSeconds);
    for (let i = 0; i < sorted.length - 1; i++) {
      if (
        sorted[i].timeInSeconds === sorted[i + 1].timeInSeconds &&
        getFullName(sorted[i]) !== getFullName(sorted[i + 1])
      ) {
        closestFinish = {
          names: [getFullName(sorted[i]), getFullName(sorted[i + 1])],
          time: sorted[i].time,
          year: sorted[i].year,
        };
        break;
      }
    }
    if (closestFinish.year) break;
  }

  // Fastest debut (first race for adult runners)
  const debutTimes: { name: string; time: string; secs: number; year: number }[] = [];
  for (const [name, pResults] of Object.entries(personResults)) {
    const sorted = [...pResults].sort((a, b) => a.year - b.year);
    if (sorted[0].class === "Mann" || sorted[0].class === "Dame") {
      debutTimes.push({ name, time: sorted[0].time, secs: sorted[0].timeInSeconds, year: sorted[0].year });
    }
  }
  debutTimes.sort((a, b) => a.secs - b.secs);
  const fastestDebut = debutTimes[0]
    ? { name: debutTimes[0].name, time: debutTimes[0].time, year: debutTimes[0].year }
    : { name: "", time: "", year: 0 };

  return {
    mostParticipations: {
      name: mostParticipationsEntry[0],
      count: mostParticipationsEntry[1],
    },
    biggestImprovement,
    oldestEdition: years[0],
    newestEdition: years[years.length - 1],
    totalParticipantsAllTime: all.length,
    totalKmRun,
    totalKmComparison,
    totalElevationGain,
    totalElevationComparison,
    everestMultiple,
    biggestFamily: {
      lastName: biggestFamilyEntry[0],
      members: biggestFamilyEntry[1].size,
      participations: familyParticipations[biggestFamilyEntry[0]],
    },
    recordSpeedKmh,
    recordSpeedYear: fastestTime.year,
    firstEditionWinnerTime,
    recordImprovedBy,
    mostConsistent,
    closestFinish,
    fastestDebut,
  };
}

export function getPersonalStats(
  results: Result[],
  searchName: string
): PersonalStats | null {
  const normalizedSearch = searchName.toLowerCase().trim();
  const personResults = results.filter((r) => {
    const fullName = `${r.firstName} ${r.lastName}`.toLowerCase().trim();
    const reverseName = `${r.lastName} ${r.firstName}`.toLowerCase().trim();
    return (
      fullName.includes(normalizedSearch) ||
      reverseName.includes(normalizedSearch)
    );
  });

  if (personResults.length === 0) return null;

  const sorted = [...personResults].sort(
    (a, b) => a.timeInSeconds - b.timeInSeconds
  );
  const name = getFullName(sorted[0]);

  return {
    name,
    results: personResults.sort((a, b) => a.year - b.year),
    bestTime: sorted[0],
    totalRaces: personResults.length,
    years: [...new Set(personResults.map((r) => r.year))].sort(),
  };
}
