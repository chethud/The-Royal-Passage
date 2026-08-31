import { useEffect, useState } from "react";
import { useAuthUser } from "@/lib/auth-user";
import { fetchTravelAgentProfile } from "@/lib/partner-travel-agent-fns";
import { isTravelAgentRole } from "@/lib/roles";

let cachedToken: string | null = null;
let cachedDiscount = 0;
let inflight: Promise<number> | null = null;

async function loadTravelAgentDiscount(accessToken: string): Promise<number> {
  if (cachedToken === accessToken && !inflight) {
    return cachedDiscount;
  }
  if (inflight && cachedToken === accessToken) {
    return inflight;
  }

  cachedToken = accessToken;
  inflight = fetchTravelAgentProfile({ data: { accessToken } })
    .then((profile) => {
      cachedDiscount = profile.discountPercent ?? 0;
      return cachedDiscount;
    })
    .catch(() => {
      cachedDiscount = 0;
      return 0;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

export function useTravelAgentDiscount() {
  const { role, roles, accessToken } = useAuthUser();
  const isTravelAgent = isTravelAgentRole(role, roles);
  const [discountPercent, setDiscountPercent] = useState(() =>
    isTravelAgent && accessToken && cachedToken === accessToken ? cachedDiscount : 0,
  );
  const [ready, setReady] = useState(!isTravelAgent);

  useEffect(() => {
    if (!isTravelAgent || !accessToken) {
      setDiscountPercent(0);
      setReady(true);
      return;
    }

    let cancelled = false;
    setReady(false);

    void loadTravelAgentDiscount(accessToken)
      .then((value) => {
        if (!cancelled) setDiscountPercent(value);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, isTravelAgent]);

  return { discountPercent, isTravelAgent, ready };
}
