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

    // Must be called to process the redirect login properly on some devices
    getRedirectResult(cAuth)
      .then((result) => {
        if (result?.user && isMounted) {
          router.push("/");
        }
      })
      .catch((error) => {
        console.error("Error processing redirect result:", error);
      });

    const unsubscribe = onAuthStateChanged(cAuth, (currentUser) => {
      if (currentUser) {
        if (isMounted) router.push("/");
      } else {
        if (isMounted) setCheckingAuth(false);
      }
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
