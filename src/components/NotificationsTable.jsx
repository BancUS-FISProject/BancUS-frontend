import React from "react";
import "./NotificationsPage.css";

const TYPE_LABELS = {
  "login": "Inicio de sesión",
  "transaction-ok": "Pago realizado",
  "transaction-failed": "Pago fallido",
  "history-request": "Solicitud de historial",
  "fraud-detected": "Alerta de fraude",
};

function NotificationsTable({ notifications, onSelect, onDelete }) {
  if (!notifications || notifications.length === 0) {
    return <p>No hay notificaciones para mostrar.</p>;
  }

  function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <table className="cards-table">

      <colgroup>
        <col style={{ width: "20%" }} /> {/* TIPO */}
        <col style={{ width: "35%" }} /> {/* TÍTULO */}
        <col style={{ width: "15%" }} /> {/* FECHA */}
        <col style={{ width: "15%" }} /> {/* ESTADO */}
        <col style={{ width: "25%" }} /> {/* ACCIONES */}
      </colgroup>
      <thead>
        <tr>
          <th>Tipo</th>
          <th>Título</th>
          <th>Fecha</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {notifications.map((n) => (
          <tr key={n.id} onClick={() => onSelect(n)}>
            <td>{TYPE_LABELS[n.type] || n.type}</td>
            <td>{n.title}</td>
            <td>{formatDate(n.createdAt)}</td>
            <td>
              <span
                className={
                  n.read ? "badge badge-active" : "badge badge-frozen"
                }
              >
                {n.read ? "Leída" : "Nueva"}
              </span>
            </td>
            <td className="actions-cell">
                <button
                className="icon-btn"
                title="Borrar notificación"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(n);
                }}
                >
                🗑️
            </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default NotificationsTable;
