// src/api.js

// Detectamos la URL base de la API de forma segura
let API_BASE = "http://localhost:10000/v1";

// Vite: variables tipo import.meta.env.VITE_*
if (typeof import.meta !== "undefined" && import.meta.env) {
  if (import.meta.env.VITE_API_BASE_URL) {
    API_BASE = import.meta.env.VITE_API_BASE_URL;
  }
  // CRA u otros entornos que definan process.env (por si acaso)
} else if (typeof process !== "undefined" && process.env) {
  if (process.env.REACT_APP_API_BASE_URL) {
    API_BASE = process.env.REACT_APP_API_BASE_URL;
  }
}

let authToken = null;

function getStoredToken() {
  if (!authToken && typeof localStorage !== "undefined") {
    authToken = localStorage.getItem("authToken");
  }
  return authToken;
}

export function setAuthToken(token) {
  authToken = token;
  if (typeof localStorage !== "undefined") {
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }
}

// Helper genérico para peticiones
async function apiRequest(path, options = {}) {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      data?.message || data?.error || res.statusText || "Error en la API";
    const error = new Error(
      Array.isArray(message) ? message.join(", ") : message
    );
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Endpoints específicos para tarjetas
export const cardsApi = {
  // Lista todas las tarjetas
  getAll: () => apiRequest("/cards"),

  // Lista tarjetas por titular
  getByHolder: (name) =>
    apiRequest(`/cards/holder/${encodeURIComponent(name)}`),

  // Crea tarjeta
  create: (cardholderName) =>
    apiRequest("/cards", {
      method: "POST",
      body: JSON.stringify({ cardholderName }),
    }),

  // Actualiza una tarjeta por id
  updateById: (id, payload) =>
    apiRequest(`/cards/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  // Cambia el estado de una tarjeta (active - frozen)
  setStatus: (id, status) =>
    apiRequest(`/cards/status/${id}/${status}`, {
      method: "PUT",
    }),

  // Borra tarjeta por id
  deleteById: (id) =>
    apiRequest(`/cards/${id}`, {
      method: "DELETE",
    }),
};

// Endpoints específicos para cuentas
export const accountsApi = {
  // Obtener todas las cuentas (paginado)
  getAll: (page = 1, limit = 10) =>
    apiRequest(`/accounts/?page=${page}&limit=${limit}`),

  // Obtener cuenta por IBAN
  getByIban: (iban) => apiRequest(`/accounts/${encodeURIComponent(iban)}`),

  // Crear cuenta (FastAPI requiere trailing slash)
  create: (data) =>
    apiRequest("/accounts/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Actualizar cuenta (name, email, subscription)
  update: (iban, payload) =>
    apiRequest(`/accounts/${encodeURIComponent(iban)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  // Borrar cuenta
  delete: (iban) =>
    apiRequest(`/accounts/${encodeURIComponent(iban)}`, {
      method: "DELETE",
    }),

  // Bloquear cuenta
  block: (iban) =>
    apiRequest(`/accounts/${encodeURIComponent(iban)}/block`, {
      method: "PATCH",
    }),

  // Desbloquear cuenta
  unblock: (iban) =>
    apiRequest(`/accounts/${encodeURIComponent(iban)}/unblock`, {
      method: "PATCH",
    }),

  // Actualizar balance (operación)
  updateBalance: (iban, balance, currency = "EUR") =>
    apiRequest(`/accounts/operation/${encodeURIComponent(iban)}/${currency}`, {
      method: "PATCH",
      body: JSON.stringify({ balance }),
    }),

  // Crear tarjeta para cuenta
  createCard: (iban) =>
    apiRequest(`/accounts/card/${encodeURIComponent(iban)}`, {
      method: "POST",
    }),

  // Eliminar tarjeta de cuenta
  deleteCard: (iban, pan) =>
    apiRequest(`/accounts/card/${encodeURIComponent(iban)}`, {
      method: "DELETE",
      body: JSON.stringify({ PAN: pan }),
    }),
};

// Endpoints de autenticación
export const authApi = {
  login: (email, password) =>
    apiRequest("/user-auth/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: ({ email, name, password, phoneNumber }) =>
    apiRequest("/user-auth/users", {
      method: "POST",
      body: JSON.stringify({ email, name, password, phoneNumber }),
    }),
};

// Endpoints de salud por microservicio
export const healthApi = {
  accounts: () => apiRequest("/accounts/health"),
  userAuth: () => apiRequest("/user-auth/health"),
  cache: () => apiRequest("/ping/cache"),
};

export { API_BASE, getStoredToken };
