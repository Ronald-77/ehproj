"use client";

import { useEffect, useState } from "react";

export function useRequireTeam() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/teams/me", { cache: "no-store" });

        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }

        const data = await res.json().catch(() => ({}));

        if (!data?.hasTeam) {
          window.location.href = "/team";
          return;
        }
      } catch {
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { loading };
}
