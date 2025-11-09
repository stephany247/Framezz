import { useUser } from "@clerk/clerk-expo";
import { useConvexAuth, useMutation } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

export function useStoreUserEffect() {
  const { isLoading: convexLoading, isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const storeUser = useMutation(api.users.storeUser);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    async function doStore() {
      try {
        const id = await storeUser();
        if (!cancelled) setUserId(id);
      } catch (e) {
        console.error("Failed to store user:", e);
      }
    }
    doStore();

    return () => {
      cancelled = true;
      setUserId(null);
    };
  }, [isAuthenticated, storeUser, user?.id]);

  return {
    isLoading: convexLoading || (isAuthenticated && userId === null),
    isAuthenticated: isAuthenticated && userId !== null,
    userId,
  };
}
