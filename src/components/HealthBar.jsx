// src/components/HealthBar.jsx
import React, { useEffect, useState } from "react";
import { healthApi, API_BASE } from "../api";

function HealthBar() {
  const [cacheOk, setCacheOk] = useState(null);
  const [healthInfo, setHealthInfo] = useState(null);
  const [error, setError] = useState(null);

  async function checkHealth() {
    setError(null);
    try {
      // Pongamos que si no lanza error está OK
      await healthApi.pingCache();
      setCacheOk(true);
    } catch (err) {
      console.error(err);
      setCacheOk(false);
      setError("Error en caché o ping");
    }

    try {
      const data = await healthApi.health();
      setHealthInfo(data);
    } catch (err) {
      console.error(err);
      setError((prev) => prev || "Error en health");
    }
  }

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="health-bar">
      <span className="api-base">
        API: <code>{API_BASE}</code>
      </span>

      <button onClick={checkHealth}>Refrescar estado</button>

      <span className="health-indicator">
        Caché:{" "}
        {cacheOk === null ? (
          "..."
        ) : cacheOk ? (
          <span className="badge badge-ok">OK</span>
        ) : (
          <span className="badge badge-error">ERROR</span>
        )}
      </span>

      {healthInfo && (
        <span className="health-json">
          Health: <code>{JSON.stringify(healthInfo)}</code>
        </span>
      )}

      {error && <span className="health-error">Error: {error}</span>}
    </div>
  );
}

export default HealthBar;
