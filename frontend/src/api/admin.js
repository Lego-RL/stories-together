import { api } from "./client";

export const adminApi = {
  getUsers: () => api.get("/admin/users"),
  getUserContent: (userId) => api.get(`/admin/users/${userId}`),
  getStats: () => api.get("/admin/stats"),
  updateUserActive: (userId, active) => api.put(`/admin/users/${userId}/active`, { active }),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  deleteStory: (storyId) => api.delete(`/admin/stories/${storyId}`),
  deletePassage: (passageId) => api.delete(`/admin/passages/${passageId}`),
};