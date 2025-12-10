import React from "react";

function AccountTable({ accounts, onToggleBlock, onDelete, onEdit, onManageCards, onUpdateBalance }) {
    if (!accounts || accounts.length === 0) {
        return <p>No hay cuentas para mostrar.</p>;
    }

    // Formatear fecha
    function formatDate(dateString) {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    }

    // Formatear balance
    function formatBalance(balance) {
        return new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "EUR",
        }).format(balance || 0);
    }

    return (
        <table className="cards-table">
            <thead>
                <tr>
                    <th>IBAN</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Suscripción</th>
                    <th>Balance</th>
                    <th>Tarjetas</th>
                    <th>Fecha creación</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {accounts.map((account) => (
                    <tr key={account.iban}>
                        <td title={account.iban}>{account.iban?.slice(-8) || "-"}</td>
                        <td>{account.name}</td>
                        <td>{account.email}</td>
                        <td>
                            <span className={`badge badge-${account.subscription?.toLowerCase() || 'free'}`}>
                                {account.subscription || "Free"}
                            </span>
                        </td>
                        <td className={account.balance < 0 ? "balance-negative" : "balance-positive"}>
                            {formatBalance(account.balance)}
                        </td>
                        <td>
                            <button
                                className="btn-link"
                                onClick={() => onManageCards(account)}
                                title="Gestionar tarjetas"
                            >
                                {account.cards?.length || 0} tarjeta(s)
                            </button>
                        </td>
                        <td>{formatDate(account.creation_date)}</td>
                        <td>
                            <span
                                className={
                                    account.isBlocked
                                        ? "badge badge-frozen"
                                        : "badge badge-active"
                                }
                            >
                                {account.isBlocked ? "Bloqueada" : "Activa"}
                            </span>
                        </td>
                        <td>
                            <button onClick={() => onToggleBlock(account)}>
                                {account.isBlocked ? "Desbloquear" : "Bloquear"}
                            </button>
                            <button onClick={() => onUpdateBalance(account)}>
                                Operar
                            </button>
                            <button onClick={() => onEdit(account)}>Editar</button>
                            <button onClick={() => onDelete(account)}>Borrar</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default AccountTable;
