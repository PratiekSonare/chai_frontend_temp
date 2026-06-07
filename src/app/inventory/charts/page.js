"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChartsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/inventory/dashboard");
  }, [router]);

  return null;
}
