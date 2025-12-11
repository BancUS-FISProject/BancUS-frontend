import React, { useState } from "react";
import ScrollSection from "./ScrollSection";
import "../OverviewPage.css";

const DEMO_EMAIL = "demo@bancus.test";
const DEMO_PASSWORD = "bancus123";

function OverviewPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");

    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setIsLoggedIn(false);
      setLoginError("Credenciales incorrectas. Revisa el usuario y la contraseña.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="overview-page">
      {/* Sección de login (siempre visible) */}
      <ScrollSection
        id="login"
        title="Accede a tu banca online"
        subtitle="Formulario de acceso simulado (solo interfaz)."
      >
        <div className="login-panel">
          <form onSubmit={handleLoginSubmit}>
            <div className="form-row">
              <label>
                Usuario o correo electrónico
                <input
                  type="email"
                  name="email"
                  placeholder="tucorreo@example.com"
                  required
                />
              </label>
            </div>

            <div className="form-row">
              <label>
                Contraseña
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                />
              </label>
            </div>

            <div className="form-row form-row-inline">
              <label className="checkbox">
                <input type="checkbox" />
                <span>Recordarme en este dispositivo</span>
              </label>
              <button type="button" className="link-button">
                ¿Has olvidado la contraseña?
              </button>
            </div>

            {loginError && (
              <p className="error-message">{loginError}</p>
            )}

            <div className="form-row form-buttons">
              <button type="submit" className="btn-primary">
                Iniciar sesión
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {}}
              >
                Entrar con Google
              </button>
            </div>

            <p className="muted">
              Usuario de prueba: <code>{DEMO_EMAIL}</code> - Contraseña:{" "}
              <code>{DEMO_PASSWORD}</code>
            </p>

            {isLoggedIn && (
              <div className="form-row">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </form>
        </div>
      </ScrollSection>

      {/* Todo lo demás solo aparece si estamos logueados */}
      {isLoggedIn && (
        <>
          {/* Resumen de cuenta */}
          <ScrollSection
            id="account"
            title="Resumen de la cuenta"
            subtitle="Saldo e información básica de tu cuenta principal."
          >
            <div className="two-cols">
              <div>
                <p className="label">Saldo disponible</p>
                <p className="big-number">€ 1.234,56</p>
              </div>
              <div>
                <p className="label">IBAN</p>
                <p>ES12 3456 7890 1234 5678 9012</p>
                <p className="muted">Cuenta corriente · Uso diario</p>
              </div>
            </div>
            <p className="muted">
              Datos de ejemplo. Llamar al microservicio de cuentas (
              <code>/accounts/summary</code>).
            </p>
          </ScrollSection>

          {/* Transacciones */}
          <ScrollSection
            id="transactions"
            title="Transacciones recientes"
            subtitle="Últimos movimientos registrados."
          >
            <div className="list-block">
              <div className="list-row">
                <span>Pago supermercado</span>
                <span className="neg">-€ 45,20</span>
              </div>
              <div className="list-row">
                <span>Nómina</span>
                <span className="pos">+€ 1.200,00</span>
              </div>
              <div className="list-row">
                <span>Suscripción streaming</span>
                <span className="neg">-€ 12,99</span>
              </div>
            </div>
            <p className="muted">
              Aquí hablarías con el microservicio de transacciones (
              <code>/transactions?limit=10</code>).
            </p>
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
            <div className="list-block">
              <div className="list-row">
                <span>Hipoteca · 01 de cada mes</span>
                <span>€ 600</span>
              </div>
              <div className="list-row">
                <span>Seguro coche · 15 de cada mes</span>
                <span>€ 35</span>
              </div>
            </div>
            <p className="muted">
              Microservicio de pagos programados (
              <code>/scheduled-payments</code>).
            </p>
          </ScrollSection>

          {/* Notificaciones */}
          <ScrollSection
            id="notifications"
            title="Notificaciones"
            subtitle="Avisos importantes sobre tu cuenta."
          >
            <ul className="notifications-list">
              <li>Nueva tarjeta emitida el 26/11/2025.</li>
              <li>Actualización de condiciones de la cuenta.</li>
              <li>Compra online inusual revisada y aceptada.</li>
            </ul>
            <p className="muted">
              Aquí iría el microservicio de notificaciones (
              <code>/notifications</code>).
            </p>
          </ScrollSection>
        </>
      )}
    </div>
  );
}

export default OverviewPage;
