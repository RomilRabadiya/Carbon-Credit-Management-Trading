import React, { createContext, useContext, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { loginSuccess, logout as logoutAction, setLoading } from "@/store/slices/authSlice";
import { supabase } from "@/lib/supabase";
import { User } from "@/types";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check active session on mount
    const checkSession = async () => {
      dispatch(setLoading(true));
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Map Supabase user to our User type
        const user: User = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.name || "User",
          role: session.user.user_metadata.role || "USER",
          organizationId: session.user.user_metadata.organizationId,
        };
        dispatch(loginSuccess({ user, token: session.access_token }));
      } else {
        dispatch(logoutAction());
      }
      dispatch(setLoading(false));
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata.name || "User",
          role: session.user.user_metadata.role || "USER",
          organizationId: session.user.user_metadata.organizationId,
        };
        dispatch(loginSuccess({ user, token: session.access_token }));
      } else {
        dispatch(logoutAction());
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    dispatch(logoutAction());
    window.location.href = "/login";
  }, [dispatch]);

  return {
    ...auth,
    logout,
  };
}
