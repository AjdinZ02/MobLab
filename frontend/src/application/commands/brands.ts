import { apiBaseUrl } from '../../infrastructure/http/client';
import type { BrandDto } from '../queries/fetchBrands';

export async function createBrand(data: Omit<BrandDto, 'brandID'>): Promise<BrandDto> {
  const res = await fetch(`${apiBaseUrl}/Brands`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      brandName: data.brandName,
      imageID: data.imageID,
      country: data.country,
      yearFounded: data.yearFounded,
      description: data.description
    })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function updateBrand(id: number, data: Omit<BrandDto, 'brandID'>): Promise<void> {
  const res = await fetch(`${apiBaseUrl}/Brands/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      brandName: data.brandName,
      imageID: data.imageID,
      country: data.country,
      yearFounded: data.yearFounded,
      description: data.description
    })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function deleteBrand(id: number): Promise<void> {
  const res = await fetch(`${apiBaseUrl}/Brands/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);
}


