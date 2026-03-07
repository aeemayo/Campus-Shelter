import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { FilterState } from "@/components/properties/PropertyFilters";
import { fetchFavoriteIds, toggleFavoriteApi } from "@/services/favorites";

interface LocalActivityState {
  viewedPropertyIds: string[];
  lastFilters: FilterState | null;
  lastSearch: string;
  updatedAt: string | null;
}

const DEFAULT_LOCAL: LocalActivityState = {
  viewedPropertyIds: [],
  lastFilters: null,
  lastSearch: "",
  updatedAt: null,
};

function getStorageKey(userId: string) {
  return `cs_activity_user_${userId}`;
}

function readLocal(userId: string): LocalActivityState {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return DEFAULT_LOCAL;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return {
      viewedPropertyIds: Array.isArray(parsed.viewedPropertyIds)
        ? (parsed.viewedPropertyIds as string[])
        : [],
      lastFilters: (parsed.lastFilters as FilterState) ?? null,
      lastSearch: typeof parsed.lastSearch === "string" ? parsed.lastSearch : "",
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null,
    };
  } catch {
    return DEFAULT_LOCAL;
  }
}

function writeLocal(userId: string, data: LocalActivityState) {
  localStorage.setItem(getStorageKey(userId), JSON.stringify(data));
}

// Legacy: read favorites that were stored in localStorage before DB migration
function readLegacyFavorites(userId: string): string[] {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Array.isArray(parsed.favorites) ? (parsed.favorites as string[]) : [];
  } catch {
    return [];
  }
}

function clearLegacyFavorites(userId: string) {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    delete parsed.favorites;
    localStorage.setItem(getStorageKey(userId), JSON.stringify(parsed));
  } catch {
    // ignore
  }
}

export function useUserActivity(userId?: string) {
  const resolvedUserId = useMemo(() => userId ?? "guest", [userId]);
  const isAuthenticated = !!userId;
  const queryClient = useQueryClient();

  const [local, setLocal] = useState<LocalActivityState>(DEFAULT_LOCAL);

  useEffect(() => {
    setLocal(readLocal(resolvedUserId));
  }, [resolvedUserId]);

  // ── DB-backed favorites (authenticated users) ──
  const { data: dbFavorites } = useQuery({
    queryKey: ["favorites", userId],
    queryFn: async () => {
      const ids = await fetchFavoriteIds();
      // Migrate any legacy localStorage favorites to DB on first load
      const legacy = readLegacyFavorites(userId!);
      if (legacy.length > 0) {
        for (const id of legacy) {
          if (!ids.includes(id)) {
            try {
              await toggleFavoriteApi(id);
            } catch {
              // skip silently if property no longer exists
            }
          }
        }
        clearLegacyFavorites(userId!);
        return [...new Set([...ids, ...legacy])];
      }
      return ids;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  // ── Guest favorites stay in localStorage ──
  const [guestFavorites, setGuestFavorites] = useState<string[]>([]);
  useEffect(() => {
    if (!isAuthenticated) {
      setGuestFavorites(readLegacyFavorites("guest"));
    }
  }, [isAuthenticated]);

  const favorites = isAuthenticated ? (dbFavorites ?? []) : guestFavorites;

  const toggleFavorite = useCallback(
    async (propertyId: string) => {
      if (isAuthenticated) {
        // Optimistic update
        queryClient.setQueryData<string[]>(["favorites", userId], (prev = []) =>
          prev.includes(propertyId)
            ? prev.filter((id) => id !== propertyId)
            : [...prev, propertyId],
        );
        try {
          await toggleFavoriteApi(propertyId);
          queryClient.invalidateQueries({ queryKey: ["favorites", userId] });
        } catch {
          // Revert on error
          queryClient.invalidateQueries({ queryKey: ["favorites", userId] });
        }
      } else {
        setGuestFavorites((prev) => {
          const next = prev.includes(propertyId)
            ? prev.filter((id) => id !== propertyId)
            : [...prev, propertyId];
          const raw = localStorage.getItem(getStorageKey("guest"));
          const parsed = raw ? JSON.parse(raw) : {};
          localStorage.setItem(
            getStorageKey("guest"),
            JSON.stringify({ ...parsed, favorites: next }),
          );
          return next;
        });
      }
    },
    [isAuthenticated, userId, queryClient],
  );

  // ── Local-only state updates ──
  const updateLocal = useCallback(
    (updater: (prev: LocalActivityState) => LocalActivityState) => {
      setLocal((prev) => {
        const next = { ...updater(prev), updatedAt: new Date().toISOString() };
        writeLocal(resolvedUserId, next);
        return next;
      });
    },
    [resolvedUserId],
  );

  const markViewed = useCallback(
    (propertyId: string) => {
      updateLocal((prev) => {
        const filtered = prev.viewedPropertyIds.filter((id) => id !== propertyId);
        return { ...prev, viewedPropertyIds: [propertyId, ...filtered].slice(0, 20) };
      });
    },
    [updateLocal],
  );

  const saveFilters = useCallback(
    (filters: FilterState) => {
      updateLocal((prev) => ({ ...prev, lastFilters: filters }));
    },
    [updateLocal],
  );

  const saveSearch = useCallback(
    (search: string) => {
      updateLocal((prev) => ({ ...prev, lastSearch: search }));
    },
    [updateLocal],
  );

  return {
    favorites,
    viewedPropertyIds: local.viewedPropertyIds,
    lastFilters: local.lastFilters,
    lastSearch: local.lastSearch,
    updatedAt: local.updatedAt,
    toggleFavorite,
    markViewed,
    saveFilters,
    saveSearch,
  };
}
