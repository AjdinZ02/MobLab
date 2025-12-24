type LoginResponse = {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  token: string;
};


function resolveApiBase(): string {
  const env = (import.meta as any).env || {};
  let base: string = env.VITE_API_BASE_URL || env.VITE_API_URL || "/api";
  if (base.startsWith("/")) return base.replace(/\/+$/, ""); // relativni "/api"
  if (!base.endsWith("/api")) base = base.replace(/\/+$/, "") + "/api";
  return base;
}

const API: string = resolveApiBase();

export function renderLogin(container: HTMLElement) {
  // Očisti
  container.innerHTML = "";

  // Wrapper
  const wrapper = document.createElement("div");
  wrapper.style.maxWidth = "520px";
  wrapper.style.margin = "0 auto";

  // Naslov
  const title = document.createElement("h2");
  title.textContent = "Prijava";

  // Poruke
  const msg = document.createElement("p");
  msg.style.color = "green";
  msg.style.marginTop = "8px";
  msg.style.display = "none";

  const err = document.createElement("p");
  err.style.color = "crimson";
  err.style.marginTop = "8px";
  err.style.display = "none";

  // Forma
  const form = document.createElement("form");

  const labelEmail = document.createElement("label");
  labelEmail.textContent = "Email";
  labelEmail.style.display = "block";
  labelEmail.style.marginTop = "12px";

  const inputEmail = document.createElement("input");
  inputEmail.type = "email";
  inputEmail.placeholder = "email@primjer.com";
  inputEmail.style.width = "100%";
  inputEmail.style.padding = "8px";

  const labelPassword = document.createElement("label");
  labelPassword.textContent = "Lozinka";
  labelPassword.style.display = "block";
  labelPassword.style.marginTop = "12px";

  const inputPassword = document.createElement("input");
  inputPassword.type = "password";
  inputPassword.placeholder = "Unesite lozinku";
  inputPassword.style.width = "100%";
  inputPassword.style.padding = "8px";

  const btn = document.createElement("button");
  btn.type = "submit";
  btn.textContent = "Prijavi se";
  btn.style.marginTop = "16px";
  btn.style.padding = "8px 12px";

  // Link registracija 
  const reg = document.createElement("p");
  reg.style.marginTop = "12px";
  reg.innerHTML = `Nemate račun? <a href="#/register">Registrujte se</a>`;

  // Sastavi formu
  form.appendChild(labelEmail);
  form.appendChild(inputEmail);
  form.appendChild(labelPassword);
  form.appendChild(inputPassword);
  form.appendChild(btn);

  // Ugradi u wrapper
  wrapper.appendChild(title);
  wrapper.appendChild(form);
  wrapper.appendChild(msg);
  wrapper.appendChild(err);
  wrapper.appendChild(reg);

  container.appendChild(wrapper);

  // Helpers
  function clearMessages() {
    msg.style.display = "none";
    err.style.display = "none";
    msg.textContent = "";
    err.textContent = "";
  }
  inputEmail.addEventListener("input", clearMessages);
  inputPassword.addEventListener("input", clearMessages);

  // Submit handler
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessages();

    const email = (inputEmail.value || "").trim().toLowerCase();
    const password = inputPassword.value || "";

    if (!email || !password) {
      err.textContent = "Unesite email i lozinku.";
      err.style.display = "block";
      return;
    }

    btn.disabled = true;
    btn.textContent = "Prijavljivanje...";

    try {
      
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "Neuspješna prijava.");
        throw new Error(text || "Neuspješna prijava.");
      }

      const data = (await res.json()) as LoginResponse;

      
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.userId,
          fullName: data.fullName,
          email: data.email,
          role: data.role,
        })
      );

      msg.textContent = "Uspješna prijava.";
      msg.style.display = "block";

      // Preusmjeri na profil 
      setTimeout(() => {
        location.hash = "#/profile"; 
      }, 300);
    } catch (ex: any) {
      err.textContent = ex?.message ?? "Greška pri prijavi.";
      err.style.display = "block";
    } finally {
      btn.disabled = false;
      btn.textContent = "Prijavi se";
    }
  });
}

