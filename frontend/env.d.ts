
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;        // ako ga već koristiš negdje drugdje
  readonly VITE_API_BASE_URL: string;   // bazni URL API-ja (koristi se u fetch pozivima)
  // dodaj ovdje ostale VITE_ varijable ako ih imaš
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}