import { apiBaseUrl } from '../../infrastructure/http/client';

export interface ProductInput {
  modelName: string;
  brandID?: number;
  price?: number;
}

export async function createProduct(data: ProductInput) {
  const res = await fetch(`${apiBaseUrl}/Products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function updateProduct(id: number, data: ProductInput) {
  const res = await fetch(`${apiBaseUrl}/Products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export async function deleteProduct(id: number) {
  const res = await fetch(`${apiBaseUrl}/Products/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
}


