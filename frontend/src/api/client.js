const BASE_URL = "/api"; // Vite proxy rewrites this to http://localhost:8000
export const AUTH_REFRESH_EVENT = "auth:refreshed";

let refreshPromise = null;

function clearSessionAndRedirect() {
  localStorage.clear();
  window.location.href = "/login";
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) {
    throw new Error("Session expired");
  }

  const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!refreshRes.ok) {
    throw new Error("Session expired");
  }

  const data = await refreshRes.json();
  localStorage.setItem("token", data.access_token);

  // Keep refresh token in sync if backend returns a rotated token.
  if (data.refresh_token) {
    localStorage.setItem("refresh_token", data.refresh_token);
  }

  window.dispatchEvent(new CustomEvent(AUTH_REFRESH_EVENT));
}

/**
 * request wrapper to handle automated token refresh on 401 errors.
 */
async function request(path, options = {}, isRetry = false) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // try to refresh token
  if (res.status === 401 && !isRetry) {
    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      await refreshPromise;
      return request(path, options, true);
    } catch (err) {
      clearSessionAndRedirect();
      return Promise.reject(err);
    }
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const err = new Error(errorBody.detail || "Request failed");
    err.status = res.status;
    err.body = errorBody;
    throw err;
  }

  return res.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { 
    method: "POST", 
    body: JSON.stringify(body) 
  }),
  put: (path, body) => request(path, { 
    method: "PUT", 
    body: JSON.stringify(body) 
  }),
  delete: (path) => request(path, { method: "DELETE" }),
};