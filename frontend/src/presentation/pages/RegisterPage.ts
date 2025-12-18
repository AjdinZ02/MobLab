
export function renderRegister(container: HTMLElement): void {
  container.innerHTML = `
    <div class="auth-page">
      <h2>Registracija</h2>
      <div class="form-group">
        <label>Ime i prezime</label>
        <input id="reg-name" class="input" type="text" placeholder="Ime i prezime" />
      </div>
      <div class="form-group">
        <label>Email</label>
        <input id="reg-email" class="input" type="email" placeholder="Email" />
      </div>
      <div class="form-group">
        <label>Lozinka</label>
        <input id="reg-password" class="input" type="password" placeholder="Lozinka" />
      </div>
      <button class="btn primary" id="register-btn">Registruj se</button>
      <div id="register-status"></div>
    </div>
  `;

  const nameEl = document.getElementById("reg-name") as HTMLInputElement;
  const emailEl = document.getElementById("reg-email") as HTMLInputElement;
  const passEl = document.getElementById("reg-password") as HTMLInputElement;
  const statusEl = document.getElementById("register-status")!;
  const btn = document.getElementById("register-btn") as HTMLButtonElement;

  const API_BASE = import.meta.env.VITE_API_BASE_URL; 

  btn.addEventListener("click", async () => {
    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const password = passEl.value.trim();

    if (!name || !email || !password) {
      statusEl.innerHTML = `<div class="alert error">Popunite sva polja.</div>`;
      return;
    }

    statusEl.innerHTML = `<div class="alert info">Slanje...</div>`;
    btn.disabled = true;

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({ id: data.id, role: data.role }));

      statusEl.innerHTML = `<div class="alert success">Registracija uspješna!</div>`;
      setTimeout(() => (location.hash = "#/proizvodi"), 1000);
    } catch (e: any) {
      const isFailedToFetch = e.message.toLowerCase().includes("failed to fetch");
      statusEl.innerHTML = `<div class="alert error">${
        isFailedToFetch
          ? "Neuspjelo povezivanje s API-jem. Provjeri da je backend pokrenut i CORS podešen."
          : e.message
      }</div>`;
    } finally {
      btn.disabled = false;
    }
  });
}
