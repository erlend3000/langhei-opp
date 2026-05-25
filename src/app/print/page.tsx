import { parseAllResults, computeStats, getFullName } from "@/lib/data";
import { PrintPosterClient } from "./PrintPosterClient";

export default function PrintPoster() {
  const { timed, all } = parseAllResults();
  const stats = computeStats(timed, all);

  const classRecordsByClass: Record<
    string,
    { time: string; name: string; year: number }
  > = {};
  for (const cr of stats.classRecords) {
    classRecordsByClass[cr.class] = {
      time: cr.record.time,
      name: getFullName(cr.record),
      year: cr.record.year,
    };
  }

  return (
    <PrintPosterClient
      stats={stats}
      classRecordsByClass={classRecordsByClass}
    />
  );
}
