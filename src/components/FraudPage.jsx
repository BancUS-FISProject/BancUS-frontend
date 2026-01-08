import React, { useEffect, useState } from "react";
import { antifraudApi } from "../api";
import "./FraudPage.css";

const statusLabels = {
  PENDING: "Pendiente",
  REVIEWED: "Revisada",
  CONFIRMED: "Confirmada",
  FALSE_POSITIVE: "Falso positivo",
};

const statusOrder = ["PENDING", "REVIEWED", "CONFIRMED", "FALSE_POSITIVE"];

function FraudPage() {
  const [userIban] = useState(() => {
    if (typeof localStorage === "undefined") return "";
    try {
      const stored = localStorage.getItem("authUser");
      const parsed = stored ? JSON.parse(stored) : null;
      return parsed?.iban || "";
    } catch {
      return "";
    }
  });
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertsError, setAlertsError] = useState(null);

  const [selectedAlert, setSelectedAlert] = useState(null);
  const [updateData, setUpdateData] = useState({ status: "", reason: "" });
  const [updating, setUpdating] = useState(false);

  const alertId = (alert) => alert?._id || alert?.id;

  const statusCounts = statusOrder.reduce((acc, key) => {
    acc[key] = alerts.filter((a) => a.status === key).length;
    return acc;
  }, {});

  async function fetchAlerts(iban) {
    if (!iban) return;
    setAlertsLoading(true);
    setAlertsError(null);
    setSelectedAlert(null);
    try {
      const data = await antifraudApi.getAlertsByIban(iban);
      setAlerts(data || []);
    } catch (err) {
      if (err.status === 404) {
        setAlerts([]);
      } else {
        console.error(err);
        setAlertsError(err.message || "Error obteniendo alertas");
      }
    } finally {
      setAlertsLoading(false);
    }
  }

  useEffect(() => {
    if (!userIban) {
      setAlerts([]);
      setAlertsError(null);
      setAlertsError("No se ha podido obtener el IBAN del usuario actual.");
      return;
    }
    fetchAlerts(userIban);
  }, [userIban]);

  function handleSelect(alert) {
    setSelectedAlert(alert);
    setUpdateData({
      status: alert?.status || "",
      reason: alert?.reason || "",
    });
  }

  async function handleUpdateSelected(e) {
    e?.preventDefault();
    if (!selectedAlert) return;
    const payload = {};
    if (updateData.status) payload.status = updateData.status;
    if (updateData.reason?.trim()) payload.reason = updateData.reason.trim();
    if (Object.keys(payload).length === 0) return;

    setUpdating(true);
    try {
      const updated = await antifraudApi.updateAlert(
        alertId(selectedAlert),
        payload
      );
      setAlerts((prev) =>
        prev.map((a) =>
          alertId(a) === alertId(selectedAlert) ? updated : a
        )
      );
      setSelectedAlert(updated);
    } catch (err) {
      console.error(err);
      setAlertsError(err.message || "Error actualizando la alerta.");
    } finally {
      setUpdating(false);
    }
  }

  async function handleQuickStatus(alert, status) {
    try {
      const updated = await antifraudApi.updateAlert(alertId(alert), {
        status,
      });
      setAlerts((prev) =>
        prev.map((a) => (alertId(a) === alertId(alert) ? updated : a))
      );
      if (selectedAlert && alertId(selectedAlert) === alertId(alert)) {
        setSelectedAlert(updated);
        setUpdateData((prev) => ({ ...prev, status: updated.status }));
      }
    } catch (err) {
      console.error(err);
      setAlertsError(err.message || "No se pudo actualizar el estado.");
    }
  }

  async function handleDelete(alert) {
    const ok = window.confirm(
      "¿Seguro que quieres eliminar esta alerta? Esta acción no se puede deshacer."
    );
    if (!ok) return;
    try {
      await antifraudApi.deleteAlert(alertId(alert));
      setAlerts((prev) => prev.filter((a) => alertId(a) !== alertId(alert)));
      if (selectedAlert && alertId(selectedAlert) === alertId(alert)) {
        setSelectedAlert(null);
      }
    } catch (err) {
      console.error(err);
      setAlertsError(err.message || "No se pudo eliminar la alerta.");
    }
  }

  function formatDate(date) {
    const d = new Date(date);
    return isNaN(d.getTime()) ? "-" : d.toLocaleString();
  }

  return (
    <div className="fraud-page">
      <div className="fraud-header">
        <div>
          <p className="eyebrow">Seguridad</p>
          <h1>Centro Anti-Fraude</h1>
          <p className="subtitle">
            Revisa alertas y actualiza su estado desde un mismo panel.
          </p>
        </div>
        <div className="fraud-top-row">
          <div className="search-box">
            <label>Usuario actual</label>
            <p className="muted">
              IBAN: {userIban || "No disponible"}
            </p>
            <button
              type="button"
              className="btn primary"
              onClick={() => fetchAlerts(userIban)}
              disabled={!userIban || alertsLoading}
            >
              {alertsLoading ? "Actualizando..." : "Actualizar alertas"}
            </button>
            {alertsError && <p className="error-text">{alertsError}</p>}
          </div>

          <div className="kpi-grid">
            {statusOrder.map((status) => (
              <div key={status} className={`card kpi ${status.toLowerCase()}`}>
                <p className="label">{statusLabels[status]}</p>
                <p className="kpi-value">{statusCounts[status] || 0}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card full">
        <div className="table-header">
          <div>
            <h3>Alertas detectadas</h3>
            <p className="muted">
              Actualiza el estado o marca falsos positivos.
            </p>
          </div>
          {alertsLoading && <span className="pill">Cargando...</span>}
        </div>
        <div className="table-wrapper">
          <table className="alerts-table">
            <thead>
              <tr>
                <th>Origen</th>
                <th>Destino</th>
                <th>Importe</th>
                <th>Estado</th>
                <th>Acciones</th>
                <th>Motivo</th>
                <th>Fecha tx</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr
                  key={alertId(alert)}
                  className={
                    selectedAlert && alertId(selectedAlert) === alertId(alert)
                      ? "selected"
                      : ""
                  }
                  onClick={() => handleSelect(alert)}
                >
                  <td>{alert.origin}</td>
                  <td>{alert.destination}</td>
                  <td>{Number(alert.amount).toFixed(2)} €</td>
                  <td>
                    <span className={`status-badge ${alert.status}`}>
                      {statusLabels[alert.status] || alert.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="btn ghost small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickStatus(alert, "REVIEWED");
                      }}
                    >
                      Revisada
                    </button>
                    <button
                      className="btn ghost small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickStatus(alert, "CONFIRMED");
                      }}
                    >
                      Confirmar
                    </button>
                    <button
                      className="btn ghost small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickStatus(alert, "FALSE_POSITIVE");
                      }}
                    >
                      Falso +
                    </button>
                    <button
                      className="btn danger small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(alert);
                      }}
                    >
                      Borrar
                    </button>
                  </td>
                  <td className="reason-cell">{alert.reason}</td>
                  <td>{formatDate(alert.transactionDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!alertsLoading && alerts.length === 0 && (
            <p className="muted empty">Sin alertas para mostrar.</p>
          )}
        </div>
      </div>

      {selectedAlert && (
        <div className="card detail">
          <div>
            <p className="eyebrow">Alerta seleccionada</p>
            <h3>{selectedAlert.origin}</h3>
            <p className="muted">
              {formatDate(selectedAlert.transactionDate)} ·{" "}
              {Number(selectedAlert.amount).toFixed(2)} €
            </p>
          </div>
          <form className="detail-form" onSubmit={handleUpdateSelected}>
            <label>
              Estado
              <select
                value={updateData.status}
                onChange={(e) =>
                  setUpdateData((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
              >
                <option value="">Selecciona...</option>
                {statusOrder.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Motivo / notas
              <textarea
                rows={3}
                value={updateData.reason}
                onChange={(e) =>
                  setUpdateData((prev) => ({
                    ...prev,
                    reason: e.target.value,
                  }))
                }
                placeholder="Añade contexto de la revisión"
              />
            </label>
            <div className="detail-actions">
              <button type="submit" className="btn primary" disabled={updating}>
                {updating ? "Guardando..." : "Guardar cambios"}
              </button>
              <span className="muted">
                Creada: {formatDate(selectedAlert.reportDate || selectedAlert.reportCreationDate)} ·
                Actualizada:{" "}
                {formatDate(
                  selectedAlert.reportUpdateDate ||
                    selectedAlert.updatedAt ||
                    selectedAlert.reportDate
                )}
              </span>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default FraudPage;
