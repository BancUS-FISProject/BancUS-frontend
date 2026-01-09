// Detectamos la URL base de la API de forma segura
let API_BASE = "https://68.221.252.242:10000/v1";

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

// Detectamos URL base para el microservicio de transferencias
let TRANSFERS_API_BASE = "https://68.221.252.242:10000/v1";
if (typeof import.meta !== "undefined" && import.meta.env) {
  if (import.meta.env.VITE_TRANSFERS_API_BASE_URL) {
    TRANSFERS_API_BASE = import.meta.env.VITE_TRANSFERS_API_BASE_URL;
  }
}

// Helper genérico para peticiones
async function apiRequest(path, options = {}) {
  const token = getStoredToken();
  const baseUrl = options.baseUrl || API_BASE;
  const res = await fetch(`${baseUrl}${path}`, {
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
  setStatus: (pan, status) =>
    apiRequest(`/cards/status/${encodeURIComponent(pan)}/${encodeURIComponent(status)}`, {
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

// Endpoints específicos para transferencias
export const transfersApi = {
  // Obtener transferencias enviadas por un usuario
  getSent: (iban) =>
    apiRequest(`/transactions/user/${encodeURIComponent(iban)}/sent`, { baseUrl: TRANSFERS_API_BASE }),

  // Obtener transferencias recibidas por un usuario
  getReceived: (iban) =>
    apiRequest(`/transactions/user/${encodeURIComponent(iban)}/received`, { baseUrl: TRANSFERS_API_BASE }),

  // Obtener TODAS las transferencias de un usuario (enviadas y recibidas)
  getByUser: (iban) =>
    apiRequest(`/transactions/user/${encodeURIComponent(iban)}`, { baseUrl: TRANSFERS_API_BASE }),

  // Revertir una transacción
  revert: (id) =>
    apiRequest(`/transactions/${id}`, {
      method: "PATCH",
      baseUrl: TRANSFERS_API_BASE,
    }),

  // Eliminar una transacción
  delete: (id) =>
    apiRequest(`/transactions/${id}`, {
      method: "DELETE",
      baseUrl: TRANSFERS_API_BASE,
    }),

  // Crea una transferencia (payload: { sender, receiver, quantity })
  create: (data) =>
    apiRequest("/transactions/", {
      method: "POST",
      body: JSON.stringify(data),
      baseUrl: TRANSFERS_API_BASE,
    }),
};

// Endpoints de antifraude
export const antifraudApi = {
  checkTransaction: (data) =>
    apiRequest("/antifraud/fraud-alerts/check", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getAlertsByIban: (iban) =>
    apiRequest(`/antifraud/accounts/${encodeURIComponent(iban)}/fraud-alerts`),

  updateAlert: (id, payload) =>
    apiRequest(`/antifraud/fraud-alerts/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteAlert: (id) =>
    apiRequest(`/antifraud/fraud-alerts/${id}`, {
      method: "DELETE",
    }),
};

// Endpoints de autenticación
export const authApi = {
  login: (email, password, captchaToken) =>
    apiRequest("/user-auth/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, captchaToken }),
    }),
  logout: () =>
    apiRequest("/user-auth/auth/logout", {
      method: "POST",
    }),
  register: ({ email, name, password, phoneNumber }) =>
    apiRequest("/user-auth/users", {
      method: "POST",
      body: JSON.stringify({ email, name, password, phoneNumber }),
    }),
  getUserByIdentifier: (identifier) =>
    apiRequest(`/user-auth/users/${encodeURIComponent(identifier)}`),
  patchUser: (iban, field, value) =>
    apiRequest(`/user-auth/users/${encodeURIComponent(iban)}`, {
      method: "PATCH",
      body: JSON.stringify({ field, value }),
    }),
};

// Endpoints específicos para notificaciones
export const notificationsApi = {
  // Obtener notificaciones del usuario
  getByUser: (iban) =>
    apiRequest(`/notifications/user/${encodeURIComponent(iban)}`),

  // Enviar evento (historial, login, pago, etc.)
  sendEvent: (payload) =>
    apiRequest("/notifications/events", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Borrar una notificación
  deleteById: (id) =>
    apiRequest(`/notifications/${id}`, {
      method: "DELETE",
    }),
};

// Endpoints de salud por microservicio
export const healthApi = {
  accounts: () => apiRequest("/accounts/health"),
  userAuth: () => apiRequest("/user-auth/health"),
  notifications: () => apiRequest("/notifications/health"),
  statements: () => apiRequest("/statements/health"),
  cache: () => apiRequest("/ping/cache"),
};

// Endpoints para Pagos Programados
export const schedulerApi = {
  getUpcomingTransfer: (accountId) => apiRequest(`/scheduled-payments/accounts/${accountId}/upcoming?limit=2`),
  getTransferByAccount: (accountId) => apiRequest(`/scheduled-payments/accounts/${accountId}`),
  postSchedulerTransfer: (payload) =>
    apiRequest("/scheduled-payments/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteSchedulerTransfer: (paymentId) =>
    apiRequest(`/scheduled-payments/${paymentId}`, {
      method: "DELETE",
    }),
};

export { API_BASE, getStoredToken };