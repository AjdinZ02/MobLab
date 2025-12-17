
export function renderReviewsPage(container: HTMLElement): void {
  container.innerHTML = `
    <div class="reviews-page">
      <div class="reviews-card">
        <div class="reviews-header">
          <h1>Recenzije proizvoda</h1>
          <span class="badge">Beta</span>
        </div>

        <div class="reviews-list" id="reviews-list">Učitavanje recenzija...</div>

        <div class="review-form">
          <h2 style="margin:0 0 14px 0;">Dodaj recenziju</h2>
          <form id="add-review-form">
            <div class="form-row">
              <div class="form-group">
                <label class="label" for="productName">Naziv proizvoda</label>
                <input class="input" id="productName" type="text" placeholder="npr. iPhone 15 Pro" required />
              </div>
              <div class="form-group">
                <label class="label" for="userName">Vaše ime</label>
                <input class="input" id="userName" type="text" placeholder="npr. Ajdin" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="label">Ocjena</label>
                <div class="stars" id="rating-stars" aria-label="Ocjena">
                  ${[1,2,3,4,5].map(i => `<span class="star" data-value="${i}">★</span>`).join('')}
                </div>
                <input id="rating" type="hidden" value="5" />
              </div>
              <div class="form-group">
                <label class="label" for="comment">Vaša recenzija</label>
                <textarea class="textarea" id="comment" placeholder="Podijelite vaše iskustvo..." required></textarea>
              </div>
            </div>

            <div class="btn-row">
              <button class="btn" type="button" id="clear-btn">Očisti</button>
              <button class="btn primary" type="submit" id="submit-btn">Dodaj recenziju</button>
            </div>

            <div id="form-status"></div>
          </form>
        </div>
      </div>
    </div>
  `;

  // --- interakcija za zvjezdice ---
  const stars = Array.from(document.querySelectorAll<HTMLSpanElement>('#rating-stars .star'));
  const ratingInput = document.getElementById('rating') as HTMLInputElement;
  const setActive = (n: number) => {
    stars.forEach(s => s.classList.toggle('active', Number(s.dataset.value) <= n));
    ratingInput.value = String(n);
  };
  stars.forEach(s => {
    s.addEventListener('click', () => setActive(Number(s.dataset.value)));
    s.addEventListener('mouseenter', () => setActive(Number(s.dataset.value)));
  });
  setActive(5); // default

  // --- load & refresh list ---
  refreshReviewsList();

  // --- submit ---
  const form = document.getElementById('add-review-form') as HTMLFormElement;
  const status = document.getElementById('form-status')!;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const productName = (document.getElementById('productName') as HTMLInputElement).value.trim();
    const userName    = (document.getElementById('userName') as HTMLInputElement).value.trim();
    const rating      = Number((document.getElementById('rating') as HTMLInputElement).value);
    const comment     = (document.getElementById('comment') as HTMLTextAreaElement).value.trim();

    if (!productName || !userName || !comment || rating < 1 || rating > 5) {
      status.innerHTML = `<div class="alert error">Molimo popunite sva polja i odaberite ocjenu (1–5).</div>`;
      return;
    }

    const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Spremanje...';

    try {
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, userName, rating, comment })
      });
      if (!response.ok) throw new Error(String(response.status));
      status.innerHTML = `<div class="alert success">Recenzija uspješno dodana!</div>`;
      form.reset();
      setActive(5);
      await refreshReviewsList();
    } catch (err) {
      console.error(err);
      status.innerHTML = `<div class="alert error">Greška pri dodavanju recenzije. Pokušajte ponovo.</div>`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Dodaj recenziju';
    }
  });

  // --- clear ---
  const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;
  clearBtn.addEventListener('click', () => {
    form.reset();
    setActive(5);
    status.innerHTML = '';
    (document.getElementById('productName') as HTMLInputElement).focus();
  });
}

async function refreshReviewsList() {
  const listEl = document.getElementById('reviews-list')!;
  listEl.innerHTML = `<div class="review-meta">Učitavanje recenzija...</div>`;
  try {
    const res = await fetch('http://localhost:5000/api/reviews');
    if (!res.ok) throw new Error(String(res.status));
    const reviews = await res.json();
    if (!reviews?.length) {
      listEl.innerHTML = `<div class="review-meta">Nema dostupnih recenzija.</div>`;
      return;
    }
    listEl.innerHTML = reviews.map((r: any) => `
      <div class="review-item">
        <div>
          <div class="review-title">${escapeHtml(r.productName)} — ${escapeHtml(r.userName)}</div>
          <div class="review-meta">Ocjena: ${r.rating}/5</div>
          <div style="margin-top:6px;">${escapeHtml(r.comment)}</div>
        </div>
        <div aria-hidden="true">${renderStars(r.rating)}</div>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
    listEl.innerHTML = `<div class="alert error">Greška pri učitavanju recenzija.</div>`;
  }
}
function renderStars(n: number) { return [1,2,3,4,5].map(i => `<span class="star ${i<=n?'active':''}">★</span>`).join(''); }
function escapeHtml(str: string) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                    .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}
