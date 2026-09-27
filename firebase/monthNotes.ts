import { doc, getDoc, setDoc } from "firebase/firestore";
import { cAuth, cDb } from "@/firebase/config/client";

/**
 * Firestore path: /{username}/_metadata/notes/{MM-YYYY}
 *
 * - {username}   — top-level collection (named after the user)
 * - _metadata    — fixed placeholder document (holds subcollections)
 * - notes        — subcollection
 * - {MM-YYYY}    — one document per month
 */

function monthKey(month: number, year: number): string {
  return `${String(month).padStart(2, "0")}-${year}`;
}

function noteRef(collectionName: string, monthYear: string) {
  // 4 path segments = valid Firestore document reference
  return doc(cDb, collectionName, "_metadata", "notes", monthYear);
}

export async function getMonthNote(month: number, year: number): Promise<string> {
  const user = cAuth.currentUser;
  if (!user) throw new Error("No authenticated user found");

  const collectionName = user.displayName || user.email?.split("@")[0] || user.uid;
  const snap = await getDoc(noteRef(collectionName, monthKey(month, year)));

  return snap.exists() ? snap.data().text ?? "" : "";
}

export async function saveMonthNote(month: number, year: number, text: string): Promise<void> {
  const user = cAuth.currentUser;
  if (!user) throw new Error("No authenticated user found");

  const collectionName = user.displayName || user.email?.split("@")[0] || user.uid;

  await setDoc(
    noteRef(collectionName, monthKey(month, year)),
    { text, userId: user.uid, updatedAt: Date.now() },
    { merge: true }
  );
}
