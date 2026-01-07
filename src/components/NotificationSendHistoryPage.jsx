import { useNavigate } from "react-router-dom";
import { notificationsApi } from "../api";
import "./NotificationsPage.css";

function NotificationSendHistoryPage() {
  const navigate = useNavigate();

  const authUser = JSON.parse(localStorage.getItem("authUser"));
  const userId = authUser?.iban;

  async function handleSend(mode) {
    try {
      const res = await notificationsApi.sendEvent({
        userId,
        type: "history-request",
        metadata: { mode: mode },
      });

      alert("Te hemos enviado tu historial a tu email");
      navigate("/notifications");

    } catch (e) {
      alert(
        e.message ||
        "No se pudo enviar el historial"
      );
    }
  }

  return (
    <div className="cards-page">

      <header className="cards-header">
        <h1>Enviar historial por email</h1>
        <p>Selecciona el tipo de historial que deseas recibir</p>
      </header>
      <div className="history-page">
        <section className="history-options">

          {/* HISTORIAL COMPLETO */}
          <div className="history-card">
            <h3>Historial completo</h3>
            <p>Incluye todas las transferencias enviadas y recibidas.</p>
            <button
              className="btn-history btn-all"
              onClick={() => handleSend("all")}
            >
              Enviar historial completo
            </button>
          </div>

          {/* SOLO ENVIADOS */}
          <div className="history-card">
            <h3>Solo enviados</h3>
            <p>Recibirás únicamente las transferencias que has enviado.</p>
            <button
              className="btn-history btn-sent"
              onClick={() => handleSend("sent")}
            >
              Enviar enviados
            </button>
          </div>

          {/* SOLO RECIBIDOS */}
          <div className="history-card">
            <h3>Solo recibidos</h3>
            <p>Recibirás únicamente las transferencias que has recibido.</p>
            <button
              className="btn-history btn-received"
              onClick={() => handleSend("received")}
            >
              Enviar recibidos
            </button>
          </div>

        </section>

      </div>

    </div>
  );
}

export default NotificationSendHistoryPage;
