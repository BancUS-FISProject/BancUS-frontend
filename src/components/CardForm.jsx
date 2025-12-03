import React, { useState } from "react";

function CardForm({ onSubmit, onCancel }) {
  const [cardholderName, setCardholderName] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!cardholderName.trim()) {
      return;
    }
    onSubmit(cardholderName.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="card-form">
      <label>
        Nombre del titular:
        <input
          type="text"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="Nombre completo..."
        />
      </label>

      <div className="form-buttons">
        <button type="submit">Crear</button>
        <button type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default CardForm;
