import { fetchProductsQuery } from '../../application/queries/fetchProducts';
import { createProduct, updateProduct, deleteProduct } from '../../application/commands/products';
import { upsertProductDetails } from '../../application/commands/details';
import { addProductImage } from '../../application/commands/images';

export function renderProductsAdmin(container: HTMLElement) {
  container.innerHTML = `
    <h1 class="page-title">Proizvodi (Admin)</h1>
    <div class="catalog-layout">
      <aside class="filters">
        <div class="filters-inner">
          <h2>Dodaj / Uredi proizvod</h2>
          <form id="prodForm" class="brand-form">
            <input type="hidden" id="productID" />
            <div class="filter-group">
              <label>Naziv modela</label>
              <input id="modelName" class="input" placeholder="npr. iPhone 15 Pro" required />
            </div>
            <div class="filter-row">
              <div class="filter-group">
                <label>ID brenda</label>
                <input id="brandID" type="number" class="input" placeholder="(opcionalno)" />
              </div>
              <div class="filter-group">
                <label>Cijena (KM)</label>
                <input id="price" type="number" step="0.01" class="input" placeholder="0" />
              </div>
            </div>
            <div class="filter-actions">
              <button type="submit" class="btn primary" id="saveBtn">Spremi</button>
              <button type="button" class="btn" id="resetBtn">Očisti</button>
            </div>
            <div id="status" class="status" aria-live="polite"></div>
          </form>

          <hr style="margin:16px 0;border:none;border-top:1px solid #e5e7eb;" />

          <h2>Tehničke specifikacije</h2>
          <form id="specForm" class="brand-form">
            <div class="filter-group"><label>Ekran</label><input id="dsp" class="input" placeholder='npr. 6.7" OLED' /></div>
            <div class="filter-group"><label>Baterija</label><input id="bat" class="input" placeholder='npr. 3200 mAh' /></div>
            <div class="filter-group"><label>Kamera</label><input id="cam" class="input" placeholder='npr. 48 MP' /></div>
            <div class="filter-row">
              <div class="filter-group"><label>Boja</label><input id="specColor" class="input" placeholder="npr. Black" /></div>
              <div class="filter-group"><label>Memorija</label><input id="specMemorija" class="input" placeholder="npr. 256 GB" /></div>
            </div>
            <div class="filter-actions"><button type="submit" class="btn">Spremi specifikacije</button></div>
            <div id="specStatus" class="status" aria-live="polite"></div>
          </form>

          <hr style="margin:16px 0;border:none;border-top:1px solid #e5e7eb;" />

          <h2>Slika proizvoda</h2>
          <form id="pimgForm" class="brand-form">
            <div class="filter-group"><label>Putanja do slike</label><input id="pimgSlika" class="input" placeholder="/assets/prod.png" /></div>
            <div class="filter-actions"><button type="submit" class="btn">Dodaj sliku</button></div>
            <div id="pimgStatus" class="status" aria-live="polite"></div>
          </form>
        </div>
      </aside>
      <section class="products">
        <div id="list" class="grid">Učitavam...</div>
      </section>
    </div>
  `;

  const list = container.querySelector<HTMLDivElement>('#list')!;
  const form = container.querySelector<HTMLFormElement>('#prodForm')!;
  const productID = container.querySelector<HTMLInputElement>('#productID')!;
  const modelName = container.querySelector<HTMLInputElement>('#modelName')!;
  const brandID = container.querySelector<HTMLInputElement>('#brandID')!;
  const price = container.querySelector<HTMLInputElement>('#price')!;
  const resetBtn = container.querySelector<HTMLButtonElement>('#resetBtn')!;
  const status = container.querySelector<HTMLDivElement>('#status')!;

  // spec form
  const specForm = container.querySelector<HTMLFormElement>('#specForm')!;
  const dsp = container.querySelector<HTMLInputElement>('#dsp')!;
  const bat = container.querySelector<HTMLInputElement>('#bat')!;
  const cam = container.querySelector<HTMLInputElement>('#cam')!;
  const specColor = container.querySelector<HTMLInputElement>('#specColor')!;
  const specMemorija = container.querySelector<HTMLInputElement>('#specMemorija')!;
  const specStatus = container.querySelector<HTMLDivElement>('#specStatus')!;

  // product image form
  const pimgForm = container.querySelector<HTMLFormElement>('#pimgForm')!;
  const pimgSlika = container.querySelector<HTMLInputElement>('#pimgSlika')!;
  const pimgStatus = container.querySelector<HTMLDivElement>('#pimgStatus')!;

  const renderList = (items: any[]) => {
    if (!items.length) { list.innerHTML = '<div class="empty">Nema proizvoda.</div>'; return; }
    list.innerHTML = items.map(p => `
      <article class="card">
        <div class="card-body">
          <div class="card-title">${p.name ?? 'Proizvod'}</div>
          <div style="color:#6b7280; font-size: 13px;">BrandID: ${p.brandID ?? '-'} • ${(p.price ?? 0).toLocaleString('bs-BA',{style:'currency',currency:'BAM'})}</div>
          <div style="margin-top:10px; display:flex; gap:8px;">
            <button class="btn" data-edit="${p.id}">Uredi</button>
            <button class="btn" data-delete="${p.id}">Obriši</button>
          </div>
        </div>
      </article>
    `).join('');

    list.querySelectorAll<HTMLButtonElement>('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-edit'));
        const p = items.find(x => x.id === id);
        if (!p) return;
        productID.value = String(p.id);
        modelName.value = p.name ?? '';
        brandID.value = p.brandID?.toString() ?? '';
        price.value = p.price?.toString() ?? '';
      });
    });

    list.querySelectorAll<HTMLButtonElement>('[data-delete]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.getAttribute('data-delete'));
        if (!confirm('Obriši proizvod?')) return;
        try {
          await deleteProduct(id);
          await load();
        } catch (e) {
          alert('Brisanje nije uspjelo (moguće FK veze).');
          console.error(e);
        }
      });
    });
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      modelName: modelName.value.trim(),
      brandID: brandID.value ? Number(brandID.value) : undefined,
      price: price.value ? Number(price.value) : undefined
    };
    try {
      if (productID.value) {
        await updateProduct(Number(productID.value), payload);
      } else {
        await createProduct(payload);
      }
      productID.value = '';
      form.reset();
      status.textContent = 'Spremljeno.';
      status.className = 'status success';
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Greška pri spremanju.';
      status.textContent = msg;
      status.className = 'status error';
      console.error(e);
    }
  });

  resetBtn.addEventListener('click', () => { productID.value=''; form.reset(); });

  specForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!productID.value) { specStatus.textContent = 'Odaberite proizvod (kliknite Uredi)'; specStatus.className='status error'; return; }
    try {
      await upsertProductDetails(Number(productID.value), { 
        display: dsp.value, 
        battery: bat.value, 
        camera: cam.value,
        color: specColor.value,
        storage: specMemorija.value
      });
      specStatus.textContent = 'Specifikacije spremljene.'; specStatus.className='status success';
    } catch (err) {
      specStatus.textContent = 'Greška pri spremanju specifikacija.'; specStatus.className='status error';
      console.error(err);
    }
  });

  pimgForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!productID.value) { pimgStatus.textContent='Odaberite proizvod (kliknite Uredi)'; pimgStatus.className='status error'; return; }
    try {
      await addProductImage(Number(productID.value), { 
        imagePath: pimgSlika.value, 
        color: specColor.value || undefined, 
        storage: specMemorija.value || undefined 
      });
      pimgStatus.textContent = 'Slika dodana.'; pimgStatus.className='status success';
    } catch (err) {
      pimgStatus.textContent = 'Greška pri dodavanju slike.'; pimgStatus.className='status error';
      console.error(err);
    }
  });

  async function load() {
    list.innerHTML = 'Učitavam...';
    try {
      const data = await fetchProductsQuery();
      renderList(data);
    } catch (e) {
      list.innerHTML = '<div class="empty">Greška pri dohvaćanju proizvoda.</div>';
      console.error(e);
    }
  }

  load();
}


