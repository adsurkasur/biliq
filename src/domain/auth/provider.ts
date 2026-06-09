import type { AuthProvider, AuthUser } from "@/domain/auth/types";

const AUTH_NOT_IMPLEMENTED = "Firebase Auth is not implemented yet.";

export const firebaseAuthProviderPlaceholder: AuthProvider = {
  async getCurrentUser(): Promise<AuthUser | null> {
    return null;
  },
  async signInWithGoogle(): Promise<AuthUser> {
    throw new Error(AUTH_NOT_IMPLEMENTED);
  },
  async signOut(): Promise<void> {
    throw new Error(AUTH_NOT_IMPLEMENTED);
  }
};
