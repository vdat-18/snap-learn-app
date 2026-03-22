/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/info" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  /** Backend base URL used by the Vite dev proxy (e.g. http://localhost:8000) */
  readonly VITE_BACKEND_URL: string;
  /** Override the API base URL in the browser — defaults to '/api' (via proxy) */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
