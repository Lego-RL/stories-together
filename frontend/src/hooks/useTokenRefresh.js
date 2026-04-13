import { useEffect } from "react";
import { AUTH_REFRESH_EVENT, refreshAccessToken } from "../api/client";

const REFRESH_BUFFER_MS = 60 * 1000;

function getTokenExpiryMs(token) {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp || typeof payload.exp !== "number") return null;

    return payload.exp * 1000;
  } catch {
    return null;
  }
}

export function useProactiveTokenRefresh() {
  useEffect(() => {
    let refreshTimerId = null;

    const scheduleRefresh = () => {
      if (refreshTimerId) {
        window.clearTimeout(refreshTimerId);
        refreshTimerId = null;
      }

      const token = localStorage.getItem("token");
      if (!token) return;

      const expiryMs = getTokenExpiryMs(token);
      if (!expiryMs) return;

      const delayMs = Math.max(expiryMs - Date.now() - REFRESH_BUFFER_MS, 0);

      refreshTimerId = window.setTimeout(async () => {
        try {
          await refreshAccessToken();
        } catch {
          // If proactive refresh fails, the session is no longer valid.
          localStorage.clear();
          window.location.href = "/login";
        }
      }, delayMs);
    };

    const handleAuthRefresh = () => {
      scheduleRefresh();
    };

    scheduleRefresh();
    window.addEventListener(AUTH_REFRESH_EVENT, handleAuthRefresh);

    return () => {
      window.removeEventListener(AUTH_REFRESH_EVENT, handleAuthRefresh);
      if (refreshTimerId) {
        window.clearTimeout(refreshTimerId);
      }
    };
  }, []);
}
