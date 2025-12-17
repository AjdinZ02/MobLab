
// src/infrastructure/http/client.ts
export const apiBaseUrl = ''; // koristi proxy → relativne rute (npr. '/api/Products')

export async function httpGet<T>(path: string): Promise<T> {
  if (!path.startsWith('/')) path = '/' + path;
  const res = await fetch(path, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    const text = await tryText(res);
    throw new Error(`GET ${path} -> HTTP ${res.status}${text ? ` - ${text}` : ''}`);
  }
  return (await res.json()) as T;
}

export async function httpPost<TBody, TResp = unknown>(path: string, body: TBody): Promise<TResp> {
  if (!path.startsWith('/')) path = '/' + path;
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await tryText(res);
    throw new Error(`POST ${path} -> HTTP ${res.status}${text ? ` - ${text}` : ''}`);
  }
  return (await maybeJson(res)) as TResp;
}

export async function httpPut<TBody, TResp = unknown>(path: string, body: TBody, authToken?: string): Promise<TResp> {
  if (!path.startsWith('/')) path = '/' + path;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(path, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await tryText(res);
    throw new Error(`PUT ${path} -> HTTP ${res.status}${text ? ` - ${text}` : ''}`);
  }
  return (await maybeJson(res)) as TResp;
}

async function tryText(res: Response) {
  try { return await res.text(); } catch { return ''; }
}

async function maybeJson(res: Response) {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return null;
}