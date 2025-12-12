import React from "react";
import "./CardTable.css";

function CardTable({ cards, onToggleFreeze, onDelete, onEdit }) {
  if (!cards || cards.length === 0) {
    return (
      <p className="cards-empty">
        No hay tarjetas registradas en este momento.
      </p>
    );
  }

  return (
    <div className="cards-table-wrapper">
      <table className="cards-table" aria-label="Listado de tarjetas">
        <thead>
          <tr>
            <th>ID</th>
            <th>card_id</th>
            <th>Titular</th>
            <th>PAN</th>
            <th>Expira</th>
            <th>CVC</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {cards.map((card) => {
            const isActive = card.cardFreeze === "Active";
            const freezeLabel = isActive ? "Congelar" : "Descongelar";

            const pan =
              card.pan ?? card.PAN ?? card.cardPan ?? card.cardNumber ?? "";
            const expiry =
              card.expiry ??
              card.expiration ??
              card.expirationDate ??
              card.expira ??
              "";
            const cvc = card.cvc ?? card.CVC ?? "";

            return (
              <tr key={card._id}>
                <td>{card._id}</td>
                <td>{card.card_id ?? card.cardId}</td>
                <td>{card.cardholderName}</td>
                <td>{pan}</td>
                <td>{expiry}</td>
                <td>{cvc}</td>
                <td>
                  <span
                    className={
                      "card-status-pill " +
                      (isActive
                        ? "card-status-pill--ok"
                        : "card-status-pill--frozen")
                    }
                  >
                    {card.cardFreeze}
                  </span>
                </td>
                <td>
                  <div className="cards-table-actions">
                    <button
                      type="button"
                      className="card-action-btn card-action-freeze"
                      onClick={() => onToggleFreeze(card)}
                    >
                      {freezeLabel}
                    </button>
                    <button
                      type="button"
                      className="card-action-btn card-action-edit"
                      onClick={() => onEdit(card)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="card-action-btn card-action-delete"
                      onClick={() => onDelete(card)}
                    >
                      Borrar
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default CardTable;
