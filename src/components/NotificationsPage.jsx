import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NotificationsTable from "./NotificationsTable";
import { NotificationDetail } from "./NotificationDetail";

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);


  const authUser = JSON.parse(localStorage.getItem("authUser"));
  const userId = authUser?.iban;
  const isPro = authUser?.plan === "pro";
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  }, [userId]);

  async function loadNotifications() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `http://localhost:10000/v1/notifications/user/${userId}`
      );

      if (!res.ok) {
        throw new Error("Error cargando notificaciones");
      }

      const data = await res.json();
      // solo notificaciones cuyo email se ha enviado
      const visibleNotifications = data.filter(
        (n) => n.email_sent !== false
);

setNotifications(visibleNotifications);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error cargando notificaciones");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendHistoryEmail() {
    try {
      const month = new Date().toISOString().slice(0, 7);

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

      if (res.status === 403) {
        alert(
          "Esta funcionalidad solo está disponible para usuarios con plan Pro."
        );
        return;
      }

      if (!res.ok) {
        throw new Error("Error enviando el historial");
      }

      alert("Te hemos enviado el historial de este mes a tu email");
    } catch (err) {
      alert("No se pudo enviar el historial. Inténtalo más tarde.");
    }
  }

  async function handleDeleteNotification(notification) {
    if (!window.confirm("¿Seguro que quieres borrar esta notificación?")) return;

    try {
      const res = await fetch(
        `http://localhost:10000/v1/notifications/${notification.id}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        throw new Error("Error al borrar la notificación");
      }

      // Quitarla del estado local
      setNotifications((prev) =>
        prev.filter((n) => n.id !== notification.id)
      );

    } catch (err) {
      console.error(err);
      alert("No se pudo borrar la notificación");
    }
  }

  function handleSelectNotification(notification) {
    // Abrir el detalle
    setSelectedNotification(notification);

    // Marcar como leída SOLO en frontend
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id
          ? { ...n, read: true }
          : n
      )
    );
  }


  return (
    <div className="cards-page">
      <header className="cards-header">
        <h1>Notificaciones</h1>
        <p>Historial de notificaciones del usuario</p>
      </header>

      <section className="cards-actions">
        <button
          className="btn-secondary"
          onClick={() => navigate("/notifications/send-history")}
          disabled={!isPro}
        >
          Enviar historial a mi email
        </button>
      </section>

      {error && <div className="cards-error">Error: {error}</div>}

      {loading ? (
        <div>Cargando notificaciones...</div>
      ) : (
        <NotificationsTable
          notifications={notifications}
          onSelect={handleSelectNotification}
          onDelete={handleDeleteNotification}
          //onResend={handleResendNotification}
        />
      )}

      {selectedNotification && (
        <div className="modal-backdrop">
          <NotificationDetail
            notification={selectedNotification}
            onClose={() => setSelectedNotification(null)}
            onDelete={(notification) => {
              handleDeleteNotification(notification);
              setSelectedNotification(null);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;
