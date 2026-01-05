import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function NotificationSendHistoryPage() {
  const navigate = useNavigate();

  const authUser = JSON.parse(localStorage.getItem("authUser"));
  const userId = authUser?.iban;

  const [month, setMonth] = useState("");

  useEffect(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    setMonth(currentMonth);
  }, []);

  async function handleConfirmSend() {
    try {
      if (!month) {
        alert("Selecciona un mes");
        return;
      }

      const res = await fetch(
        "http://localhost:10000/v1/notifications/events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            type: "history-request",
            metadata: {
              month: month,
            },
          }),
        }
      );

      if (!res.ok) {
        throw new Error();
      }

      alert(`Te hemos enviado el historial de ${month} a tu email`);
      navigate("/notifications");
    } catch {
      alert("No se pudo enviar el historial");
    }
  }

  return (
    <div className="cards-page">
      <header className="cards-header">
        <h1>Enviar historial por email</h1>
        <p>Selecciona el mes del que deseas recibir el historial</p>
      </header>

      <section className="cards-actions">
        <label>
          Mes:{' '}
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </label>
      </section>

      <section className="history-actions">
        <button className="btn-secondary" onClick={() => navigate("/notifications")}>
          Cancelar
        </button>
        <button className="btn-primary" onClick={handleConfirmSend}>
          Enviar historial
        </button>
      </section>
    </div>
  );
}

export default NotificationSendHistoryPage;