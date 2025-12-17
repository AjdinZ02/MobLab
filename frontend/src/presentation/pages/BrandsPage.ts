import { fetchBrandsQuery, BrandDto } from '../../application/queries/fetchBrands';
import { createBrand, updateBrand, deleteBrand } from '../../application/commands/brands';
import { setBrandLogo } from '../../application/commands/images';

export function renderBrands(container: HTMLElement) {
  container.innerHTML = `
    <h1 class="page-title">Brendovi</h1>
    <div class="catalog-layout">
      <aside class="filters">
        <div class="filters-inner">
          <h2>Dodaj / Uredi brend</h2>
          <form id="brandForm" class="brand-form">
            <input type="hidden" id="brandID" />
            <div class="filter-group">
              <label>Naziv</label>
              <input id="brandName" class="input" placeholder="npr. Apple" required />
            </div>
            <div class="filter-group">
              <label>Država</label>
              <input id="country" class="input" placeholder="npr. USA" />
            </div>
            <div class="filter-row">
              <div class="filter-group">
                <label>Godina osnivanja</label>
                <input id="yearFounded" type="number" class="input" placeholder="1976" />
              </div>
              <div class="filter-group">
                <label>ID slike</label>
                <input id="imageID" type="number" class="input" placeholder="(opcionalno)" />
              </div>
            </div>
            <div class="filter-group">
              <label>Opis</label>
              <input id="description" class="input" placeholder="Kratki opis" />
            </div>
            <div class="filter-actions">
              <button type="submit" class="btn primary" id="saveBtn">Spremi</button>
              <button type="button" class="btn" id="resetBtn">Očisti</button>
            </div>
          </form>

          <hr style="margin:16px 0;border:none;border-top:1px solid #e5e7eb;" />

          <h2>Logo brenda</h2>
          <form id="logoForm" class="brand-form">
            <div class="filter-group"><label>Brend</label><select id="logoBrandID" class="input"></select></div>
            <div class="filter-group"><label>Putanja do slike</label><input id="logoPath" class="input" placeholder="/assets/brand-logo.png" /></div>
            <div class="filter-actions"><button type="submit" class="btn">Postavi logo</button></div>
            <div id="logoStatus" class="status" aria-live="polite"></div>
          </form>
        </div>
      </aside>
      <section class="products">
        <div id="brandsList" class="grid">Učitavam...</div>
      </section>
    </div>
  `;

  const list = container.querySelector<HTMLDivElement>('#brandsList')!;
  const form = container.querySelector<HTMLFormElement>('#brandForm')!;
  const brandID = container.querySelector<HTMLInputElement>('#brandID')!;
  const brandName = container.querySelector<HTMLInputElement>('#brandName')!;
  const country = container.querySelector<HTMLInputElement>('#country')!;
  const yearFounded = container.querySelector<HTMLInputElement>('#yearFounded')!;
  const imageID = container.querySelector<HTMLInputElement>('#imageID')!;
  const description = container.querySelector<HTMLInputElement>('#description')!;
  const resetBtn = container.querySelector<HTMLButtonElement>('#resetBtn')!;

  // logo form
  const logoForm = container.querySelector<HTMLFormElement>('#logoForm')!;
  const logoBrandID = container.querySelector<HTMLSelectElement>('#logoBrandID')!;
  const logoPath = container.querySelector<HTMLInputElement>('#logoPath')!;
  const logoStatus = container.querySelector<HTMLDivElement>('#logoStatus')!;

  const renderList = (items: BrandDto[]) => {
    if (!items.length) { list.innerHTML = '<div class="empty">Nema brendova.</div>'; return; }
    list.innerHTML = items.map(b => `
      <article class="card">
        <div class="card-body">
          <div class="card-title">${b.brandName ?? 'Brend'} </div>
          <div style="color:#6b7280; font-size: 13px;">${b.country ?? ''} ${b.yearFounded ? '• ' + b.yearFounded : ''}</div>
          <div style="margin-top:10px; display:flex; gap:8px;">
            <button class="btn" data-edit="${b.brandID}">Uredi</button>
            <button class="btn" data-delete="${b.brandID}">Obriši</button>
          </div>
        </div>
      </article>
    `).join('');

    list.querySelectorAll<HTMLButtonElement>('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-edit'));
        const b = items.find(x => x.brandID === id);
        if (!b) return;
        brandID.value = String(b.brandID);
        brandName.value = b.brandName ?? '';
        country.value = b.country ?? '';
        yearFounded.value = b.yearFounded?.toString() ?? '';
        imageID.value = b.imageID?.toString() ?? '';
        description.value = b.description ?? '';
      });
    });

    list.querySelectorAll<HTMLButtonElement>('[data-delete]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = Number(btn.getAttribute('data-delete'));
        if (!confirm('Obriši brend?')) return;
        try {
          await deleteBrand(id);
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
      brandName: brandName.value.trim(),
      country: country.value.trim() || undefined,
      yearFounded: yearFounded.value ? Number(yearFounded.value) : undefined,
      imageID: imageID.value ? Number(imageID.value) : undefined,
      description: description.value.trim() || undefined
    };
    try {
      if (brandID.value) {
        await updateBrand(Number(brandID.value), payload);
      } else {
        await createBrand(payload);
      }
      brandID.value = '';
      form.reset();
      await load();
    } catch (e) {
      alert('Spremanje nije uspjelo.');
      console.error(e);
    }
  });

  resetBtn.addEventListener('click', () => { brandID.value = ''; form.reset(); });

  logoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await setBrandLogo(Number(logoBrandID.value), { imagePath: logoPath.value });
      logoStatus.textContent = 'Logo postavljen.'; logoStatus.className='status success';
      logoPath.value = '';
    } catch (err) {
      logoStatus.textContent = 'Greška pri postavljanju loga.'; logoStatus.className='status error';
      console.error(err);
    }
  });

  async function load() {
    list.innerHTML = 'Učitavam...';
    try {
      const data = await fetchBrandsQuery();
      renderList(data);
      // popuni dropdown brendova za logo form
      logoBrandID.innerHTML = data.map(b => `<option value="${b.brandID}">${b.brandName ?? 'Brand'} (ID ${b.brandID})</option>`).join('');
    } catch (e) {
      list.innerHTML = '<div class="empty">Greška pri dohvaćanju brendova.</div>';
      console.error(e);
    }
  }

  load();
}


