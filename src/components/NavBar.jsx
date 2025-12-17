import React from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar({ isLoggedIn, onLogout }) {
  if (!isLoggedIn) return null;

  return (
    <header className="navbar">
      <div className="page-inner">
        <div className="navbar-card navbar-inner">
          <div className="navbar-brand">Mi Banco Demo</div>

          <nav
            className="navbar-links"
            aria-label="Navegación principal de la banca online"
          >
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                "nav-link" + (isActive ? " nav-link--active" : "")
              }
            >
              Resumen
            </NavLink>
            <NavLink
              to="/accounts"
              className={({ isActive }) =>
                "nav-link" + (isActive ? " nav-link--active" : "")
              }
            >
              Cuentas
            </NavLink>
            <NavLink
              to="/transactions"
              className={({ isActive }) =>
                "nav-link" + (isActive ? " nav-link--active" : "")
              }
            >
              Transacciones
            </NavLink>
            <NavLink
              to="/fraud"
              className={({ isActive }) =>
                "nav-link" + (isActive ? " nav-link--active" : "")
              }
            >
              Antifraude
            </NavLink>
            <NavLink
              to="/login-activity"
              className={({ isActive }) =>
                "nav-link" + (isActive ? " nav-link--active" : "")
              }
            >
              Logins
            </NavLink>
            <NavLink
              to="/payments"
              className={({ isActive }) =>
                "nav-link" + (isActive ? " nav-link--active" : "")
              }
            >
              Pagos prog.
            </NavLink>
            <NavLink
              to="/notifications"
              className={({ isActive }) =>
                "nav-link" + (isActive ? " nav-link--active" : "")
              }
            >
              Notificaciones
            </NavLink>
            <NavLink
              to="/cards"
              className={({ isActive }) =>
                "nav-link" + (isActive ? " nav-link--active" : "")
              }
            >
              Tarjetas
            </NavLink>
            <NavLink
              to="/pricing"
              className={({ isActive }) =>
                "nav-link" + (isActive ? " nav-link--active" : "")
              }
            >
              Pricing
            </NavLink>
          </nav>
        </div>
        <div className="navbar-actions navbar-actions--below">
          <button type="button" className="logout-button" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
