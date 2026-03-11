import { apiRequest } from "../config/api";

export const api = {
  get: (path, options = {}) => apiRequest(path, options),
  post: (path, body, options = {}) =>
    apiRequest(path, { ...options, method: "POST", body: JSON.stringify(body) }),
  patch: (path, body, options = {}) =>
    apiRequest(path, { ...options, method: "PATCH", body: JSON.stringify(body || {}) }),
  delete: (path, options = {}) => apiRequest(path, { ...options, method: "DELETE" }),
};
