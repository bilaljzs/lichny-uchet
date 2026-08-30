const API_BASE = import.meta.env.VITE_API_URL || "/api";
const TOKEN_KEY = "financeTrackerToken";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    throw new Error((data && data.error) || "Ошибка сети");
  }
  return data;
}

export function login(login, password) {
  return request("/auth/login", { method: "POST", body: JSON.stringify({ login, password }) });
}

export function fetchState() {
  return request("/state", { method: "GET" });
}

export function saveState(state) {
  return request("/state", { method: "PUT", body: JSON.stringify(state) });
}

export function fetchRate() {
  return request("/rate", { method: "GET" });
}
