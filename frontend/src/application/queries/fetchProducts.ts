import { httpGet } from '../../infrastructure/http/client';

export interface ProductDto {
  id: number;
  name: string;
  price: number;
  // imagePath može postojati u odgovoru, ali nije nužno u DTO-u ovdje
}

export async function fetchProductsQuery(): Promise<ProductDto[]> {
  return httpGet<ProductDto[]>('/api/Products');
}
