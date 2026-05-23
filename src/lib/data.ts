import fs from "fs";
import path from "path";

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
  totalElevationGain: number;
  everestMultiple: number;
  biggestFamily: { lastName: string; members: number; participations: number };
  recordSpeedKmh: number;
  firstEditionWinnerTime: string;
  recordImprovedBy: number;
  mostConsistent: { name: string; variance: string; races: number };
  closestFinish: { names: string[]; time: string; year: number };
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
    };

    if (result.timeInSeconds > 0 && result.year > 0) {
      results.push(result);
    }
  }

  return results;
}

export function getFullName(result: Result): string {
  return `${result.firstName} ${result.lastName}`;
}

export function computeStats(results: Result[]): AllStats {
  const sortedByTime = [...results].sort(
    (a, b) => a.timeInSeconds - b.timeInSeconds
  );

  const uniqueRunners = new Set(
    results.map((r) => `${r.firstName.trim()} ${r.lastName.trim()}`)
  );

  const years = [...new Set(results.map((r) => r.year))].sort();

  const classes = [...new Set(results.map((r) => r.class))];
  const classRecords: ClassRecord[] = classes.map((cls) => {
    const classResults = sortedByTime.filter((r) => r.class === cls);
    return { class: cls, record: classResults[0] };
  });

  const topTenAllTime = sortedByTime.slice(0, 10);

  const topTenByClass: Record<string, Result[]> = {};
  for (const cls of classes) {
    topTenByClass[cls] = sortedByTime
      .filter((r) => r.class === cls)
      .slice(0, 10);
  }

  const yearStats: YearStats[] = years.map((year) => {
    const yearResults = results.filter((r) => r.year === year);
    return {
      year,
      totalParticipants: yearResults.length,
      classes: [...new Set(yearResults.map((r) => r.class))],
    };
  });

  const funFacts = computeFunFacts(results);
  const courseStats = computeCourseStats(results, sortedByTime, years, classRecords);

  return {
    results: sortedByTime,
    totalResults: results.length,
    totalUniqueRunners: uniqueRunners.size,
    yearsArranged: years,
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
  classRecords: ClassRecord[]
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

  // Runners who have completed most unique editions
  const personEditions: Record<string, Set<number>> = {};
  for (const r of results) {
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

function computeFunFacts(results: Result[]): FunFacts {
  const participationCount: Record<string, number> = {};
  for (const r of results) {
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
  const totalElevationGain = results.length * COURSE.grossElevationGain;
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
    if (adultResults.length < 3) continue;
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

  return {
    mostParticipations: {
      name: mostParticipationsEntry[0],
      count: mostParticipationsEntry[1],
    },
    biggestImprovement,
    oldestEdition: years[0],
    newestEdition: years[years.length - 1],
    totalParticipantsAllTime: results.length,
    totalKmRun,
    totalElevationGain,
    everestMultiple,
    biggestFamily: {
      lastName: biggestFamilyEntry[0],
      members: biggestFamilyEntry[1].size,
      participations: familyParticipations[biggestFamilyEntry[0]],
    },
    recordSpeedKmh,
    firstEditionWinnerTime,
    recordImprovedBy,
    mostConsistent,
    closestFinish,
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
