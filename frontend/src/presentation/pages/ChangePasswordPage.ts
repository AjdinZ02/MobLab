
// src/presentation/pages/ChangePasswordPage.ts
import { changePassword } from "../../application/commands/user";

/**
 * Renderuje formu za promjenu lozinke unutar zadatog kontejnera (bez Reacta).
 */
export function mountChangePasswordPage(container: HTMLElement) {
  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.style.maxWidth = "520px";
  wrapper.style.margin = "0 auto";

  const title = document.createElement("h2");
  title.textContent = "Promjena lozinke";

  const msg = document.createElement("p");
  msg.style.color = "green";
  msg.style.marginTop = "8px";
  msg.style.display = "none";

  const err = document.createElement("p");
  err.style.color = "crimson";
  err.style.marginTop = "8px";
  err.style.display = "none";

  const form = document.createElement("form");

  const labelCurrent = document.createElement("label");
  labelCurrent.textContent = "Trenutna lozinka";
  labelCurrent.style.display = "block";
  labelCurrent.style.marginTop = "12px";

  const inputCurrent = document.createElement("input");
  inputCurrent.type = "password";
  inputCurrent.placeholder = "Unesite trenutnu lozinku";
  inputCurrent.style.width = "100%";
  inputCurrent.style.padding = "8px";

  const labelNew = document.createElement("label");
  labelNew.textContent = "Nova lozinka (min. 6 karaktera)";
  labelNew.style.display = "block";
  labelNew.style.marginTop = "12px";

  const inputNew = document.createElement("input");
  inputNew.type = "password";
  inputNew.placeholder = "Unesite novu lozinku";
  inputNew.style.width = "100%";
  inputNew.style.padding = "8px";

  const btn = document.createElement("button");
  btn.type = "submit";
  btn.textContent = "Promijeni lozinku";
  btn.style.marginTop = "16px";
  btn.style.padding = "8px 12px";

  form.appendChild(labelCurrent);
  form.appendChild(inputCurrent);
  form.appendChild(labelNew);
  form.appendChild(inputNew);
  form.appendChild(btn);

  wrapper.appendChild(title);
  wrapper.appendChild(form);
  wrapper.appendChild(msg);
  wrapper.appendChild(err);
  container.appendChild(wrapper);

  function clearMessages() {
    msg.style.display = "none";
    err.style.display = "none";
    msg.textContent = "";
    err.textContent = "";
  }

  inputCurrent.addEventListener("input", clearMessages);
  inputNew.addEventListener("input", clearMessages);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessages();

    const currentPassword = inputCurrent.value;
    const newPassword = inputNew.value;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      err.textContent = "Nova lozinka mora imati najmanje 6 znakova.";
      err.style.display = "block";
      return;
    }

    btn.disabled = true;
    btn.textContent = "Spašavanje...";

    try {
      await changePassword({ currentPassword, newPassword });
      msg.textContent = "Lozinka je uspješno promijenjena.";
      msg.style.display = "block";
      inputCurrent.value = "";
      inputNew.value = "";
    } catch (ex: any) {
      err.textContent = ex?.message ?? "Greška pri promjeni lozinke.";
      err.style.display = "block";
    } finally {
      btn.disabled = false;
      btn.textContent = "Promijeni lozinku";
    }
  });
}
