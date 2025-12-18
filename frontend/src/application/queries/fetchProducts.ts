import { httpGet } from '../../infrastructure/http/client';

export interface ProductDto {
  id: number;
  name: string;
  price: number;
  
}

export async function fetchProductsQuery(): Promise<ProductDto[]> {
  return httpGet<ProductDto[]>('/api/Products');
}
