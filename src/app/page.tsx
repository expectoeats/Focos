"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          router.replace("/dashboard");
        } else {
          router.replace("/login");
        }
      })
      .catch(() => {
        router.replace("/login");
      })
      .finally(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-zinc-500 text-sm">Loading...</div>
      </div>
    );
  }

  return null;
}
