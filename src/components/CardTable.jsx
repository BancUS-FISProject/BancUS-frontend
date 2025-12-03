import React from "react";

function CardTable({ cards, onToggleFreeze, onDelete, onEdit }) {
  if (!cards || cards.length === 0) {
    return <p>No hay tarjetas para mostrar.</p>;
  }

  return (
    <table className="cards-table">
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
        {cards.map((card) => (
          <tr key={card._id}>
            <td>{card._id}</td>
            <td>{card.card_id}</td>
            <td>{card.cardholderName}</td>
            <td>{card.PAN}</td>
            <td>{card.expirationDate}</td>
            <td>{card.CVC}</td>
            <td>
              <span
                className={
                  card.cardFreeze === "Active"
                    ? "badge badge-active"
                    : "badge badge-frozen"
                }
              >
                {card.cardFreeze}
              </span>
            </td>
            <td>
              <button onClick={() => onToggleFreeze(card)}>
                {card.cardFreeze === "Active" ? "Congelar" : "Descongelar"}
              </button>
              <button onClick={() => onEdit(card)}>Editar</button>
              <button onClick={() => onDelete(card)}>Borrar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default CardTable;
