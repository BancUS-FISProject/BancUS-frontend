import React, { useState } from "react";

const CURRENCIES = [
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "USD", name: "Dólar estadounidense", symbol: "$" },
    { code: "GBP", name: "Libra esterlina", symbol: "£" },
    { code: "CHF", name: "Franco suizo", symbol: "CHF" },
    { code: "JPY", name: "Yen japonés", symbol: "¥" },
    { code: "CNY", name: "Yuan chino", symbol: "¥" },
    { code: "MXN", name: "Peso mexicano", symbol: "$" },
    { code: "ARS", name: "Peso argentino", symbol: "$" },
    { code: "BRL", name: "Real brasileño", symbol: "R$" },
    { code: "CAD", name: "Dólar canadiense", symbol: "C$" },
];

function UpdateBalanceModal({ account, onClose, onUpdateBalance }) {
    const [amount, setAmount] = useState("");
    const [currency, setCurrency] = useState("EUR");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount)) {
            return;
        }

        setIsSubmitting(true);
        await onUpdateBalance(account.iban, numAmount, currency);
        setIsSubmitting(false);
    }

    // Formatear balance actual
    function formatBalance(balance) {
        return new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "EUR",
        }).format(balance || 0);
    }

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <h2>Actualizar balance</h2>
                <p className="modal-subtitle">
                    <strong>Cuenta:</strong> {account.iban}
                </p>
                <p className="modal-subtitle">
                    <strong>Balance actual:</strong> {formatBalance(account.balance)}
                </p>

                <form onSubmit={handleSubmit} className="card-form">
                    <label>
                        Cantidad (positivo para ingresar, negativo para retirar):
                        <input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="100.00"
                            required
                        />
                    </label>

                    <label>
                        Divisa de la operación:
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                        >
                            {CURRENCIES.map((curr) => (
                                <option key={curr.code} value={curr.code}>
                                    {curr.code} - {curr.name} ({curr.symbol})
                                </option>
                            ))}
                        </select>
                    </label>

                    <div className="form-buttons">
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Procesando..." : "Actualizar balance"}
                        </button>
                        <button type="button" onClick={onClose} disabled={isSubmitting}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UpdateBalanceModal;
