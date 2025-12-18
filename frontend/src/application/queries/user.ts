
export interface UserProfileDto {
  userID: number;
  fullName: string;
  email: string;
  roleName: string;
}

function resolveApiBase(): string {
  const env = (import.meta as any).env || {};
  let base: string = env.VITE_API_BASE_URL || env.VITE_API_URL || "/api";
  if (base.startsWith("/")) return base.replace(/\/+$/, ""); // relativni "/api"
  if (!base.endsWith("/api")) base = base.replace(/\/+$/, "") + "/api";
  return base;
}


const API: string = resolveApiBase();

function authHeaders(): Record<string, string> {
  try {
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export async function getProfile(): Promise<UserProfileDto> {
  const res = await fetch(`${API}/users/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Greška pri učitavanju profila.");
    throw new Error(text || "Greška pri učitavanju profila.");
  }

  const data = (await res.json()) as UserProfileDto;
  return data;
}