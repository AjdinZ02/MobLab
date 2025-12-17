import { fetchProductsQuery } from '../../application/queries/fetchProducts';

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

  (async () => {
    try {
      const products = await fetchProductsQuery();
      all = (products || []).map((p) => {
        const imagePath = ((p as any).imagePath as string | undefined)?.trim();
        // Normaliziraj relativne putanje i izbjegni slučaj bez vodeće kose crte
        let url = `data:image/svg+xml;utf8,${placeholderSvg}`;
        if (imagePath && imagePath.length > 0) {
          const normalized = imagePath.startsWith('http')
            ? imagePath
            : (imagePath.startsWith('/') ? imagePath : `/${imagePath}`);
          url = new URL(normalized, window.location.origin).toString();
        }
        return {
          id: (p as any).id,
          name: (p as any).name ?? 'Proizvod',
          price: Number((p as any).price ?? 0),
          imageUrl: url
        } as ProductVM;
      });
      shown = [...all];
      renderGrid(shown);
    } catch (e) {
      console.error(e);
      grid.innerHTML = '<div class="empty">Greška pri dohvaćanju proizvoda.</div>';
    }
  })();
}


