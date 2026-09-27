import { doc, getDoc, writeBatch, collection } from "firebase/firestore";
import { cAuth, cDb } from "@/firebase/config/client";

/**
 * Firestore path: /users/{userId}/notes/{MM-YYYY}
 */

function monthKey(month: number, year: number): string {
  return `${String(month).padStart(2, "0")}-${year}`;
}

function noteRef(userId: string, monthYear: string) {
  return doc(cDb, "users", userId, "notes", monthYear);
}

export async function getMonthNote(month: number, year: number): Promise<string> {
  const user = cAuth.currentUser;
  if (!user) throw new Error("No authenticated user found");

  const snap = await getDoc(noteRef(user.uid, monthKey(month, year)));

  return snap.exists() ? snap.data().text ?? "" : "";
}

export async function saveMonthNote(month: number, year: number, text: string): Promise<void> {
  const user = cAuth.currentUser;
  if (!user) throw new Error("No authenticated user found");

  const mKey = monthKey(month, year);
  const ref = noteRef(user.uid, mKey);
  const logRef = doc(collection(cDb, "users", user.uid, "logs"));

  const existingSnap = await getDoc(ref);
  const isUpdate = existingSnap.exists();
  const now = Date.now();

  const noteData = { text, userId: user.uid, updatedAt: now };

  const logEntry = {
    action: isUpdate ? "UPDATE_NOTE" : "CREATE_NOTE",
    recordId: mKey,
    timestamp: now,
    newData: noteData,
    previousData: isUpdate ? existingSnap.data() : null,
  };

  const batch = writeBatch(cDb);
  
  batch.set(ref, noteData, { merge: true });
  batch.set(logRef, logEntry);

  await batch.commit();
}
