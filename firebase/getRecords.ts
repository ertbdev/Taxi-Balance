import { collection, query, where, getDocs } from "firebase/firestore";
import { cAuth, cDb } from "@/firebase/config/client";
import { RecordData } from "./addRecord";

/**
 * Gets records for a specific month and year.
 * @param month 1-indexed month (1 = January, 12 = December)
 * @param year Full year (e.g., 2026)
 * @returns Array of records for the selected month
 */
export async function getRecordsByMonth(month: number, year: number): Promise<RecordData[]> {
  const user = cAuth.currentUser;
  if (!user) {
    throw new Error("No authenticated user found");
  }

  const collectionName =
    user.displayName || user.email?.split("@")[0] || user.uid;

  // month is 1-12, so subtract 1 for Date object (0-11)
  const start = new Date(year, month - 1, 1).getTime();
  const end = new Date(year, month, 0, 23, 59, 59, 999).getTime();

  const q = query(
    collection(cDb, collectionName),
    where("userId", "==", user.uid),
    where("fecha", ">=", start),
    where("fecha", "<=", end)
  );

  const querySnapshot = await getDocs(q);
  const records: RecordData[] = [];
  querySnapshot.forEach((doc) => {
    records.push(doc.data() as RecordData);
  });

  return records;
}
