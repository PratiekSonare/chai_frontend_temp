"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Order() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to metric-card by default
    router.push("/orders/metric-card");
  }, [router]);

  return null;
}
