
import { fetchProductsQuery } from '../../application/queries/fetchProducts';
import { apiBaseUrl } from '../../infrastructure/http/client';

const placeholderSvg = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='240'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='#e0e7ff'/>
        <stop offset='100%' stop-color='#f5f3ff'/>
      </linearGradient>
    </defs>
    <rect width='100%' height='100%' fill='url(#g)'/>
    <g fill='#6366f1'>
      <rect x='170' y='40' width='60' height='120' rx='12'/>
      <circle cx='200' cy='170' r='6' fill='#312e81'/>
    </g>
  </svg>`
);

type ProductVM = { id: number; name: string; price: number; imageUrl: string };

function safeNum(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function pick<T extends object, K extends keyof T>(obj: T, keys: K[], fallback?: any) {
  for (const k of keys) {
    const val = (obj as any)[k];
    if (val !== undefined && val !== null) return val;
  }
  return fallback;
}

/** 
 * Normalizuje jedan proizvod iz API responsa u naš VM, 
 * podržava i PascalCase i camelCase ključeve.
 */
function toVM(p: any): ProductVM {
  // ID: ProductID | productID | id
  const id = safeNum(p.ProductID ?? p.productID ?? p.id, NaN);

  // Ime: ModelName | modelName | Name | name
  const name =
    pick(p, ['ModelName', 'modelName', 'Name', 'name'], 'Proizvod') as string;

  // Cijena: Price | price | Cost | cost
  const price = safeNum(p.Price ?? p.price ?? p.Cost ?? p.cost, 0);

  // Slika: ImagePath | imagePath | ImageUrl | imageUrl
  let imagePath = pick(p, ['ImagePath', 'imagePath', 'ImageUrl', 'imageUrl'], '') as string;
  imagePath = (imagePath || '').trim();

  // Ako nema slike, koristi SVG placeholder
  let imageUrl = `data:image/svg+xml;utf8,${placeholderSvg}`;

  if (imagePath) {
    const normalized = imagePath.startsWith('http')
      ? imagePath
      : (imagePath.startsWith('/') ? imagePath : `/${imagePath}`);
    // Slike serviraj sa backend origin-a (ne sa :5173)
    imageUrl = `${apiBaseUrl}${normalized}`;
  }

  return { id, name, price, imageUrl };
}

export function renderProducts(container: HTMLElement) {
  container.innerHTML = `
    <h1 class="page-title">Proizvodi</h1>
    <div class="catalog-layout">
      <aside class="filters">
        <div class="filters-inner">
          <h2>Filteri</h2>
          <div class="filter-group">
            <label>Pretraga</label>
            <input id="q" class="input" placeholder="npr. iPhone" />
          </div>
          <div class="filter-row">
            <div class="filter-group">
              <label>Cijena od</label>
              <input id="min" type="number" class="input" placeholder="0" />
            </div>
            <div class="filter-group">
              <label>Cijena do</label>
              <input id="max" type="number" class="input" placeholder="3000" />
            </div>
          </div>
          <div class="filter-actions">
            <button id="apply" class="btn primary">Primijeni</button>
            <button id="reset" class="btn">Reset</button>
          </div>
        </div>
      </aside>
      <section class="products">
        <div id="grid" class="grid">Učitavam...</div>
      </section>
    </div>
  `;

  const grid = container.querySelector<HTMLDivElement>('#grid')!;
  const inputQ = container.querySelector<HTMLInputElement>('#q')!;
  const inputMin = container.querySelector<HTMLInputElement>('#min')!;
  const inputMax = container.querySelector<HTMLInputElement>('#max')!;
  const btnApply = container.querySelector<HTMLButtonElement>('#apply')!;
  const btnReset = container.querySelector<HTMLButtonElement>('#reset')!;

  let all: ProductVM[] = [];
  let shown: ProductVM[] = [];

  const renderGrid = (items: ProductVM[]) => {
    if (!items.length) {
      grid.innerHTML = '<div class="empty">Nema rezultata.</div>';
      return;
    }
    grid.innerHTML = items
      .map(
        (p) => `
        <article class="card">
          <div class="thumb">
            <img alt="${p.name}" src="${p.imageUrl}"/>
          </div>
          <div class="card-body">
            <div class="card-title">${p.name}</div>
            <div class="price">${(p.price ?? 0).toLocaleString('bs-BA', { style: 'currency', currency: 'BAM' })}</div>
            <button class="btn btn-primary add-to-cart" data-id="${p.id}">Dodaj u korpu</button>
          </div>
        </article>`
      )
      .join('');
  };

  const applyFilters = () => {
    const q = (inputQ.value || '').toLowerCase().trim();
    const min = Number(inputMin.value || '0');
    const max = Number(inputMax.value || Number.MAX_SAFE_INTEGER);
    shown = all.filter((p) => {
      const byQ = !q || p.name.toLowerCase().includes(q);
      const byPrice = (isNaN(min) || p.price >= min) && (isNaN(max) || p.price <= max);
      return byQ && byPrice;
    });
    renderGrid(shown);
  };

  btnApply.addEventListener('click', applyFilters);
  btnReset.addEventListener('click', () => {
    inputQ.value = '';
    inputMin.value = '';
    inputMax.value = '';
    shown = [...all];
    renderGrid(shown);
  });

  // Dodavanje u korpu (robustan ID parsing)
  
container.addEventListener('click', async (e) => {
  const el = e.target as HTMLElement;
  if (!el.classList.contains('add-to-cart')) return;

  // ⬇⬇⬇ Zaštita: ako je dugme već "busy", ne radi ništa
  if (el.getAttribute('data-busy') === '1') {
    return;
  }

  const pidStr = el.getAttribute('data-id') ?? '';
  const pid = Number(pidStr);
  if (!Number.isFinite(pid) || pid <= 0) {
    console.error('[add-to-cart] Neispravan productId', { pidStr });
    alert('Greška: neispravan proizvod.');
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    alert('Prijavi se da bi dodao u korpu.');
    location.hash = '#/login';
    return;
  }

  // ⬇⬇⬇ Označi dugme kao "busy" i onemogući klik
  el.setAttribute('data-busy', '1');
  (el as HTMLButtonElement).disabled = true;
  const originalText = el.textContent;
  el.textContent = 'Dodajem…';

  try {
    const { addToWishlist } = await import('../../infrastructure/http/wishlist'); // lazy import
    await addToWishlist(pid);
    el.textContent = 'Dodano ✓';

    // (opcionalno) osveži korpu nakon dodavanja
    // location.hash = '#/korpa'; // ili pozovi load() na wishlist strani
    setTimeout(() => { el.textContent = originalText ?? 'Dodaj u korpu'; }, 1200);
  } catch (err: any) {
    console.error('[add-to-cart] error', err);
    alert(err?.message ?? 'Greška');
    el.textContent = originalText ?? 'Dodaj u korpu';
  } finally {
    // ⬇⬇⬇ Uvijek skini "busy" i omogući dugme
    el.removeAttribute('data-busy');
    (el as HTMLButtonElement).disabled = false;
  }
});


  (async () => {
    try {
      const products = await fetchProductsQuery();

      // 🔎 (Opcionalno) loguj sample da potvrdiš ključne nazive:
      // console.log('products sample', products?.[0]);

      all = (products || []).map(toVM);
      shown = [...all];
      renderGrid(shown);
    } catch (e) {
      console.error(e);
      grid.innerHTML = '<div class="empty">Greška pri dohvaćanju proizvoda.</div>';
    }
  })();
}
