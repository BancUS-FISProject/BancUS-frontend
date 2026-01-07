import React, { useState } from "react";

function AccountForm({ onSubmit, onCancel }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subscription, setSubscription] = useState("basico");

    function handleSubmit(e) {
        e.preventDefault();
        if (!name.trim() || !email.trim()) {
            return;
        }
        onSubmit({
            name: name.trim(),
            email: email.trim(),
            subscription,
        });
    }

    return (
        <form onSubmit={handleSubmit} className="card-form">
            <label>
                Nombre del titular:
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre completo..."
                    required
                />
            </label>

            <label>
                Email:
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    required
                />
            </label>

            <label>
                Suscripción:
                <select
                    value={subscription}
                    onChange={(e) => setSubscription(e.target.value)}
                >
                    <option value="basico">basico</option>
                    <option value="premium">premium</option>
                    <option value="pro">pro</option>
                </select>
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

export default AccountForm;
