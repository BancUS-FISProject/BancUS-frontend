import React, { useState } from "react";

function ManageCardsModal({ account, onClose, onCreateCard, onDeleteCard }) {
    const [isCreating, setIsCreating] = useState(false);
    const [cardToDelete, setCardToDelete] = useState(null);

    const cards = account.cards || [];

    async function handleCreateCard() {
        setIsCreating(true);
        await onCreateCard(account.iban);
        setIsCreating(false);
    }

    async function handleDeleteCard(pan) {
        setCardToDelete(pan);
        await onDeleteCard(account.iban, pan);
        setCardToDelete(null);
    }



    return (
        <div className="modal-backdrop">
            <div className="modal modal-wide">
                <h2>Tarjetas de la cuenta</h2>
                <p className="modal-subtitle">
                    <strong>IBAN:</strong> {account.iban}
                </p>
                <p className="modal-subtitle">
                    <strong>Titular:</strong> {account.name}
                </p>

                {cards.length === 0 ? (
                    <p className="no-cards-message">
                        Esta cuenta no tiene tarjetas asociadas.
                    </p>
                ) : (
                    <table className="cards-table cards-mini-table">
                        <thead>
                            <tr>
                                <th>PAN</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cards.map((item, index) => {
                                // Manejar si el item es un objeto { PAN: "..." } o un string directo
                                const panString = typeof item === "object" ? (item.PAN || item.pan) : item;

                                return (
                                    <tr key={panString || index}>
                                        <td style={{ fontFamily: "monospace", fontSize: "1.1em" }}>{panString}</td>
                                        <td>
                                            <button
                                                onClick={() => handleDeleteCard(panString)}
                                                disabled={cardToDelete === panString}
                                                className="btn-danger"
                                            >
                                                {cardToDelete === panString ? "Eliminando..." : "Eliminar"}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                <div className="form-buttons" style={{ marginTop: "1rem" }}>
                    <button
                        onClick={handleCreateCard}
                        disabled={isCreating}
                        className="btn-primary"
                    >
                        {isCreating ? "Creando..." : "Nueva tarjeta"}
                    </button>
                    <button type="button" onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ManageCardsModal;
