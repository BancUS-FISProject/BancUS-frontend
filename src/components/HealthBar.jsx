// src/components/HealthBar.jsx
import React, { useEffect, useState } from "react";
import { healthApi, API_BASE } from "../api";
import "../HealthBar.css";

function HealthBar() {
  const [cacheOk, setCacheOk] = useState(null);
  const [healthInfo, setHealthInfo] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function checkHealth() {
    setLoading(true);
    setError(null);

    try {
      // Si no lanza error, asumimos que la caché responde.
      await healthApi.pingCache();
      setCacheOk(true);
    } catch (err) {
      console.error(err);
      setCacheOk(false);
      setError("Error al comprobar la caché");
    }

    try {
      const data = await healthApi.health();
      setHealthInfo(data);
    } catch (err) {
      console.error(err);
      setError((prev) => prev || "Error al comprobar el estado general");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkHealth();
  }, []);

  // Chip de caché
  let cacheText = "...";
  let cacheClass = "hb-chip hb-chip--neutral";
  if (cacheOk === true) {
    cacheText = "OK";
    cacheClass = "hb-chip hb-chip--ok";
  } else if (cacheOk === false) {
    cacheText = "ERROR";
    cacheClass = "hb-chip hb-chip--error";
  }

  // Chip de DB (si viene en el health)
  const dbStatus =
    healthInfo && (healthInfo.db ?? healthInfo.database ?? healthInfo.dbStatus);
  let dbText = "...";
  let dbClass = "hb-chip hb-chip--neutral";
  if (dbStatus === "ok" || dbStatus === true) {
    dbText = "OK";
    dbClass = "hb-chip hb-chip--ok";
  } else if (dbStatus != null) {
    dbText = String(dbStatus);
    dbClass = "hb-chip hb-chip--error";
  }

  // Chip global
  const okGlobal =
    healthInfo && (healthInfo.ok === true || healthInfo.status === "ok");
  const globalClass = okGlobal
    ? "hb-chip hb-chip--ok"
    : "hb-chip hb-chip--neutral";

  return (
    <div className="healthbar">
      <div className="page-inner healthbar-inner">
        <div className="healthbar-left">
          <span className="health-label">API</span>
          <code className="health-code">{API_BASE}</code>
        </div>

        <div className="healthbar-right">
          <button
            type="button"
            className="hb-refresh"
            onClick={checkHealth}
            disabled={loading}
          >
            {loading ? "Comprobando..." : "Refrescar estado"}
          </button>

          <span className={cacheClass}>Caché: {cacheText}</span>
          {healthInfo && <span className={dbClass}>DB: {dbText}</span>}

          {healthInfo && (
            <span className={globalClass}>
              Health: <code>{JSON.stringify(healthInfo)}</code>
            </span>
          )}

          {error && (
            <span className="hb-chip hb-chip--error hb-error-text">
              {error}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default HealthBar;
