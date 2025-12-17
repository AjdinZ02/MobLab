import { apiBaseUrl } from '../../infrastructure/http/client';

export async function createImage(imagePath: string): Promise<{ imageID: number; imagePath: string }> {
  const res = await fetch(`${apiBaseUrl}/Images`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imagePath })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function setBrandLogo(brandID: number, payload: { imageID?: number; imagePath?: string }) {
  const res = await fetch(`${apiBaseUrl}/Brands/${brandID}/logo`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok && res.status !== 204) throw new Error(await res.text());
}

export async function addProductImage(productID: number, payload: { imageID?: number; imagePath?: string; color?: string; storage?: string }) {
  const res = await fetch(`${apiBaseUrl}/Products/${productID}/image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}


