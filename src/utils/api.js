const API_BASE_URL = (typeof window !== 'undefined' && window.RYVON_API_BASE_URL) || '/api';
const DIRECT_BACKEND_URL = 'http://localhost:3000/api';

export const AUTH_USER_KEY = 'ryvon-auth-user';
export const AUTH_TOKEN_KEY = 'ryvon-auth-token';

export const getAuthToken = () => {
  try {
    return sessionStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(AUTH_TOKEN_KEY);
  } catch (e) {
    return null;
  }
};

export const saveAuthToken = (token, rememberMe = true) => {
  if (!token) return;
  if (rememberMe) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
  } else {
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
};

export const clearAuthStorage = () => {
  try {
    localStorage.removeItem(AUTH_USER_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (e) {}
};

export const api = {
  async request(endpoint, options = {}) {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let res;
    let url = `${API_BASE_URL}${endpoint}`;

    try {
      res = await fetch(url, { ...options, headers });
    } catch (networkErr) {
      // If relative /api failed (e.g. proxy unavailable), try direct backend port 3000
      if (!API_BASE_URL.includes(':3000')) {
        try {
          res = await fetch(`${DIRECT_BACKEND_URL}${endpoint}`, { ...options, headers });
        } catch (directErr) {
          const err = new Error('Unable to connect to RYVON backend server. Please verify backend is running on port 3000.');
          err.isNetworkError = true;
          throw err;
        }
      } else {
        const err = new Error('Unable to connect to RYVON backend server. Please verify backend is running on port 3000.');
        err.isNetworkError = true;
        throw err;
      }
    }

    let json = null;
    try {
      const text = await res.text();
      json = JSON.parse(text);
    } catch (e) {
      json = null;
    }

    // Check if proxy returned backend offline or bad gateway
    const isProxyDown = json?.error?.code === 'BACKEND_OFFLINE' || (!res.ok && (res.status === 502 || res.status === 503 || res.status === 504));
    if (isProxyDown) {
      // Try direct backend connection as fallback
      if (!url.includes(':3000')) {
        try {
          const directRes = await fetch(`${DIRECT_BACKEND_URL}${endpoint}`, { ...options, headers });
          if (directRes.ok) {
            const directJson = await directRes.json().catch(() => null);
            return directJson?.data !== undefined ? directJson.data : directJson;
          }
        } catch (e) {
          // Direct also failed
        }
      }
      const err = new Error(json?.error?.message || 'Unable to connect to the backend server. Please verify the backend is running.');
      err.isNetworkError = true;
      err.status = res.status;
      throw err;
    }

    if (!res.ok) {
      let message = json?.error?.message || json?.error?.code;
      if (!message) {
        if (res.status === 500) {
          message = 'Server encountered an unexpected error. Please try again.';
        } else if (res.status === 503) {
          message = 'Database service is temporarily unavailable. Please try again shortly.';
        } else {
          message = `Request failed (${res.status})`;
        }
      }
      const err = new Error(message);
      err.status = res.status;
      err.code = json?.error?.code;
      err.details = json?.error?.details;
      throw err;
    }

    return json?.data !== undefined ? json.data : json;
  },
  get(endpoint, options) { return this.request(endpoint, { ...options, method: 'GET' }); },
  post(endpoint, body, options) { return this.request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }); },
  patch(endpoint, body, options) { return this.request(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }); }
};

export default api;
