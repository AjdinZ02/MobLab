
// src/infrastructure/http/client.ts

const API_BASE = (import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');
export const apiBaseUrl = API_BASE;

// Dodaj prefiks baznog URL-a
function withBase(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE) {
    if (import.meta.env.DEV) {
      console.warn('[client] VITE_API_URL nije postavljen; poziv ide relativno:', p);
    }
    return p; // npr. '/api/wishlist' → ide na :5173 (samo ako imaš Vite proxy)
  }
  return `${API_BASE}${p}`; // npr. 'http://localhost:5000/api/wishlist'
}

async function tryText(res: Response) {
  try { return await res.text(); } catch { return ''; }
}

async function maybeJson(res: Response) {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return null;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Centralni request helper:
 * - automatski čita JWT token iz localStorage ('token') i dodaje Authorization: Bearer ...
 * - ostavlja mogućnost da ručno proslijediš authToken u opts (ima prioritet)
 * - uključuje credentials: 'include' (ako backend koristi cookie auth paralelno)
 */
async function request<TResp>(
  method: HttpMethod,
  path: string,
  opts: { body?: any; authToken?: string; headers?: Record<string, string> } = {}
): Promise<TResp> {
  const url = withBase(path);

  // 1) Token iz localStorage (ako postoji)
  const storedToken = (typeof localStorage !== 'undefined' && (localStorage.getItem('token') || localStorage.getItem('auth_token'))) || '';
  const effectiveToken = (opts.authToken && opts.authToken.trim()) || storedToken || '';

  // 2) Headeri
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
    ...(opts.headers ?? {}),
  };
  if (effectiveToken) headers.Authorization = `Bearer ${effectiveToken}`;

  // 3) Fetch
  const res = await fetch(url, {
    method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    credentials: 'omit', 
  });

  // 4) Greške
  if (!res.ok) {
    const text = await tryText(res);
    throw new Error(`${method} ${path} -> HTTP ${res.status}${text ? ` - ${text}` : ''}`);
  }

  // 204 NoContent
  if (res.status === 204) return undefined as TResp;

  const data = await maybeJson(res);
  return data as TResp;
}

// === Public helpers ===
export async function httpGet<T>(path: string): Promise<T> {
  return request<T>('GET', path);
}
export async function httpPost<TResp = unknown>(path: string, body?: any): Promise<TResp> {
  return request<TResp>('POST', path, { body });
}
export async function httpPut<TResp = unknown>(path: string, body: any): Promise<TResp> {
  return request<TResp>('PUT', path, { body });
}
export async function httpPatch<TResp = unknown>(path: string): Promise<TResp> {
  return request<TResp>('PATCH', path);
}



export async function httpDelete<TResp = unknown>(path: string): Promise<TResp> {
  const url = withBase(path);

  // token kao u request()
  const storedToken =
    (typeof localStorage !== 'undefined' &&
      (localStorage.getItem('token') || localStorage.getItem('auth_token'))) || '';

  // ✅ KORISTIMO headers VARIJABLU U FETCH-U
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (storedToken) headers.Authorization = `Bearer ${storedToken}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers,              // ⬅⬅⬅ bitna promjena
    credentials: 'omit',  // JWT-only; nema CORS credential uslova
  });

  // Idempotentno brisanje: toleriraj 204 i 404 kao uspjeh
  if (res.status === 204 || res.status === 404) return undefined as TResp;

  if (!res.ok) {
    const text = await tryText(res);
    throw new Error(`DELETE ${path} -> HTTP ${res.status}${text ? ` - ${text}` : ''}`);
  }

  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json')
    ? (await res.json() as TResp)
    : (undefined as TResp);
}

// Ako ti ipak treba varijanta sa ručnim tokenom, ostavi i “*Auth” helper-e:
export async function httpGetAuth<T>(path: string, authToken?: string): Promise<T> {
  return request<T>('GET', path, { authToken });
}
export async function httpPostAuth<TResp = unknown>(path: string, authToken?: string, body?: any): Promise<TResp> {
  return request<TResp>('POST', path, { authToken, body });
}
export async function httpPutAuth<TResp = unknown>(path: string, body: any, authToken?: string): Promise<TResp> {
  return request<TResp>('PUT', path, { body, authToken });
}
export async function httpPatchAuth<TResp = unknown>(path: string, authToken?: string): Promise<TResp> {
  return request<TResp>('PATCH', path, { authToken });
}
export async function httpDeleteAuth<TResp = unknown>(path: string, authToken?: string): Promise<TResp> {
  return request<TResp>('DELETE', path, { authToken });
}

