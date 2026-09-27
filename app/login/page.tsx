"use client";

import LoginForm from "@/components/auth/LoginForm";
import { cAuth } from "@/firebase/config/client";
import { onAuthStateChanged, getRedirectResult } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // 1. Listen for auth state changes (fires immediately, sometimes with null before redirect finishes)
    const unsubscribe = onAuthStateChanged(cAuth, (currentUser) => {
      if (currentUser && isMounted) {
        router.push("/");
      }
    });

    // 2. Wait for getRedirectResult to finish before we assume the user is not logged in.
    // This resolves after Firebase fully reads IndexedDB and processes the Google Redirect.
    getRedirectResult(cAuth)
      .then(() => {
        if (isMounted && !cAuth.currentUser) {
          setCheckingAuth(false);
        }
      })
      .catch((error) => {
        console.error("Error processing redirect result:", error);
        if (isMounted) setCheckingAuth(false);
      });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <main className="flex flex-1 flex-col justify-center items-center">
        <LoginForm />
      </main>
    </div>
  );
}
