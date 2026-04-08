import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

interface User {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'kuwboo_admin_auth';

function loadPersistedAuth(): Omit<AuthState, 'isLoading'> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.accessToken && parsed.user) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return { user: null, accessToken: null, refreshToken: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const persisted = loadPersistedAuth();
  const [state, setState] = useState<AuthState>({
    ...persisted,
    isLoading: false,
  });

  const login = useCallback(
    (accessToken: string, refreshToken: string, user: User) => {
      const auth = { user, accessToken, refreshToken };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
      setState({ ...auth, isLoading: false });
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
    });
  }, []);

  // Check if token is expired on mount
  useEffect(() => {
    if (state.accessToken) {
      try {
        const payload = JSON.parse(atob(state.accessToken.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          logout();
        }
      } catch {
        logout();
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isAdmin =
    state.user?.role === 'ADMIN' || state.user?.role === 'SUPER_ADMIN';

  return (
    <AuthContext.Provider value={{ ...state, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
