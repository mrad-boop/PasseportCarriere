// API Configuration — Passeport Carrière
export const API_URL = "https://pc-backend-rr9v.onrender.com";

const getToken = () => localStorage.getItem("pc_token");

const headers = (withAuth = false) => ({
  "Content-Type": "application/json",
  ...(withAuth && getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

export const api = {
  // Auth
  register: (data) =>
    fetch(`${API_URL}/api/auth/register`, { method: "POST", headers: headers(), body: JSON.stringify(data) }).then(r => r.json()),

  login: (data) =>
    fetch(`${API_URL}/api/auth/login`, { method: "POST", headers: headers(), body: JSON.stringify(data) }).then(r => r.json()),

  me: () =>
    fetch(`${API_URL}/api/auth/me`, { headers: headers(true) }).then(r => r.json()),

  // Series
  getSeries: () =>
    fetch(`${API_URL}/api/series`, { headers: headers(true) }).then(r => r.json()),

  getSerie: (id) =>
    fetch(`${API_URL}/api/series/${id}`, { headers: headers(true) }).then(r => r.json()),

  createSerie: (data) =>
    fetch(`${API_URL}/api/series`, { method: "POST", headers: headers(true), body: JSON.stringify(data) }).then(r => r.json()),

  deleteSerie: (id) =>
    fetch(`${API_URL}/api/series/${id}`, { method: "DELETE", headers: headers(true) }).then(r => r.json()),

  // Attempts
  getAttempts: () =>
    fetch(`${API_URL}/api/attempts`, { headers: headers(true) }).then(r => r.json()),

  saveAttempt: (data) =>
    fetch(`${API_URL}/api/attempts`, { method: "POST", headers: headers(true), body: JSON.stringify(data) }).then(r => r.json()),

  // Users (admin)
  getUsers: () =>
    fetch(`${API_URL}/api/users`, { headers: headers(true) }).then(r => r.json()),

  updateUser: (id, data) =>
    fetch(`${API_URL}/api/users/${id}`, { method: "PUT", headers: headers(true), body: JSON.stringify(data) }).then(r => r.json()),

  updateMe: (data) =>
    fetch(`${API_URL}/api/users/me`, { method: "PUT", headers: headers(true), body: JSON.stringify(data) }).then(r => r.json()),

  deleteUser: (id) =>
    fetch(`${API_URL}/api/users/${id}`, { method: "DELETE", headers: headers(true) }).then(r => r.json()),

  // Packs & Config
  getPacks: () =>
    fetch(`${API_URL}/api/packs`, { headers: headers() }).then(r => r.json()),

  updatePack: (id, data) =>
    fetch(`${API_URL}/api/packs/${id}`, { method: "PUT", headers: headers(true), body: JSON.stringify(data) }).then(r => r.json()),

  getConfig: () =>
    fetch(`${API_URL}/api/packs/config`, { headers: headers() }).then(r => r.json()),

  updateConfig: (data) =>
    fetch(`${API_URL}/api/packs/config`, { method: "PUT", headers: headers(true), body: JSON.stringify(data) }).then(r => r.json()),
};
