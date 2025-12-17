
// src/application/commands/user.ts

// Robustno rješenje za API base:
// - koristi VITE_API_BASE_URL ako postoji,
// - inače VITE_API_URL; ako nema /api sufiks, dodaj ga,
// - fallback: "/api" (ako koristiš Vite proxy).
function resolveApiBase(): string {
  const env = (import.meta as any).env || {};
  let base: string = env.VITE_API_BASE_URL || env.VITE_API_URL || "/api";
  // osiguraj da se završava na /api
  if (!base.endsWith("/api")) {
    base = base.replace(/\/+$/, "") + "/api";
  }
  return base;
}

const API: string = resolveApiBase();

// Helper za Authorization header
function authHeaders(): Record<string, string> {
  try {
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

// Ažuriranje profila (FullName/Email)
export async function updateProfile(payload: { fullName?: string; email?: string }) {
  // DEBUG: možeš obrisati nakon testiranja
  // console.log("updateProfile API:", API, "headers:", authHeaders());

  const res = await fetch(`${API}/users/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Greška pri ažuriranju profila.");
    throw new Error(text || "Greška pri ažuriranju profila.");
  }

  return res.json(); // očekuje UserProfileDto
}

// Promjena lozinke
export async function changePassword(payload: { currentPassword: string; newPassword: string }) {
  // DEBUG: možeš obrisati nakon testiranja
  // console.log("changePassword API:", API, "headers:", authHeaders());

  const res = await fetch(`${API}/users/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Greška pri promjeni lozinke.");
    throw new Error(text || "Greška pri promjeni lozinke.");
  }

  // NoContent (204) → uspjeh bez tijela
  return true;
}