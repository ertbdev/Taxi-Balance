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

export async function getRecordByDate(timestamp: number): Promise<RecordData | null> {
  const user = cAuth.currentUser;
  if (!user) {
    throw new Error("No authenticated user found");
  }

  const collectionName = user.displayName || user.email?.split("@")[0] || user.uid;
  const date = new Date(timestamp);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  const docId = `${dd}-${mm}-${yyyy}`;

  // Since we know the document ID directly, we can just getDoc instead of querying
  const { doc, getDoc } = await import("firebase/firestore");
  const docRef = doc(cDb, collectionName, docId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists() && docSnap.data()?.userId === user.uid) {
    return docSnap.data() as RecordData;
  }
  
  return null;
}
