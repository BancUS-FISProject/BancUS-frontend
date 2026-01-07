import React, { useEffect, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { accountsApi, authApi, transfersApi } from "../api";
import ScrollSection from "./ScrollSection";
import "../OverviewPage.css";
import { useNavigate } from "react-router-dom";
import OverviewPaymentsPage from "./PaymentsPage/OverviewPaymentPage";
import { notificationsApi } from "../api";

const PLANS = [
  {
    id: "basico",
    name: "Plan Básico",
    price: "0 € / mes",
    description: "Para probar la banca online sin compromiso.",
    features: [
      "Cuenta de pruebas",
      "1 tarjeta virtual",
      "Hasta 5 transacciones al mes",
      "Notificaciones sobre las transacciones en tiempo real",
      "Posibilidad de un pago programado configurado"
    ],
    highlight: false,
  },
  {
    id: "premium",
    name: "Plan Premium",
    price: "4,99 € / mes",
    description: "Uso habitual con varias tarjetas y más límites.",
    features: [
      "Hasta 5 tarjetas virtuales",
      "Notificaciones de transacciones, accesos y pagos programados en tiempo real",
      "Condiciones específicas para universitarios",
      "Hasta 10 pagos programados posibles"
    ],
    highlight: true,
  },
  {
    id: "pro",
    name: "Plan Pro",
    price: "9,99 € / mes",
    description: "Ideal para proyectos de desarrollo e integración con APIs.",
    features: [
      "Tarjetas virtuales ilimitadas",
      "Transacciones ilimitadas",
      "Notificaciones de transacciones, accesos, pagos programados e historial en tiempo real",
      "Acceso avanzado a la API",
      "Pagos programados ilimitados"
    ],
    highlight: false,
  },
];


function OverviewPage({ isLoggedIn, onLogin, onLogout }) {
  const navigate = useNavigate();
  const siteKey = import.meta.env?.VITE_RECAPTCHA_SITE_KEY || "";
  const recaptchaRef = useRef(null);
  const [mode, setMode] = useState("login"); // login | register
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    captchaToken: "",
  });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    captchaToken: "",
    subscription: "basico"
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(() => {
    if (typeof localStorage === "undefined") return null;
    try {
      const stored = localStorage.getItem("authUser");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const persistUserInfo = (info) => {
    setUserInfo(info);
    if (typeof localStorage !== "undefined") {
      if (info) {
        localStorage.setItem("authUser", JSON.stringify(info));
      } else {
        localStorage.removeItem("authUser");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (mode === "login") {
      setLoginForm((prev) => ({ ...prev, [name]: value }));
    } else {
      setRegisterForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLogout = async () => {
    try {
      if (onLogout) {
        await onLogout();
      }
    } finally {
      persistUserInfo(null);
    }
  };

  useEffect(() => {
    // Reset captcha al cambiar de modo
    recaptchaRef.current?.reset();
    setLoginForm((prev) => ({ ...prev, captchaToken: "" }));
    setRegisterForm((prev) => ({ ...prev, captchaToken: "" }));
  }, [mode]);

  const handleCaptchaChange = (token) => {
    if (mode === "login") {
      setLoginForm((prev) => ({ ...prev, captchaToken: token || "" }));
    } else {
      setRegisterForm((prev) => ({ ...prev, captchaToken: token || "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setFormLoading(true);

    const formatError = (err) => {
      const msg = err?.message?.toLowerCase?.() || "";
      if (msg.includes("duplicate value")) {
        return "Ya existe un usuario con esos datos (email o teléfono).";
      }
      return err?.message || "Error creando o autenticando la cuenta";
    };

    try {
      const captchaToken =
        mode === "login" ? loginForm.captchaToken : registerForm.captchaToken;
      if (siteKey && !captchaToken) {
        setFormError("Completa el captcha para continuar.");
        return;
      }

      if (mode === "login") {
        const res = await authApi.login(
          loginForm.email,
          loginForm.password,
          loginForm.captchaToken
        );
        onLogin && onLogin(res.access_token);
        try {
          const profile = await authApi.getUserByIdentifier(loginForm.email);
          persistUserInfo({
            name: profile.name,
            email: profile.email,
            phoneNumber: profile.phoneNumber,
            iban: profile.iban,
            plan: profile.plan,
          });
        } catch {
          const guessName =
            loginForm.email?.split("@")?.[0]?.replace(/\./g, " ") ||
            "Cliente BancUS";
          persistUserInfo({
            name: guessName,
            email: loginForm.email,
            phoneNumber: "No disponible",
            plan: "basico",
          });
        }
      } else {
        const payload = {
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password,
          phoneNumber: registerForm.phoneNumber,
          subscription: registerForm.subscription,
        };

        await accountsApi.create(payload);
        const res = await authApi.login(
          registerForm.email,
          registerForm.password,
          registerForm.captchaToken
        );
        onLogin && onLogin(res.access_token);
        setFormSuccess("Cuenta creada y sesión iniciada.");
        try {
          const profile = await authApi.getUserByIdentifier(
            registerForm.email
          );
          persistUserInfo({
            name: profile.name,
            email: profile.email,
            phoneNumber: profile.phoneNumber,
            iban: profile.iban,
            plan: profile.plan,
          });
        } catch {
          persistUserInfo({
            name: registerForm.name,
            email: registerForm.email,
            phoneNumber: registerForm.phoneNumber,
            plan: registerForm.subscription || "basico",
          });
        }
      }
    } catch (err) {
      setFormError(formatError(err));
    } finally {
      setFormLoading(false);
      recaptchaRef.current?.reset();
      setLoginForm((prev) => ({ ...prev, captchaToken: "" }));
      setRegisterForm((prev) => ({ ...prev, captchaToken: "" }));
    }
  };

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

  const displayName = userInfo?.name || "Cliente BancUS";
  const displayEmail = userInfo?.email || "Correo no disponible";
  const displayPhone = userInfo?.phoneNumber || "Teléfono no registrado";
  const initials = getInitials(userInfo?.name || userInfo?.email || "BancUS");

  const iban = userInfo?.iban || "No se ha podido obtener el iban"

  const [recentTransfers, setRecentTransfers] = useState([]);
  const [loadingTransfers, setLoadingTransfers] = useState(false);

  useEffect(() => {
    if (isLoggedIn && userInfo?.iban) {
      fetchRecentTransfers(userInfo.iban);
    }
  }, [isLoggedIn, userInfo]);

  const fetchRecentTransfers = async (userIban) => {
    setLoadingTransfers(true);
    try {
      const data = await transfersApi.getByUser(userIban);
      // Ordenar por ID descendente (lo más reciente arriba) y coger los 5 primeros
      const sorted = (Array.isArray(data) ? data : []).sort((a, b) => (b.id || 0) - (a.id || 0));
      setRecentTransfers(sorted.slice(0, 5));
    } catch (err) {
      console.error("Error fetching transfers on overview", err);
    } finally {
      setLoadingTransfers(false);
    }
  };

  const [saldo, setSaldo] = useState("Cargando...");

  useEffect(() => {
    const fetchSaldo = async () => {
      if (isLoggedIn && iban && iban !== "No disponible") {
        try {
          const data = await accountsApi.getByIban(iban);
          setSaldo(data.balance + " $");
        } catch (error) {
          console.error("Error obteniendo saldo:", error);
          setSaldo("Error");
        }
      }
    };

    fetchSaldo();
  }, [isLoggedIn, iban]);


  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [errorNotifications, setErrorNotifications] = useState(null);

  const userId = userInfo?.iban;

  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  }, [userId]);

  async function loadNotifications() {
    setLoadingNotifications(true);
    setErrorNotifications(null);

    try {
      const data = await notificationsApi.getByUser(userId);

      const visibleNotifications = (Array.isArray(data) ? data : [])
        .filter(n => n.email_sent !== false)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )
        .slice(0, 3);

      setNotifications(visibleNotifications);
    } catch (err) {
      console.error(err);
      setErrorNotifications(err.message || "Error cargando notificaciones");
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  }

  return (
    <div className="overview-page">
      {/* LOGIN solo cuando no hay sesión */}
      {!isLoggedIn && (
        <ScrollSection
          id="login"
          title="Accede a tu banca online"
          subtitle="Autenticación segura para tu cuenta."
        >
          <div className="login-panel">
            <div className="form-toggle">
              <button
                type="button"
                className={mode === "login" ? "toggle-btn active" : "toggle-btn"}
                onClick={() => {
                  setMode("login");
                  setFormError("");
                  setFormSuccess("");
                }}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                className={
                  mode === "register" ? "toggle-btn active" : "toggle-btn"
                }
                onClick={() => {
                  setMode("register");
                  setFormError("");
                  setFormSuccess("");
                }}
              >
                Crear cuenta
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {mode === "register" && (
                <div className="form-row">
                  <label>
                    Nombre
                    <input
                      type="text"
                      name="name"
                      value={registerForm.name}
                      placeholder="Tu nombre"
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                </div>
              )}

              <div className="form-row">
                <label>
                  Usuario o correo electrónico
                  <input
                    type="email"
                    name="email"
                    value={mode === "login" ? loginForm.email : registerForm.email}
                    placeholder="tucorreo@example.com"
                    required
                    onChange={handleInputChange}
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Contraseña
                  <input
                    type="password"
                    name="password"
                    value={
                      mode === "login" ? loginForm.password : registerForm.password
                    }
                    placeholder="••••••••"
                    required
                    onChange={handleInputChange}
                  />
                </label>
              </div>

              {mode === "register" && (
                <div className="form-row">
                  <label>
                    Teléfono
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={registerForm.phoneNumber}
                      placeholder="+34123456789"
                      onChange={handleInputChange}
                      required
                    />
                  </label>
                </div>
              )}

              <div className="form-row">
                {siteKey ? (
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={siteKey}
                    onChange={handleCaptchaChange}
                  />
                ) : (
                  <p className="info-message">
                    Configura VITE_RECAPTCHA_SITE_KEY para habilitar el captcha.
                  </p>
                )}
              </div>

              <div className="form-row form-row-inline">
                <label className="checkbox">
                  <input type="checkbox" />
                  <span>Recordarme en este dispositivo</span>
                </label>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => setMode(mode === "login" ? "register" : "login")}
                >
                  {mode === "login"
                    ? "¿No tienes cuenta? Regístrate"
                    : "¿Ya tienes cuenta? Inicia sesión"}
                </button>
              </div>

              {formError && <p className="error-message">{formError}</p>}
              {formSuccess && <p className="success-message">{formSuccess}</p>}

              <div className="form-row form-buttons">
                <button type="submit" className="btn-primary">
                  {formLoading
                    ? "Procesando..."
                    : mode === "login"
                      ? "Iniciar sesión"
                      : "Crear cuenta"}
                </button>
              </div>
            </form>
          </div>
        </ScrollSection>
      )}


      {/* PRICING: solo cuando NO hay login */}
      {!isLoggedIn && (
        <ScrollSection
          id="pricing"
          title="Planes y precios"
          subtitle="Elige el plan que mejor se adapte a tu uso."
        >
          <div className="pricing-grid">
            {PLANS.map((plan) => (
              <article
                key={plan.id}
                className={
                  "pricing-card" +
                  (plan.highlight ? " pricing-card--highlight" : "")
                }
              >
                {plan.highlight && (
                  <span className="pricing-badge">Más popular</span>
                )}

                <h3 className="pricing-name">{plan.name}</h3>
                <p className="pricing-price">{plan.price}</p>
                <p className="pricing-description">{plan.description}</p>

                <ul className="pricing-features">
                  {plan.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>

                <button
                  type="button"
                  className="btn-primary pricing-cta"
                  onClick={() => navigate("/login-activity")}
                >
                  Empezar con este plan
                </button>
              </article>
            ))}
          </div>

          <p className="muted small">
            Los planes son ficticios y sirven como ejemplo de integración con un
            microservicio de pricing.
          </p>
        </ScrollSection>
      )}

      {/* RESTO DE SECCIONES: solo con login */}
      {isLoggedIn && (
        <>
          {/* Perfil de usuario */}
          <ScrollSection
            id="user-profile"
            title="Tu cuenta"
            subtitle="Datos de usuario"
          >
            <div className="profile-panel">
              <div className="avatar-circle">{initials}</div>
              <div className="profile-data">
                <span className="profile-name">{displayName}</span>
                <span className="profile-email">{displayEmail}</span>
                <span className="profile-phone">{displayPhone}</span>
              </div>
            </div>
          </ScrollSection>

          {/* Resumen de cuenta */}
          <ScrollSection
            id="account"
            title="Resumen de la cuenta"
            subtitle="Saldo e información básica de tu cuenta principal."
          >
            <div className="two-cols">
              <div>
                <p className="label">Saldo disponible</p>
                <p className="big-number">{saldo}</p>
              </div>
              <div>
                <p className="label">IBAN</p>
                <p>{iban}</p>
                <p className="muted">Cuenta corriente · Uso diario</p>
              </div>
            </div>
          </ScrollSection>

          <ScrollSection
            id="transactions"
            title="Transacciones recientes"
            subtitle="Últimos movimientos registrados."
          >
            {loadingTransfers ? (
              <p>Cargando movimientos...</p>
            ) : recentTransfers.length === 0 ? (
              <p className="muted">No hay movimientos recientes.</p>
            ) : (
              <div className="list-block">
                {recentTransfers.map((t) => {
                  const isIncoming = t.receiver === iban;
                  const amountClass = isIncoming ? "pos" : "neg";
                  const sign = isIncoming ? "+" : "-";
                  const label = isIncoming ? `De ${t.sender}` : `A ${t.receiver}`;

                  return (
                    <div className="list-row" key={t.id}>
                      <span>{label}</span>
                      <span className={amountClass}>{sign}€ {t.quantity}</span>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{ marginTop: "1rem" }}>
              <button
                className="link-button"
                onClick={() => navigate("/transactions")}
                style={{ fontSize: "0.9rem" }}
              >
                Ver todo el historial &rarr;
              </button>
            </div>
          </ScrollSection>

          {/* Antifraude */}
          <ScrollSection
            id="fraud"
            title="Seguridad y antifraude"
            subtitle="Estado general de seguridad."
          >
            <div className="two-cols">
              <div>
                <p className="label">Estado</p>
                <p>
                  <strong>Sin incidencias</strong>
                </p>
              </div>
              <div>
                <p className="label">Alertas abiertas</p>
                <p>0 casos pendientes</p>
              </div>
            </div>
            <p className="muted">
              Datos de ejemplo. Conectar con el microservicio de antifraude.
            </p>
          </ScrollSection>

          {/* Logins */}
          <ScrollSection
            id="logins"
            title="Actividad de acceso"
            subtitle="Últimos inicios de sesión."
          >
            <div className="list-block">
              <div className="list-row">
                <span>Hoy 09:15 · Chrome · Sevilla</span>
                <span>Correcto</span>
              </div>
              <div className="list-row">
                <span>Ayer 22:05 · Android · Sevilla</span>
                <span>Correcto</span>
              </div>
            </div>
            <p className="muted">
              Aquí iría el microservicio de autenticación (
              <code>/auth/logins</code>, por ejemplo).
            </p>
          </ScrollSection>

          {/* Pagos programados */}
          <ScrollSection
            id="payments"
            title="Pagos programados"
            subtitle="Cargos automáticos previstos."
          >
            <OverviewPaymentsPage />
          </ScrollSection>

          {/* Notificaciones */}
          <ScrollSection
            id="notifications"
            title="Notificaciones"
            subtitle="Avisos importantes sobre tu cuenta."
          >
            {loadingNotifications ? (
              <p>Cargando notificaciones...</p>
            ) : notifications.length === 0 ? (
              <p className="muted">No tienes notificaciones recientes.</p>
            ) : (
              <div className="list-block">
                {/* Cabecera */}
                <div className="list-row list-row-header">
                  <span className="label">Concepto</span>
                  <span className="label">Fecha</span>
                </div>

                {/* Filas */}
                {notifications.map((n) => (
                  <div className="list-row" key={n.id}>
                    <span>{n.title || n.type}</span>
                    <span className="muted small">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: "1rem" }}>
              <button
                className="link-button"
                onClick={() => navigate("/notifications")}
                style={{ fontSize: "0.9rem" }}
              >
                Ver todas las notificaciones →
              </button>
            </div>
          </ScrollSection>
        </>
      )}
    </div>
  );
}

export default OverviewPage;
