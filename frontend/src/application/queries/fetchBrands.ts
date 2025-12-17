import { httpGet } from '../../infrastructure/http/client';

export interface BrandDto {
  brandID: number;
  brandName?: string;
  imageID?: number;
  country?: string;
  yearFounded?: number;
  description?: string;
}

export async function fetchBrandsQuery(): Promise<BrandDto[]> {
  return httpGet<BrandDto[]>('/Brands');
}


