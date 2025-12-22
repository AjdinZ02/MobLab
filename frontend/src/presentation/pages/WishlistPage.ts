
import { getMyWishlist, removeWishlistItem, clearWishlist, WishlistItemDto } from '../../infrastructure/http/wishlist';



function price(n?: number | null) {
  const v = typeof n === 'number' ? n : 0;
  try { return new Intl.NumberFormat('bs-BA', { style: 'currency', currency: 'BAM' }).format(v); }
  catch { return `${v.toFixed(2)} BAM`; }
}

function escapeHtml(s: string | null | undefined) {
  const str = s ?? '';
  return str.replace(/[&<>"']/g, c => (
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'} as Record<string,string>)[c]
  ));
}

function renderTable(items: any[]): string {
  if (!items.length) return `<p class="muted">Korpa je prazna.</p>`;

  // 🔧 Fallback za oba stilova naziva polja (PascalCase i camelCase)
  const rows = items.map((it: any, idx: number) => {
    const wid = Number(it.WishlistID ?? it.wishlistID ?? it.id ?? idx + 1);
    const name = (it.ModelName ?? it.modelName ?? it.ProductName ?? it.productName ?? 'Proizvod') as string;
    const priceVal = Number(it.Price ?? it.price ?? it.UnitPrice ?? it.unitPrice ?? 0);

    return {
      wid,
      name,
      priceVal,
    };
  });

  const total = rows.reduce((sum, r) => sum + (Number.isFinite(r.priceVal) ? r.priceVal : 0), 0);

  return `
    <div class="toolbar">
      <div></div>
      <div class="filters">
        <button id="clear-cart" class="btn btn-outline">Isprazni</button>
        <button id="go-checkout" class="btn btn-primary">Poruči</button>
      </div>
    </div>
    <table class="table">
      <thead><tr>
        <th>#</th><th>Proizvod</th><th>Cijena</th><th>Akcija</th>
      </tr></thead>
      <tbody>
        ${rows.map((r, idx) => `
          <tr data-wid="${r.wid}">
            <td data-label="#">${idx + 1}</td>
            <td data-label="Proizvod">${escapeHtml(r.name)}</td>
            <td data-label="Cijena">${price(r.priceVal)}</td>
            <td data-label="Akcija">
              <button class="btn btn-outline rm-item">Ukloni</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
      <tfoot>
        <tr>
          <th colspan="2" style="text-align:right;">Ukupno:</th>
          <th>${price(total)}</th>
          <th></th>
        </tr>
      </tfoot>
    </table>
  `;
}


export function renderWishlistPage(container: HTMLElement): void {
  const token = localStorage.getItem('token');
  if (!token) {
    container.innerHTML = `<p>Morate biti prijavljeni da biste vidjeli korpu.</p>`;
    return;
  }

  container.innerHTML = `
    <section class="container support-page">
      <div class="toolbar">
        <h1>Korpa</h1>
        <div class="filters">
          <span class="muted">Klik na proizvod dodaje u korpu. Ovdje možeš uklanjati i nastaviti na narudžbu.</span>
        </div>
      </div>
      <div class="panel">
        <div id="cart-wrap"><p class="muted">Učitavanje...</p></div>
      </div>
    </section>
  `;

  const wrap = container.querySelector('#cart-wrap') as HTMLElement;
  let orderInFlight = false;

  async function load() {
    wrap.innerHTML = `<p class="muted">Učitavanje...</p>`;
    try {
      const items = await getMyWishlist();
      wrap.innerHTML = renderTable(items);
    } catch (err: any) {
      wrap.innerHTML = `<p class="error">Greška: ${err?.message ?? 'nepoznato'}</p>`;
    }
  }

  // delegacija za dugmad
  container.addEventListener('click', async (e) => {
    const el = e.target as HTMLElement;
    if (el.id === 'clear-cart') {
      try { await clearWishlist(); await load(); } catch (err: any) { alert(err?.message ?? 'Greška'); }
    } else if (el.classList.contains('rm-item')) {
      const tr = el.closest('tr');
      const wid = tr?.getAttribute('data-wid');
      if (!wid) return;
      try { await removeWishlistItem(Number(wid)); tr?.remove(); } catch (err: any) { alert(err?.message ?? 'Greška'); }
    } else if (el.id === 'go-checkout') {
      if (orderInFlight) return;
      orderInFlight = true;
      const btn = el as HTMLButtonElement;
      const prev = btn.textContent;
      btn.disabled = true; btn.textContent = 'Kreiram…';}
  });

  load();
}
