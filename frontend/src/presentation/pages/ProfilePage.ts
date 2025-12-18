import { getProfile } from "../../application/queries/user";
import { updateProfile } from "../../application/commands/user";


export async function mountProfilePage(container: HTMLElement): Promise<void> {
  container.innerHTML = "";

  // Wrapper
  const wrapper = document.createElement("div");
  wrapper.style.maxWidth = "520px";
  wrapper.style.margin = "0 auto";

  const title = document.createElement("h2");
  title.textContent = "Moj profil";

  const msg = document.createElement("p");
  msg.style.color = "green";
  msg.style.marginTop = "8px";
  msg.style.display = "none";

  const err = document.createElement("p");
  err.style.color = "crimson";
  err.style.marginTop = "8px";
  err.style.display = "none";

  const loading = document.createElement("div");
  loading.textContent = "Učitavanje...";

  wrapper.appendChild(title);
  wrapper.appendChild(loading);
  wrapper.appendChild(msg);
  wrapper.appendChild(err);
  container.appendChild(wrapper);

  // Podaci profila
  let fullNameValue = "";
  let emailValue = "";

  try {
    const profile = await getProfile();
    fullNameValue = profile.fullName ?? "";
    emailValue = profile.email ?? "";
  } catch (e: any) {
    loading.remove();
    err.textContent = e?.message ?? "Greška pri učitavanju profila.";
    err.style.display = "block";
    return;
  }

  // Kreiranje forme
  const form = document.createElement("form");
  form.style.marginTop = "12px";

  const labelName = document.createElement("label");
  labelName.textContent = "Ime i prezime";
  labelName.style.display = "block";
  labelName.style.marginTop = "12px";

  const inputName = document.createElement("input");
  inputName.name = "fullName";
  inputName.value = fullNameValue;
  inputName.placeholder = "Ime i prezime";
  inputName.style.width = "100%";
  inputName.style.padding = "8px";

  const labelEmail = document.createElement("label");
  labelEmail.textContent = "Email";
  labelEmail.style.display = "block";
  labelEmail.style.marginTop = "12px";

  const inputEmail = document.createElement("input");
  inputEmail.name = "email";
  inputEmail.value = emailValue;
  inputEmail.placeholder = "email@primjer.com";
  inputEmail.style.width = "100%";
  inputEmail.style.padding = "8px";

  const btn = document.createElement("button");
  btn.type = "submit";
  btn.textContent = "Sačuvaj promjene";
  btn.style.marginTop = "16px";
  btn.style.padding = "8px 12px";

  form.appendChild(labelName);
  form.appendChild(inputName);
  form.appendChild(labelEmail);
  form.appendChild(inputEmail);
  form.appendChild(btn);

  // Ukloni loading i prikaži formu
  loading.remove();
  wrapper.appendChild(form);

  function clearMessages() {
    msg.style.display = "none";
    err.style.display = "none";
    msg.textContent = "";
    err.textContent = "";
  }

  inputName.addEventListener("input", clearMessages);
  inputEmail.addEventListener("input", clearMessages);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessages();

    btn.disabled = true;
    btn.textContent = "Spašavanje...";

    try {
      await updateProfile({
        fullName: inputName.value.trim(),
        email: inputEmail.value.trim(),
      });
      msg.textContent = "Profil je uspješno ažuriran.";
      msg.style.display = "block";
    } catch (ex: any) {
      err.textContent = ex?.message ?? "Greška pri ažuriranju profila.";
      err.style.display = "block";
    } finally {
      btn.disabled = false;
      btn.textContent = "Sačuvaj promjene";
    }
  });
}