import React, { useEffect, useState } from "react";

function EditAccountModal({ account, onClose, onSave }) {
    const [name, setName] = useState(account.name || "");
    const [email, setEmail] = useState(account.email || "");
    const [subscription, setSubscription] = useState(account.subscription || "Free");

    useEffect(() => {
        setName(account.name || "");
        setEmail(account.email || "");
        setSubscription(account.subscription || "Free");
    }, [account]);

    function handleSubmit(e) {
        e.preventDefault();
        const payload = {};

        // Solo enviamos campos que han cambiado
        if (name !== account.name) payload.name = name;
        if (email !== account.email) payload.email = email;
        if (subscription !== account.subscription) payload.subscription = subscription;

        onSave(account.iban, payload);
    }

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <h2>Editar cuenta</h2>
                <form onSubmit={handleSubmit} className="card-form">
                    <label>
                        IBAN:
                        <input
                            type="text"
                            value={account.iban}
                            disabled
                            className="input-disabled"
                        />
                    </label>

                    <label>
                        Nombre del titular:
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </label>

                    <label>
                        Email:
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </label>

                    <label>
                        Suscripción:
                        <select
                            value={subscription}
                            onChange={(e) => setSubscription(e.target.value)}
                        >
                            <option value="Free">Free</option>
                            <option value="Basic">Basic</option>
                            <option value="Premium">Premium</option>
                            <option value="Enterprise">Enterprise</option>
                        </select>
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

export default EditAccountModal;
