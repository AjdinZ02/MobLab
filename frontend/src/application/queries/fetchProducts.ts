

import { httpGet } from '../../infrastructure/http/client';

export async function fetchProductsQuery(): Promise<any[]> {
  return httpGet<any[]>('/api/Products');
}


