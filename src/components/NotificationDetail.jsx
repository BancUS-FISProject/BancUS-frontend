export function NotificationDetail({ notification, onClose, onDelete }) {
  return (
    <div className="modal">
      <h2>{notification.title}</h2>

      <p>
        <b>Fecha:</b>{" "}
        {new Date(notification.createdAt).toLocaleString()}
      </p>

      <hr />

      <div>
        {notification.message.split("\n").map((line, i) => (
          <p key={i} style={{ margin: 0 }}>
            {line}
          </p>
        ))}
      </div>

      <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
        <button
          className="btn-secondary"
          onClick={() => onDelete(notification)}
        >
          🗑️ Borrar
        </button>

        <button className="btn-secondary" onClick={onClose}>
          ❌ Cerrar
        </button>
      </div>
    </div>
  );
}
