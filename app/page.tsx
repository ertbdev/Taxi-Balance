"use client";

import AddForm from "@/components/interface/AddForm";
import { Button } from "@/components/ui/button";
import { cAuth } from "@/firebase/config/client";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(cAuth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(cAuth);
    router.refresh();
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <header className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        Landing Page
      </header>
      <main className="flex flex-1 flex-col justify-center items-center">
        <AddForm />
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <Button disabled={loading} form="logout-form" onClick={handleLogout}>
          Logout
        </Button>
      </footer>
    </div>
  );
}
