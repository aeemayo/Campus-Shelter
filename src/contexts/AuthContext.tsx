import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  type User,
  type LoginPayload,
  type RegisterPayload,
  login as apiLogin,
  register as apiRegister,
  saveAuth,
  clearAuth,
  getSavedUser,
  getSavedToken,
} from "@/services/auth";

// ─── Context shape ───────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage on mount & refresh profile
  useEffect(() => {
    const hydrateAndRefresh = async () => {
      const savedUser = getSavedUser();
      const savedToken = getSavedToken();

      if (savedToken) {
        // Optimistically set saved user
        if (savedUser) setUser(savedUser);
        setToken(savedToken);

        try {
          // Refresh from DB to get latest role/status
          const { user: freshUser } = await import("@/services/auth").then(m => m.fetchProfile());
          setUser(freshUser);
          localStorage.setItem("cs_user", JSON.stringify(freshUser));
        } catch (err: any) {
          console.error("[Auth Profile Refresh Failed]", err);
          // Only clear auth if it's explicitly an unauthorized error (token expired)
          // If it's a 404 (endpoint not found) or network error, keep the saved session
          if (err.status === 401) {
            clearAuth();
            setUser(null);
            setToken(null);
          }
        }
      }
      setIsLoading(false);
    };

    hydrateAndRefresh();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const data = await apiLogin(payload);
    saveAuth(data);
    setUser(data.user);
    setToken(data.token);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const data = await apiRegister(payload);
    saveAuth(data);
    setUser(data.user);
    setToken(data.token);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
