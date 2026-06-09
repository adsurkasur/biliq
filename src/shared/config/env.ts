export const publicEnv = {
  firebaseApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  firebaseAuthDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  firebaseAppId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  googleDriveRootFolderName:
    process.env.NEXT_PUBLIC_GOOGLE_DRIVE_ROOT_FOLDER_NAME ?? "PhotoBooth Events"
} as const;
