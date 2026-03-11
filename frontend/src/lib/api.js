const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function buildHeaders(extra = {}) {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function request(path, options = {}, retried = false) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options.headers),
  });

  const raw = await response.text();
  let payload = {};
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    payload = {};
  }

  if (!response.ok) {
    const canFallbackHospitalRoute = !retried && response.status === 404 && path.startsWith("/api/hospitals/");
    if (canFallbackHospitalRoute) {
      return request(path.replace("/api/hospitals/", "/hospital/"), options, true);
    }

    throw new Error(payload.message || `Request failed (${response.status})`);
  }

  return payload;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body || {}) }),
  delete: (path) => request(path, { method: "DELETE" }),
};
