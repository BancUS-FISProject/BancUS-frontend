import React from "react";
import ScrollSection from "./ScrollSection";
import CardsPage from "./CardsPage";
import "../BankPage.css";


function BankPage() {
  return (
    <main className="bank-page">

      <header className="bank-hero">
        <div className="bank-hero-content">
          <h1>Área personal</h1>
          <p>
            Visión completa de tu cuenta, movimientos, seguridad y tarjetas
            en una sola página.
          </p>
          <ul className="bank-hero-list">
            <li>Resumen de cuenta y transacciones</li>
            <li>Estado de seguridad y antifraude</li>
            <li>Pagos programados y notificaciones</li>
            <li>Gestión completa de tarjetas</li>
          </ul>
        </div>
      </header>

      {/* Resumen de cuenta */}
      <ScrollSection
        id="account"
        title="Resumen de la cuenta"
        subtitle="Información básica de tu cuenta principal."
      >
        {/* Conectar con cuentas */}
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
          Datos de ejemplo. Llamar al microservicio de cuentas
          (por ejemplo, <code>/accounts/summary</code>).
        </p>
      </ScrollSection>

      {/*Transacciones recientes */}
      <ScrollSection
        id="transactions"
        title="Transacciones recientes"
        subtitle="Últimos movimientos en tu cuenta."
      >
        {/*conecta con el microservicio de transacciones */}
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
          Datos de ejemplo. 
          <code>/transactions?limit=10</code>.
        </p>
      </ScrollSection>

      {/* Antifraude */}
      <ScrollSection
        id="fraud"
        title="Seguridad y antifraude"
        subtitle="Estado de seguridad de tu cuenta y tus tarjetas."
      >
        <div className="two-cols">
          <div>
            <p className="label">Estado general</p>
            <p>
              <strong>Sin incidencias</strong>
            </p>
          </div>
          <div>
            <p className="label">Alertas abiertas</p>
            <p>0 casos pendientes de revisión</p>
          </div>
        </div>
        <p className="muted">
          Conectar con el microservicio de antifraude (
          <code>/fraud/status</code>, <code>/fraud/alerts</code>, etc.).
        </p>
      </ScrollSection>

      {/* Actividad de login */}
      <ScrollSection
        id="logins"
        title="Actividad de acceso"
        subtitle="Últimos inicios de sesión en tu banca online."
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
          Datos de ejemplo. Conectar con el microservicio de login/
          autenticación (<code>/auth/logins</code>, por ejemplo).
        </p>
      </ScrollSection>

      {/* Pagos programados */}
      <ScrollSection
        id="scheduled"
        title="Pagos programados"
        subtitle="Cargos que se realizarán automáticamente en tu cuenta."
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
          Aquí conectar con el microservicio de pagos programados (
          <code>/scheduled-payments</code>).
        </p>
      </ScrollSection>

      {/* Notificaciones */}
      <ScrollSection
        id="notifications"
        title="Notificaciones"
        subtitle="Cambios importantes y avisos sobre tu cuenta."
      >
        <ul className="notifications-list">
          <li>Nueva tarjeta emitida el 26/11/2025.</li>
          <li>Actualización de condiciones de la cuenta.</li>
          <li>Compra online inusual revisada y aceptada.</li>
        </ul>
        <p className="muted">
          Aquí hablarías con el microservicio de notificaciones (
          <code>/notifications</code>, <code>/notifications/unread</code>, etc.).
        </p>
      </ScrollSection>

      {/* Tarjetas: se reutiliza CardsPage entera */}
      <ScrollSection
        id="cards"
        title="Gestión de tarjetas"
        subtitle="Consulta, crea, bloquea o elimina tus tarjetas."
      >
        <CardsPage />
      </ScrollSection>
    </main>
  );
}

export default BankPage;
