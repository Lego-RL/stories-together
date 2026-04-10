import { api } from "./client";

export const adminApi = {
  getUsers: () => api.get("/admin/users"),
  getUserContent: (userId) => api.get(`/admin/users/${userId}`),
  // Future: getStats: () => api.get("/admin/stats")
};