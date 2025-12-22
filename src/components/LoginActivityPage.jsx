import React, { useEffect, useState } from "react";
import { authApi } from "../api";
import "./LoginActivityPage.css";

const AVATAR_PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" fill="none"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%2316a34a"/><stop offset="100%" stop-color="%2322c55e"/></linearGradient></defs><rect width="200" height="200" rx="24" fill="url(%23g)"/><circle cx="100" cy="78" r="36" fill="white" fill-opacity="0.9"/><path d="M40 170c4-34 32-56 60-56s56 22 60 56" stroke="white" stroke-width="12" stroke-linecap="round" stroke-opacity="0.9"/></svg>';

function LoginActivityPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    plan: "basic",
    password: "",
  });

  const getInitials = (text) => {
    if (!text) return "B";
    const initials = text
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
    return initials || (text[0] || "B").toUpperCase();
  };

  useEffect(() => {
    const storedInfo = (() => {
      if (typeof localStorage === "undefined") return null;
      try {
        const raw = localStorage.getItem("authUser");
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    })();

    const identifier = storedInfo?.iban || storedInfo?.email;
    if (!identifier) {
      setError("No se encontró usuario autenticado para consultar el perfil.");
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await authApi.getUserByIdentifier(identifier);
        setUser(data);
        setForm({
          name: data.name || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          plan: data.plan || "basic",
          password: "",
        });
      } catch (err) {
        setError(
          err?.message || "No se pudo cargar el perfil. Inténtalo de nuevo."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

    const displayUser = user || {};
  const initials = getInitials(displayUser.name || displayUser.email || "B");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!displayUser.iban) {
      setError("No se pudo identificar la cuenta para actualizar.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");

    const changes = [];
    if (form.name && form.name !== displayUser.name) {
      changes.push({ field: "name", value: form.name });
    }
    if (form.email && form.email !== displayUser.email) {
      changes.push({ field: "email", value: form.email });
    }
    if (form.phoneNumber && form.phoneNumber !== displayUser.phoneNumber) {
      changes.push({ field: "phoneNumber", value: form.phoneNumber });
    }
    if (form.plan && form.plan !== displayUser.plan) {
      changes.push({ field: "plan", value: form.plan });
    }
    if (form.password) {
      changes.push({ field: "passwordHash", value: form.password });
    }

    if (changes.length === 0) {
      setSaving(false);
      setSuccess("No hay cambios pendientes.");
      return;
    }

    try {
      await Promise.all(
        changes.map((change) =>
          authApi.patchUser(displayUser.iban, change.field, change.value)
        )
      );
      const refreshed = await authApi.getUserByIdentifier(
        displayUser.iban || displayUser.email
      );
      setUser(refreshed);
      if (typeof localStorage !== "undefined") {
        try {
          localStorage.setItem("authUser", JSON.stringify(refreshed));
        } catch {
          // ignore
        }
      }
      setForm((prev) => ({
        ...prev,
        name: refreshed.name || "",
        email: refreshed.email || "",
        phoneNumber: refreshed.phoneNumber || "",
        plan: refreshed.plan || "basic",
        password: "",
      }));
      setSuccess("Datos actualizados correctamente.");
    } catch (err) {
      setError(err?.message || "No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div>
          <h1>Perfil de usuario</h1>
        </div>
      </div>

      {loading && (
        <div className="profile-card skeleton">Cargando información…</div>
      )}

      {error && !loading && <div className="error-banner">{error}</div>}

      {!loading && !error && (
        <>
          <div className="profile-card">
            <div className="profile-avatar">
              <div className="avatar-circle avatar-circle--lg">{initials}</div>
            </div>
            <div className="profile-main">
              <p className="profile-name">
                {displayUser.name || "Usuario sin nombre"}
              </p>
              <p className="profile-email">{displayUser.email}</p>
              <p className="profile-iban">
                IBAN: {displayUser.iban || "No asignado"}
              </p>
            </div>
          </div>

          <div className="profile-grid">
            <div className="profile-tile">
              <p className="label">Teléfono</p>
              <p>{displayUser.phoneNumber || "No disponible"}</p>
            </div>
            <div className="profile-tile">
              <p className="label">Plan</p>
              <p>{displayUser.plan || "basic"}</p>
            </div>
          </div>

          <div className="profile-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowForm((prev) => !prev)}
            >
              {showForm ? "Cerrar edición" : "Cambiar información"}
            </button>
          </div>

          {showForm && (
            <form className="profile-form" onSubmit={handleUpdate}>
              <div className="form-grid">
                <label>
                  <span className="label">Nombre completo</span>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    required
                  />
                </label>
                <label>
                  <span className="label">Email</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="tucorreo@example.com"
                    required
                  />
                </label>
                <label>
                  <span className="label">Teléfono</span>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    placeholder="+34123456789"
                    required
                  />
                </label>
                <label>
                  <span className="label">Plan</span>
                  <select
                    name="plan"
                    value={form.plan}
                    onChange={handleChange}
                    required
                  >
                    <option value="basic">basic</option>
                    <option value="premium">premium</option>
                    <option value="business">business</option>
                  </select>
                </label>
                <label>
                  <span className="label">Nueva contraseña</span>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Dejar en blanco para no cambiar"
                  />
                </label>
              </div>

              {success && <p className="success-banner">{success}</p>}
              {error && <p className="error-banner">{error}</p>}

              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}

export default LoginActivityPage;
