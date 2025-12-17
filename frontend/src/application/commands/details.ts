import { apiBaseUrl } from '../../infrastructure/http/client';

export interface DetailsInput { display?: string; battery?: string; camera?: string; color?: string; storage?: string; }

export async function upsertProductDetails(productId: number, data: DetailsInput) {
  const res = await fetch(`${apiBaseUrl}/ProductDetails/product/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}


