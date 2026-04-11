const BASE_URL = "/api"; // Vite proxy rewrites this to http://localhost:8000

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
    const refreshToken = localStorage.getItem("refresh_token");

    if (refreshToken) {
      try {
        
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken })
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          
          localStorage.setItem("token", data.access_token);
          
          // save new refresh token
          if (data.refresh_token) {
            localStorage.setItem("refresh_token", data.refresh_token);
          }
          
          return request(path, options, true);
        } else {
          // if backend rejects the refresh token, clear session immediately
          localStorage.clear();
          window.location.href = "/login";
          return Promise.reject(new Error("Session expired"));
        }
      } catch (err) {
        // clear session if refresh fails (network error)
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      }
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
};