import React, { useState, useEffect } from "react";
import { transfersApi } from "../api";
// Importamos estilos de AccountsPage para reutilizar la tabla y botones
import "./AccountsPage.css";

function TransactionsPage() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // "Context" or Identity IBAN
  const [identityIban, setIdentityIban] = useState("");
  const [isIdentityLocked, setIsIdentityLocked] = useState(false);

  const [filter, setFilter] = useState("all"); // all, sent, received

  // Modal states
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);

  // Toast state
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }

  // New transfer form
  const [newTransfer, setNewTransfer] = useState({
    receiver: "",
    quantity: 0,
  });

  // Clear toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Effect to load transfers when identity changes and is locked
  useEffect(() => {
    if (isIdentityLocked && identityIban) {
      loadTransfers(identityIban);
    } else {
      setTransfers([]);
    }
  }, [isIdentityLocked, identityIban]);

  async function loadTransfers(iban) {
    setLoading(true);
    setError(null);
    try {
      // Use the single endpoint to fetch all transactions for the user
      const data = await transfersApi.getByUser(iban);

      const all = (Array.isArray(data) ? data : []).sort((a, b) => {
        // Sort desc by ID if no date, or date if available
        return (b.id || 0) - (a.id || 0);
      });

      setTransfers(all);
    } catch (err) {
      console.error(err);
      setError("Error cargando transferencias. Verifica que el microservicio esté en el puerto 8001.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!identityIban) {
      showToast("Falta el IBAN de identidad.", "error");
      return;
    }

    try {
      const payload = {
        sender: identityIban,
        receiver: newTransfer.receiver,
        quantity: newTransfer.quantity
      };

      await transfersApi.create(payload);

      showToast("Transferencia realizada con éxito", "success");
      setIsCreating(false);
      setNewTransfer({ receiver: "", quantity: 0 });
      loadTransfers(identityIban);
    } catch (err) {
      console.error(err);
      showToast(err.message || "Error realizando la transferencia", "error");
    }
  }

  async function handleRevert(e, id) {
    e.stopPropagation(); // Prevent opening details
    if (!window.confirm("¿Seguro que quieres revertir esta transacción?")) return;

    try {
      await transfersApi.revert(id);
      showToast("Transacción revertida correctamente", "success");
      loadTransfers(identityIban);
      if (selectedTransfer && selectedTransfer.id === id) setSelectedTransfer(null);
    } catch (err) {
      console.error(err);
      showToast(err.message || "Error al revertir la transacción", "error");
    }
  }

  async function handleDelete(e, id) {
    e.stopPropagation(); // Prevent opening details
    if (!window.confirm("¿Seguro que quieres eliminar esta transacción?")) return;

    try {
      await transfersApi.delete(id);
      showToast("Transacción eliminada correctamente", "success");
      loadTransfers(identityIban);
      if (selectedTransfer && selectedTransfer.id === id) setSelectedTransfer(null);
    } catch (err) {
      console.error(err);
      showToast(err.message || "Error al eliminar la transacción", "error");
    }
  }

  function showToast(message, type = "info") {
    setToast({ message, type });
  }

  const handleSetIdentity = (e) => {
    e.preventDefault();
    if (identityIban.trim()) {
      setIsIdentityLocked(true);
      setError(null);
    }
  };

  const filteredTransfers = transfers.filter(t => {
    if (filter === "all") return true;
    // Determine direction based on identityIban
    const isSent = t.sender === identityIban;
    const isReceived = t.receiver === identityIban;

    if (filter === "sent") return isSent;
    if (filter === "received") return isReceived;
    return true;
  });

  return (
    <div className="accounts-page" style={{ position: "relative" }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          background: toast.type === "error" ? "#fee2e2" : "#dcfce7",
          color: toast.type === "error" ? "#b91c1c" : "#15803d",
          padding: "1rem",
          borderRadius: "8px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          zIndex: 9999,
          fontWeight: "500",
          border: `1px solid ${toast.type === "error" ? "#fecaca" : "#bbf7d0"}`
        }}>
          {toast.message}
        </div>
      )}

      <header className="cards-header">
        <h1>Transacciones</h1>
        <p>Historial y operaciones</p>
      </header>

      {/* Identity Section */}
      <section className="cards-actions" style={{ background: "#fff", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem", border: "1px solid #eee" }}>
        <form onSubmit={handleSetIdentity} className="cards-filter-form" style={{ width: "100%" }}>
          <label className="holder-select-label" style={{ flex: 1 }}>
            <span>Mi IBAN (Identidad):</span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                className="iban-input"
                style={{ flex: 1, padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
                value={identityIban}
                onChange={(e) => setIdentityIban(e.target.value)}
                disabled={isIdentityLocked}
                placeholder="Ej: ES5424023756095653471493"
                required
              />
              {isIdentityLocked ? (
                <button type="button" className="btn-secondary" onClick={() => { setIsIdentityLocked(false); setTransfers([]); }}>Cambiar</button>
              ) : (
                <button type="submit" className="btn-primary">Fijar y Cargar</button>
              )}
            </div>
          </label>
        </form>
      </section>

      <section className="cards-actions">
        <div className="cards-filter-form">
          <button
            className={`btn-secondary ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
            disabled={!isIdentityLocked}
            style={filter === 'all' ? { background: '#e0e7ff', color: '#3730a3', fontWeight: 'bold' } : {}}
          >
            Todas
          </button>

          <button
            className={`btn-secondary ${filter === 'sent' ? 'active' : ''}`}
            onClick={() => setFilter('sent')}
            disabled={!isIdentityLocked}
            style={filter === 'sent' ? { background: '#e0e7ff', color: '#3730a3', fontWeight: 'bold' } : {}}
          >
            Enviadas
          </button>
          <button
            className={`btn-secondary ${filter === 'received' ? 'active' : ''}`}
            onClick={() => setFilter('received')}
            disabled={!isIdentityLocked}
            style={filter === 'received' ? { background: '#e0e7ff', color: '#3730a3', fontWeight: 'bold' } : {}}
          >
            Recibidas
          </button>
        </div>

        <button
          className="btn-primary"
          onClick={() => {
            if (!isIdentityLocked) { showToast("Fija tu IBAN primero para operar.", "error"); return; }
            setIsCreating(true)
          }}
        >
          Nueva Transferencia
        </button>
      </section>

      {error && <div className="cards-error">{error}</div>}

      <div className="cards-table-wrapper">
        <table className="cards-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Origen</th>
              <th>Destino</th>
              <th>Cantidad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {!isIdentityLocked ? (
              <tr><td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "#666" }}>Introduce tu IBAN arriba para ver tus movimientos</td></tr>
            ) : loading ? (
              <tr><td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>Cargando movimientos...</td></tr>
            ) : filteredTransfers.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>No se encontraron movimientos para este IBAN</td></tr>
            ) : (
              filteredTransfers.map((t) => (
                <tr key={t.id || Math.random()}>
                  <td>{t.id}</td>
                  <td>
                    {t.sender === identityIban ? <span className="badge badge-ok">Yo</span> : t.sender}
                  </td>
                  <td>
                    {t.receiver === identityIban ? <span className="badge badge-ok">Yo</span> : t.receiver}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: "bold", color: t.sender === identityIban ? "#d32f2f" : "#1b5e20" }}>
                    {t.sender === identityIban ? "-" : "+"}{t.quantity} €
                  </td>
                  <td>{t.status || "Completada"}</td>
                  <td>
                    <div className="cards-table-actions">
                      <button
                        className="card-action-btn card-action-edit"
                        onClick={() => setSelectedTransfer(t)}
                        title="Ver detalles"
                        style={{ marginRight: "0.25rem" }}
                      >
                        Ver
                      </button>

                      {t.sender === identityIban && (
                        <>
                          <button
                            className="card-action-btn card-action-freeze"
                            onClick={(e) => handleRevert(e, t.id)}
                            title="Revertir"
                            style={{ marginRight: "0.25rem", background: "#eef2ff", color: "#3730a3" }}
                          >
                            Rev
                          </button>
                          <button
                            className="card-action-btn card-action-delete"
                            onClick={(e) => handleDelete(e, t.id)}
                            title="Eliminar"
                          >
                            ✕
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Nueva Transferencia */}
      {isCreating && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Nueva Transferencia</h2>
            <div style={{ background: "#f0fdf4", padding: "0.5rem", borderRadius: "4px", marginBottom: "1rem", fontSize: "0.9rem", color: "#14532d" }}>
              Origen: <strong>{identityIban}</strong>
            </div>

            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: ".5rem" }}>IBAN Destino</label>
                <input
                  type="text"
                  className="iban-input"
                  style={{ width: "100%", padding: ".5rem" }}
                  value={newTransfer.receiver}
                  onChange={(e) => setNewTransfer({ ...newTransfer, receiver: e.target.value })}
                  required
                  placeholder="ES..."
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: ".5rem" }}>Cantidad (€)</label>
                <input
                  type="number"
                  style={{ width: "100%", padding: ".5rem" }}
                  value={newTransfer.quantity}
                  onChange={(e) => setNewTransfer({ ...newTransfer, quantity: parseFloat(e.target.value) })}
                  required
                  min="0.01"
                  step="0.01"
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1.5rem" }}>
                <button type="button" className="btn-secondary" onClick={() => setIsCreating(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">Enviar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalles */}
      {selectedTransfer && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Detalle de Transferencia</h2>
            <div style={{ marginBottom: "1rem", lineHeight: "1.6" }}>
              <p><strong>ID:</strong> {selectedTransfer.id}</p>
              <p><strong>Origen:</strong> {selectedTransfer.sender}</p>
              <p><strong>Destino:</strong> {selectedTransfer.receiver}</p>
              <p><strong>Cantidad:</strong> {selectedTransfer.quantity} €</p>
              <p><strong>Estado:</strong> {selectedTransfer.status || "Completada"}</p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              {selectedTransfer.sender === identityIban && (
                <>
                  <button
                    className="btn-secondary"
                    style={{ color: "#b91c1c", borderColor: "#fecaca", background: "#fef2f2" }}
                    onClick={(e) => { handleDelete(e, selectedTransfer.id); }}
                  >
                    Eliminar
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ color: "#1d4ed8", borderColor: "#c7d2fe", background: "#eef2ff" }}
                    onClick={(e) => { handleRevert(e, selectedTransfer.id); }}
                  >
                    Revertir
                  </button>
                </>
              )}
              <button
                className="btn-secondary"
                onClick={() => setSelectedTransfer(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default TransactionsPage;
