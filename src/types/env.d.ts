namespace NodeJS {
  interface ProcessEnv extends NodeJS.ProcessEnv {
    NEXT_PUBLIC_FIREBASE_APIKEY: string
    GITHUB_ID: string
    GITHUB_SECRET: string
  }
}