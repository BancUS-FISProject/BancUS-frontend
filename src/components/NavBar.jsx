import React from "react";
import { NavLink } from "react-router-dom";
import "../Navbar.css";

function Navbar({ isLoggedIn }) {
  // Si no estamos logueados, no mostramos nada
  if (!isLoggedIn) return null;

  return (
    <nav className="navbar">
      <div className="page-inner navbar-inner">
        <div className="navbar-brand">Mi Banco Demo</div>
        <div className="navbar-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              "nav-link" + (isActive ? " active" : "")
            }
          >
            Resumen
          </NavLink>
          <NavLink
            to="/accounts"
            className={({ isActive }) =>
              "nav-link" + (isActive ? " active" : "")
            }
          >
            Cuentas
          </NavLink>
          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              "nav-link" + (isActive ? " active" : "")
            }
          >
            Transacciones
          </NavLink>
          <NavLink
            to="/fraud"
            className={({ isActive }) =>
              "nav-link" + (isActive ? " active" : "")
            }
          >
            Antifraude
          </NavLink>
          <NavLink
            to="/login-activity"
            className={({ isActive }) =>
              "nav-link" + (isActive ? " active" : "")
            }
          >
            Logins
          </NavLink>
          <NavLink
            to="/payments"
            className={({ isActive }) =>
              "nav-link" + (isActive ? " active" : "")
            }
          >
            Pagos prog.
          </NavLink>
          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              "nav-link" + (isActive ? " active" : "")
            }
          >
            Notificaciones
          </NavLink>
          <NavLink
            to="/cards"
            className={({ isActive }) =>
              "nav-link" + (isActive ? " active" : "")
            }
          >
            Tarjetas
          </NavLink>
          <NavLink
            to="/pricing"
            className={({ isActive }) =>
              "nav-link" + (isActive ? " active" : "")
            }
          >
            Pricing
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
