export interface AuthUser {
  id: string;
  email: string | null;
  displayName: string | null;
  photoUrl?: string | null;
}

export interface AuthProvider {
  getCurrentUser(): Promise<AuthUser | null>;
  signInWithGoogle(): Promise<AuthUser>;
  signOut(): Promise<void>;
}
