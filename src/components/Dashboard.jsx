import React from "react";
import CardsPage from "./CardsPage";
import "../Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard">
      <section className="dashboard-top">
        <div className="dashboard-grid">
     
          <div className="dash-card">
            <h2>Cuenta principal</h2>
            <p className="dash-big">€ 1.234,56</p>
            <p>IBAN: ES12 3456 7890 1234 5678 9012</p>
            <p>Tipo: Cuenta corriente</p>
            <p className="dash-muted">
              
              (Datos de ejemplo – conectar con microservicio de cuentas)
            </p>
          </div>

          {/* Transacciones recientes */}
          <div className="dash-card">
            <h2>Transacciones recientes</h2>
            <ul className="dash-list">
              <li>
                <span>Pago tarjeta supermercado</span>
                <span>-€ 45,20</span>
              </li>
              <li>
                <span>Nómina</span>
                <span>+€ 1.200,00</span>
              </li>
              <li>
                <span>Suscripción streaming</span>
                <span>-€ 12,99</span>
              </li>
            </ul>
            <p className="dash-muted">
              {/* Aquí /transactions?limit=5 del microservicio de transacciones */}
              (Datos de ejemplo – conectar con microservicio de transacciones)
            </p>
          </div>

          {/* Antifraude */}
          <div className="dash-card">
            <h2>Antifraude</h2>
            <p>Estado: <strong>Sin incidencias</strong></p>
            <p>Alertas abiertas: 0</p>
            <p className="dash-muted">
              {/* Aquí /fraud/status o similar */}
              (Datos de ejemplo – conectar con microservicio de antifraude)
            </p>
          </div>

          {/* Actividad de login */}
          <div className="dash-card">
            <h2>Actividad de acceso</h2>
            <ul className="dash-list">
              <li>
                <span>Hoy, 10:12 – Chrome · Sevilla</span>
              </li>
              <li>
                <span>Ayer, 22:05 – Android · Sevilla</span>
              </li>
            </ul>
            <p className="dash-muted">
              {/* Aquí /auth/logins recientes */}
              (Datos de ejemplo – conectar con microservicio de login/auth)
            </p>
          </div>

          {/* Pagos programados */}
          <div className="dash-card">
            <h2>Pagos programados</h2>
            <ul className="dash-list">
              <li>
                <span>Hipoteca – 01 de cada mes</span>
                <span>€ 600</span>
              </li>
              <li>
                <span>Seguro coche – 15 de cada mes</span>
                <span>€ 35</span>
              </li>
            </ul>
            <p className="dash-muted">
              
              (Datos de ejemplo – conectar con microservicio de pagos)
            </p>
          </div>

          {/* Notificaciones */}
          <div className="dash-card">
            <h2>Notificaciones</h2>
            <ul className="dash-list">
              <li>Nueva tarjeta emitida el 26/11/2025</li>
              <li>Actualización de condiciones de la cuenta</li>
              <li>Alerta: compra online inusual revisada</li>
            </ul>
            <p className="dash-muted">
              {/* Aquí /notifications/unread */}
              (Datos de ejemplo – conectar con microservicio de notificaciones)
            </p>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        {/* Aquí incrustamos el gestor de tarjetas completo */}
        <CardsPage />
      </section>
    </div>
  );
}

export default Dashboard;
