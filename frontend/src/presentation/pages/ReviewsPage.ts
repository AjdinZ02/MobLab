
// ReviewsPage.ts
// Kompletna stranica sa listom recenzija, dodavanjem i uređivanjem putem modala (samo zvjezdice)
// + Ikonica kantice za brisanje (Admin ili vlasnik)
// + Korištenje API_BASE iz .env (zaobilazi Vite proxy i rješava 405 na 5173)

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export function renderReviewsPage(container: HTMLElement): void {
  container.innerHTML = `
    <div class="reviews-page">
      <div class="reviews-card">
        <div class="reviews-header">
          <h1>Recenzije proizvoda</h1>
          <span class="badge">Beta</span>
        </div>

        <div style="padding: 14px 20px; border-bottom: 1px solid #e5e7eb;">
          <label for="filter-rating" style="margin-right:8px;">Filtriraj po ocjeni:</label>
          <select id="filter-rating" class="select">
            <option value="all">Sve</option>
            <option value="5">5</option>
            <option value="4">4</option>
            <option value="3">3</option>
            <option value="2">2</option>
            <option value="1">1</option>
          </select>
        </div>

        <div class="reviews-list" id="reviews-list">Učitavanje recenzija...</div>
        <div id="pagination" style="padding: 10px 20px; display:flex; gap:8px; justify-content:center;"></div>

        <div class="review-form">
          <h2 style="margin:0 0 14px 0;">Dodaj recenziju</h2>
          <form id="add-review-form" novalidate>
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
                <div class="stars" id="rating-stars">
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
            <div id="form-status" aria-live="polite"></div>
          </form>
        </div>
      </div>
    </div>
  `;

  // ===== Inicijalizacija zvjezdica za ADD formu =====
  const stars = Array.from(document.querySelectorAll<HTMLSpanElement>('#rating-stars .star'));
  const ratingInput = document.getElementById('rating') as HTMLInputElement;
  const setActive = (n: number) => {
    stars.forEach(s => s.classList.toggle('active', Number(s.dataset.value) <= n));
    ratingInput.value = String(n);
  };
  stars.forEach(s => s.addEventListener('click', () => setActive(Number(s.dataset.value))));
  setActive(5);

  // Očisti formu (opciono)
  const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement | null;
  clearBtn?.addEventListener('click', () => {
    (document.getElementById('productName') as HTMLInputElement).value = '';
    (document.getElementById('userName') as HTMLInputElement).value = '';
    (document.getElementById('comment') as HTMLTextAreaElement).value = '';
    setActive(5);
    (document.getElementById('form-status') as HTMLElement).innerHTML = '';
  });

  let allReviews: any[] = [];
  let currentPage = 1;
  const perPage = 5;

  async function loadReviews() {
    const res = await fetch(`${API_BASE}/api/reviews`);
    allReviews = await res.json();
    renderReviews();
  }

  // ===== JWT decode helper + normalizacija korisnika =====
  function decodeJwtPayload(token?: string | null): Record<string, any> | null {
    try {
      if (!token) return null;
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(base64);
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  function getCurrentUser() {
    const userJson = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    const raw = userJson ? JSON.parse(userJson) : null;
    const roleFromUser = raw?.roleName || raw?.role || null;

    const payload = decodeJwtPayload(token);
    const idFromToken =
      payload?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
      payload?.sub || null;

    const roleFromToken =
      payload?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      payload?.role || null;

    const fullNameFromToken = payload?.fullName || null;
    const emailFromToken    = payload?.email || raw?.email || null;

    return (idFromToken || roleFromUser || roleFromToken || fullNameFromToken || emailFromToken)
      ? {
          id: idFromToken ? Number(idFromToken) : null,
          role: (roleFromUser ?? roleFromToken) ?? null,
          email: emailFromToken ?? null,
          fullName: fullNameFromToken ?? null
        }
      : null;
  }

  // Tolerantno poređenje imena (radi i "Ajdin" vs "Ajdin Zahirović")
  function likelySamePerson(userFullName?: string | null, reviewUserName?: string | null) {
    const norm = (s?: string | null) => (s ?? '').trim().toLowerCase();
    const a = norm(userFullName);
    const b = norm(reviewUserName);
    if (!a || !b) return false;
    if (a === b) return true;
    const aFirst = a.split(/\s+/)[0]; // "ajdin"
    return aFirst === b || a.includes(b) || b.includes(aFirst);
  }

  function renderReviews() {
    const filterValue = (document.getElementById('filter-rating') as HTMLSelectElement).value;
    let filtered = allReviews;
    if (filterValue !== 'all') {
      filtered = allReviews.filter(r => r.rating == Number(filterValue));
    }

    const start = (currentPage - 1) * perPage;
    const paginated = filtered.slice(start, start + perPage);

    const listEl = document.getElementById('reviews-list')!;
    const user = getCurrentUser();

    if (!paginated.length) {
      listEl.innerHTML = `<div class="review-meta">Nema recenzija za odabrani filter.</div>`;
    } else {
      listEl.innerHTML = paginated.map(r => {
        const canEdit = !!user && (
          user.role === "Admin" ||
          (user.id != null && user.id === r.userID) ||
          (r.userID == null && likelySamePerson(user.fullName, r.userName))
        );
        const canDelete = canEdit; // ista pravila za brisanje
        return `
          <div class="review-item">
            <div>
              <div class="review-title">${escapeHtml(r.productName)} — ${escapeHtml(r.userName)}</div>
              <div class="review-meta">Ocjena: ${r.rating}/5</div>
              <div style="margin-top:6px;">${escapeHtml(r.comment)}</div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              ${renderStars(r.rating)}
              ${canEdit ? `<button class="btn small edit-btn" data-id="${r.reviewID}">Uredi</button>` : ""}
              ${canDelete ? `<button class="icon-btn delete-btn" title="Obriši" aria-label="Obriši recenziju" data-id="${r.reviewID}">🗑️</button>` : ""}
            </div>
          </div>
        `;
      }).join('');
    }

    listEl.querySelectorAll<HTMLButtonElement>(".edit-btn").forEach(btn => {
      btn.addEventListener("click", () => openEditModal(Number(btn.dataset.id)));
    });

    listEl.querySelectorAll<HTMLButtonElement>(".delete-btn").forEach(btn => {
      btn.addEventListener("click", () => openDeleteConfirm(Number(btn.dataset.id)));
    });

    renderPagination(filtered.length);
  }

  function renderPagination(total: number) {
    const pages = Math.ceil(total / perPage);
    const paginationEl = document.getElementById('pagination')!;
    paginationEl.innerHTML = '';
    for (let i = 1; i <= pages; i++) {
      const btn = document.createElement('button');
      btn.textContent = String(i);
      btn.className = 'btn' + (i === currentPage ? ' primary' : '');
      btn.addEventListener('click', () => {
        currentPage = i;
        renderReviews();
      });
      paginationEl.appendChild(btn);
    }
  }

  document.getElementById('filter-rating')!.addEventListener('change', () => {
    currentPage = 1;
    renderReviews();
  });

  const form = document.getElementById('add-review-form') as HTMLFormElement;
  const status = document.getElementById('form-status')!;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const productName = (document.getElementById('productName') as HTMLInputElement).value.trim();
    const userName = (document.getElementById('userName') as HTMLInputElement).value.trim();
    const rating = Number(ratingInput.value);
    const comment = (document.getElementById('comment') as HTMLTextAreaElement).value.trim();

    if (!productName || !userName || !comment) {
      status.innerHTML = `<div class="alert error">Popunite sva polja.</div>`;
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ productName, userName, rating, comment })
      });
      status.innerHTML = `<div class="alert success">Recenzija dodana!</div>`;
      form.reset();
      setActive(5);
      await loadReviews();
    } catch {
      status.innerHTML = `<div class="alert error">Greška pri dodavanju.</div>`;
    }
  });

  // ===== Modal za UREĐIVANJE — SAMO ZVJEZDICE =====
  function openEditModal(reviewId: number) {
    const review = allReviews.find(r => r.reviewID === reviewId);
    if (!review) return;

    // Overlay
    const modal = document.createElement("div");
    modal.className = "modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Uredi recenziju");

    // Sadržaj modala (samo zvjezdice)
    modal.innerHTML = `
      <div class="modal-content" tabindex="-1">
        <h3 style="margin-top:0">Uredi recenziju</h3>

        <label>Ocjena</label>
        <div class="stars" id="edit-rating-stars">
          ${[1,2,3,4,5].map(i => `<span class="star" data-value="${i}">★</span>`).join('')}
        </div>
        <input type="hidden" id="edit-rating" value="${review.rating}" />

        <label style="margin-top:8px">Komentar</label>
        <textarea class="textarea" id="edit-comment">${escapeHtml(review.comment)}</textarea>

        <div class="actions">
          <button class="btn" id="cancel-edit">Otkaži</button>
          <button class="btn primary" id="save-edit">Sačuvaj</button>
        </div>
        <div id="edit-status" aria-live="polite"></div>
      </div>
    `;

    // U DOM + zaključaj scroll
    document.body.appendChild(modal);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const content = modal.querySelector(".modal-content") as HTMLElement;
    const statusEl = modal.querySelector("#edit-status") as HTMLElement;

    // Zvjezdice u modalu
    const mStars = Array.from(content.querySelectorAll<HTMLSpanElement>("#edit-rating-stars .star"));
    const ratingHidden = content.querySelector("#edit-rating") as HTMLInputElement;
    const setModalActive = (n: number) => {
      mStars.forEach(s => s.classList.toggle("active", Number(s.dataset.value) <= n));
      ratingHidden.value = String(n);
    };
    mStars.forEach(s => s.addEventListener("click", () => setModalActive(Number(s.dataset.value))));
    setModalActive(review.rating);

    // Zatvaranje (centralizovano)
    const close = () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      modal.remove();
    };

    // Klik na backdrop zatvara
    modal.addEventListener("mousedown", (e) => {
      if (e.target === modal) close();
    });

    // ESC zatvara
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);

    // Minimalni focus-trap
    const focusable = Array.from(
      content.querySelectorAll<HTMLElement>(
        'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
      )
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    content.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key !== "Tab" || focusable.length === 0) return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    });
    (first ?? content).focus();

    // Handleri dugmadi
    content.querySelector("#cancel-edit")!.addEventListener("click", close);

    content.querySelector("#save-edit")!.addEventListener("click", async () => {
      const rating = Number(ratingHidden.value);
      const comment = (content.querySelector("#edit-comment") as HTMLTextAreaElement).value.trim();

      if (!comment || rating < 1 || rating > 5) {
        statusEl.innerHTML = `<div class="alert error">Provjerite podatke.</div>`;
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        statusEl.innerHTML = `<div class="alert error">Morate biti prijavljeni da uredite recenziju.</div>`;
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/reviews/${reviewId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ rating, comment })
        });

        if (!res.ok) {
          const text = await res.text();
          let friendly = text || "Greška pri ažuriranju.";
          if (res.status === 401) friendly = "Sesija je istekla ili niste prijavljeni (401).";
          if (res.status === 403) friendly = "Nemate dozvolu da uredite ovu recenziju (403).";
          if (res.status === 404) friendly = "Recenzija nije pronađena (404).";
          if (res.status === 400) friendly = `Nevažeći podaci (400). ${text || ""}`;
          throw new Error(friendly);
        }

        statusEl.innerHTML = `<div class="alert success">Uspješno ažurirano!</div>`;
        await loadReviews();
        setTimeout(close, 800);
      } catch (e: any) {
        statusEl.innerHTML = `<div class="alert error">${e?.message ?? "Greška."}</div>`;
      }
    });
  }

  // ===== Brisanje recenzije (Admin ili vlasnik) =====
  function openDeleteConfirm(reviewId: number) {
    const ok = confirm("Da li ste sigurni da želite obrisati ovu recenziju?");
    if (!ok) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Morate biti prijavljeni.");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/reviews/${reviewId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) {
          const text = await res.text();
          let friendly = text || "Greška pri brisanju.";
          if (res.status === 401) friendly = "Sesija je istekla ili niste prijavljeni (401).";
          if (res.status === 403) friendly = "Nemate dozvolu da obrišete ovu recenziju (403).";
          if (res.status === 404) friendly = "Recenzija nije pronađena (404).";
          throw new Error(friendly);
        }
        await loadReviews();
      } catch (e: any) {
        alert(e?.message ?? "Greška pri brisanju.");
      }
    })();
  }

  loadReviews();
}

// ===== Helpers =====
function renderStars(n: number) {
  return [1,2,3,4,5].map(i => `<span class="star ${i<=n?'active':''}">★</span>`).join('');
}

/** Sigurno enkodira tekst (koristi se pri innerHTML-u). */
function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}