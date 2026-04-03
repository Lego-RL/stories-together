const BASE_URL = "/api";

export const authApi = {
  login: async (username, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username, password }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || "Login failed");
    }
    return res.json();
  },

  me: async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch user");
    return res.json();
  },

  logout: () => localStorage.removeItem("token"),
};