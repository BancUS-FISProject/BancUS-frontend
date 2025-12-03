import React, { useEffect, useState } from "react";

function EditCardModal({ card, onClose, onSave }) {
  const [cardholderName, setCardholderName] = useState(card.cardholderName);
  const [cardFreeze, setCardFreeze] = useState(
    card.cardFreeze === "Active" ? "active" : "frozen"
  );
  const [expirationDate, setExpirationDate] = useState(card.expirationDate);
  const [cvc, setCvc] = useState(card.CVC);

  useEffect(() => {
    setCardholderName(card.cardholderName);
    setCardFreeze(card.cardFreeze === "Active" ? "active" : "frozen");
    setExpirationDate(card.expirationDate);
    setCvc(card.CVC);
  }, [card]);

  function handleSubmit(e) {
    e.preventDefault();
    // Preparar payload para PUT /cards/:id
    const payload = {
      cardholderName,
      // el backend normaliza cardFreeze
      cardFreeze,
      expirationDate,
      CVC: cvc,
    };
    onSave(card._id, payload);
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Editar tarjeta</h2>
        <form onSubmit={handleSubmit} className="card-form">
          <label>
            Nombre del titular:
            <input
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
            />
          </label>

          <label>
            Estado:
            <select
              value={cardFreeze}
              onChange={(e) => setCardFreeze(e.target.value)}
            >
              <option value="active">Active</option>
              <option value="frozen">Frozen</option>
            </select>
          </label>

          <label>
            Fecha de expiración (MM/YY):
            <input
              type="text"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
            />
          </label>

          <label>
            CVC:
            <input
              type="text"
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
            />
          </label>

          <div className="form-buttons">
            <button type="submit">Guardar</button>
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCardModal;
