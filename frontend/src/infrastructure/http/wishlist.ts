
import { httpGet, httpPost, httpDelete } from './client';

export type WishlistItemDto = {
  WishlistID: number;
  ProductID: number;
  ModelName: string;
  Price?: number | null;
  ImagePath?: string | null;
  DateAdded?: string | null;
};

const delItemInFlight = new Set<number>();

export function getMyWishlist(): Promise<WishlistItemDto[]> {
  return httpGet<WishlistItemDto[]>('/api/wishlist');
}

export function addToWishlist(productId: number | string): Promise<void> {
  const id = Number(productId);
  if (!Number.isFinite(id) || id <= 0) throw new Error('Neispravan productId.');
  return httpPost<void>(`/api/wishlist/${id}`);
}

export async function removeWishlistItem(wishlistId: number): Promise<void> {
  if (!Number.isFinite(wishlistId)) return;
  if (delItemInFlight.has(wishlistId)) return; // spriječi dvostruki DELETE
  delItemInFlight.add(wishlistId);
  try {
    await httpDelete<void>(`/api/wishlist/${wishlistId}`);
  } finally {
    delItemInFlight.delete(wishlistId);
  }
}

export function clearWishlist(): Promise<void> {
  return httpDelete<void>('/api/wishlist');
}
