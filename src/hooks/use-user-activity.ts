import { useCallback, useEffect, useMemo, useState } from "react";
import type { FilterState } from "@/components/properties/PropertyFilters";

interface UserActivityState {
  favorites: string[];
  viewedPropertyIds: string[];
  lastFilters: FilterState | null;
  lastSearch: string;
  updatedAt: string | null;
}

const DEFAULT_ACTIVITY: UserActivityState = {
  favorites: [],
  viewedPropertyIds: [],
  lastFilters: null,
  lastSearch: "",
  updatedAt: null,
};

function getStorageKey(userId: string) {
  return `cs_activity_user_${userId}`;
}

function readActivity(userId: string): UserActivityState {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return DEFAULT_ACTIVITY;

    const parsed = JSON.parse(raw) as Partial<UserActivityState>;
    return {
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      viewedPropertyIds: Array.isArray(parsed.viewedPropertyIds)
        ? parsed.viewedPropertyIds
        : [],
      lastFilters: parsed.lastFilters ?? null,
      lastSearch: typeof parsed.lastSearch === "string" ? parsed.lastSearch : "",
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null,
    };
  } catch {
    return DEFAULT_ACTIVITY;
  }
}

function writeActivity(userId: string, data: UserActivityState) {
  localStorage.setItem(getStorageKey(userId), JSON.stringify(data));
}

export function useUserActivity(userId?: string) {
  const resolvedUserId = useMemo(() => userId ?? "guest", [userId]);
  const [activity, setActivity] = useState<UserActivityState>(DEFAULT_ACTIVITY);

  useEffect(() => {
    setActivity(readActivity(resolvedUserId));
  }, [resolvedUserId]);

  const update = useCallback(
    (updater: (prev: UserActivityState) => UserActivityState) => {
      setActivity((prev) => {
        const next = {
          ...updater(prev),
          updatedAt: new Date().toISOString(),
        };
        writeActivity(resolvedUserId, next);
        return next;
      });
    },
    [resolvedUserId]
  );

  const toggleFavorite = useCallback(
    (propertyId: string) => {
      update((prev) => {
        const exists = prev.favorites.includes(propertyId);
        return {
          ...prev,
          favorites: exists
            ? prev.favorites.filter((id) => id !== propertyId)
            : [...prev.favorites, propertyId],
        };
      });
    },
    [update]
  );

  const markViewed = useCallback(
    (propertyId: string) => {
      update((prev) => {
        if (prev.viewedPropertyIds.includes(propertyId)) return prev;
        return {
          ...prev,
          viewedPropertyIds: [propertyId, ...prev.viewedPropertyIds].slice(0, 20),
        };
      });
    },
    [update]
  );

  const saveFilters = useCallback(
    (filters: FilterState) => {
      update((prev) => ({
        ...prev,
        lastFilters: filters,
      }));
    },
    [update]
  );

  const saveSearch = useCallback(
    (search: string) => {
      update((prev) => ({
        ...prev,
        lastSearch: search,
      }));
    },
    [update]
  );

  return {
    favorites: activity.favorites,
    viewedPropertyIds: activity.viewedPropertyIds,
    lastFilters: activity.lastFilters,
    lastSearch: activity.lastSearch,
    updatedAt: activity.updatedAt,
    toggleFavorite,
    markViewed,
    saveFilters,
    saveSearch,
  };
}
