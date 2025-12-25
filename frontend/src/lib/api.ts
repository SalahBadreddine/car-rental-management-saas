import { saveTokens, saveUser, logout, getAccessToken } from "./auth";

const BASE_URL = "http://localhost:3000";

let isRefreshing = false;
let failedQueue: Array<{ resolve: Function; reject: Function }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export async function apiRequest(
  endpoint: string,
  method: string = "GET",
  body?: Object,
  customHeaders?: Record<string, string>
) {
  const token = getAccessToken();
  const headers: any = { 
    "Content-Type": "application/json",
    ...customHeaders 
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const makeRequest = async (authToken: string | null) => {
    const requestHeaders = { ...headers };
    if (authToken) {
      requestHeaders["Authorization"] = `Bearer ${authToken}`;
    }

    const res = await fetch(BASE_URL + endpoint, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => null);
    return { status: res.status, data };
  };

  // First attempt
  let response = await makeRequest(token);

  // If 401, try to refresh token
  if (response.status === 401 && token) {
    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const refreshedData = await refreshToken();
        
        if (refreshedData) {
          isRefreshing = false;
          processQueue(null, refreshedData.access_token);
          
          // Retry original request with new token
          return await makeRequest(refreshedData.access_token);
        } else {
          // Refresh failed - logout
          isRefreshing = false;
          processQueue(new Error("Token refresh failed"), null);
          logout();
          window.location.href = "/signin";
          return { status: 401, data: { message: "Session expired. Please log in again." } };
        }
      } catch (error) {
        isRefreshing = false;
        processQueue(error, null);
        logout();
        window.location.href = "/signin";
        return { status: 401, data: { message: "Session expired. Please log in again." } };
      }
    } else {
      // If already refreshing, wait for it to complete
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => makeRequest(token as string))
        .catch((err) => {
          return { status: 401, data: { message: "Session expired. Please log in again." } };
        });
    }
  }

  return response;
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

