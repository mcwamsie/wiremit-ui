/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_API_RETRY_ATTEMPTS: string
  readonly VITE_API_RETRY_DELAY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}