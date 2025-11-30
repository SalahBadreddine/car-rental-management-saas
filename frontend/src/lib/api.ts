import { saveTokens, saveUser } from "./auth";

const BASE_URL = "http://localhost:3000";

export async function apiRequest(
  endpoint: string,
  method: string = "GET",
  body?: Object,
  token?: string
) {
  const headers: any = { "Content-Type": "application/json" };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(BASE_URL + endpoint, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  return { status: res.status, data };
}

export async function refreshToken() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return null;

  const res = await fetch(BASE_URL + "/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refresh }),
  });

  if (res.status !== 200) return null;

  const data = await res.json();
  saveTokens(data.access_token, data.refresh_token);
  saveUser(data.user);

  return data;
}
