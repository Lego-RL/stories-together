const BASE_URL = "/api";
import { api } from "./client";

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

  register: async (username, email, password) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || "Registration failed");
    }
    return res.json();
  },

  me: async () => {
    const token = localStorage.getItem("token");

    if (!token) return null;

    try {
      return await api.get("/auth/me");
    } catch (error) {
      if (error?.status === 401) {
        return null;
      }
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
  },
};