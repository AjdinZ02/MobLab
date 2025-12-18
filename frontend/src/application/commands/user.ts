function resolveApiBase(): string {
  const env = (import.meta as any).env || {};
  let base: string = env.VITE_API_BASE_URL || env.VITE_API_URL || "/api";
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

  return res.json(); 
}

// Promjena lozinke
export async function changePassword(payload: { currentPassword: string; newPassword: string }) {
 

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

  return true;
}