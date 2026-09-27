import { doc, getDoc, writeBatch, collection } from "firebase/firestore";
import { cAuth, cDb } from "@/firebase/config/client";

export interface RecordData {
  fecha: number;
  services: number;
  efectivo: number;
  tarjeta: number;
  notas?: string;
}

/**
 * Converts a timestamp in milliseconds to a dd-mm-yyyy string.
 */
function formatDateId(timestamp: number): string {
  const date = new Date(timestamp);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

/**
 * Adds (or overwrites) a record in a Firestore collection named after the
 * current user. The document ID is the fecha formatted as dd-mm-yyyy,
 * ensuring only one entry per day. Also logs the change.
 *
 * @returns The document ID (dd-mm-yyyy).
 * @throws  If no user is signed in.
 */
export async function addRecord(data: RecordData): Promise<string> {
  const user = cAuth.currentUser;
  if (!user) {
    throw new Error("No authenticated user found");
  }

  const docId = formatDateId(data.fecha);
  const recordRef = doc(cDb, "users", user.uid, "records", docId);
  const logRef = doc(collection(cDb, "users", user.uid, "logs"));

  const existingSnap = await getDoc(recordRef);
  const isUpdate = existingSnap.exists();
  const now = Date.now();

  const recordToSave = {
    ...data,
    userId: user.uid,
    createdAt: isUpdate ? existingSnap.data()?.createdAt || now : now,
    modifiedAt: now,
  };

  const logEntry = {
    action: isUpdate ? "UPDATE" : "CREATE",
    recordId: docId,
    timestamp: now,
    newData: data,
    previousData: isUpdate ? existingSnap.data() : null,
  };

  const batch = writeBatch(cDb);
  
  batch.set(recordRef, recordToSave);
  batch.set(logRef, logEntry);

  await batch.commit();

  return docId;
}
