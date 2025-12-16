import React, { useState, useEffect } from "react";
import { accountsApi } from "../api";
import AccountTable from "./AccountTable";
import AccountForm from "./AccountForm";
import EditAccountModal from "./EditAccountModal";
import ManageCardsModal from "./ManageCardsModal";
import UpdateBalanceModal from "./UpdateBalanceModal";
import "./AccountsPage.css";
function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estado de paginación
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0,
  });

  // Campo de búsqueda por IBAN
  const [searchIban, setSearchIban] = useState("");

  const [isCreating, setIsCreating] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [managingCards, setManagingCards] = useState(null);
  const [updatingBalance, setUpdatingBalance] = useState(null);

  // Cargar todas las cuentas al montar el componente
  useEffect(() => {
    loadAllAccounts(1, 10);
  }, []);

  // Cargar todas las cuentas (paginado)
  async function loadAllAccounts(page = 1, size = 10) {
    setLoading(true);
    setError(null);
    setSearchIban(""); // Limpiar búsqueda al cargar todas
    try {
      const data = await accountsApi.getAll(page, size);
      setAccounts(data.items || []);
      setPagination({
        page: data.page || page,
        size: data.size || size,
        total: data.total || 0,
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Error cargando cuentas");
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }

  // Buscar cuenta por IBAN
  async function handleSearch(e) {
    e?.preventDefault();
    if (!searchIban.trim()) {
      setError("Por favor, introduce un IBAN para buscar");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await accountsApi.getByIban(searchIban.trim());
      setAccounts(data ? [data] : []);
      setPagination({ page: 1, size: 10, total: data ? 1 : 0 });
    } catch (err) {
      if (err.status === 404) {
        setAccounts([]);
        setError(`No se encontró ninguna cuenta con el IBAN: ${searchIban}`);
      } else {
        console.error(err);
        setError(err.message || "Error buscando cuenta");
      }
    } finally {
      setLoading(false);
    }
  }

  // Limpiar búsqueda y recargar todas las cuentas
  function handleClearSearch() {
    setSearchIban("");
    setError(null);
    loadAllAccounts(1, 10);
  }

  // Crear cuenta
  async function handleCreate(accountData) {
    try {
      setError(null);
      const created = await accountsApi.create(accountData);
      console.log("Cuenta creada:", created);
      setIsCreating(false);
      // Recargar la lista de cuentas para mostrar la nueva
      loadAllAccounts(1, pagination.size);
    } catch (err) {
      console.error("Error creando cuenta:", err);
      setError(err.message || "Error creando cuenta");
    }
  }

  // Cambiar estado Bloqueada <-> Activa
  async function handleToggleBlock(account) {
    const isBlocked = account.isBlocked;
    const action = isBlocked ? "desbloquear" : "bloquear";

    try {
      setError(null);
      const response = isBlocked
        ? await accountsApi.unblock(account.iban)
        : await accountsApi.block(account.iban);

      // Si la API devuelve la cuenta actualizada, usarla; si no, actualizar localmente
      const updatedAccount = response && response.iban
        ? response
        : { ...account, isBlocked: !isBlocked };

      setAccounts((prev) =>
        prev.map((a) => (a.iban === account.iban ? updatedAccount : a))
      );
    } catch (err) {
      console.error(err);
      setError(err.message || `Error al ${action} la cuenta`);
    }
  }

  // Borrar cuenta
  async function handleDelete(account) {
    const ok = window.confirm(
      `¿Seguro que quieres borrar la cuenta ${account.iban} de ${account.name}?`
    );
    if (!ok) return;

    try {
      setError(null);
      await accountsApi.delete(account.iban);
      setAccounts((prev) => prev.filter((a) => a.iban !== account.iban));
    } catch (err) {
      console.error(err);
      setError(err.message || "Error borrando la cuenta");
    }
  }

  // Guardar cambios al editar
  async function handleSaveEdit(iban, payload) {
    try {
      setError(null);
      const updated = await accountsApi.update(iban, payload);
      setAccounts((prev) =>
        prev.map((a) => (a.iban === iban ? updated : a))
      );
      setEditingAccount(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error actualizando la cuenta");
    }
  }

  // Gestión de tarjetas
  async function handleCreateCard(iban) {
    try {
      setError(null);
      const updated = await accountsApi.createCard(iban);
      setAccounts((prev) =>
        prev.map((a) => (a.iban === iban ? updated : a))
      );
      setManagingCards(updated);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error creando tarjeta");
    }
  }

  async function handleDeleteCard(iban, pan) {
    try {
      setError(null);
      await accountsApi.deleteCard(iban, pan);
      // Recargar la cuenta para obtener la lista de tarjetas actualizada
      const updated = await accountsApi.getByIban(iban);
      setAccounts((prev) =>
        prev.map((a) => (a.iban === iban ? updated : a))
      );
      setManagingCards(updated);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error eliminando tarjeta");
    }
  }

  // Actualizar balance con divisa
  async function handleUpdateBalance(iban, amount, currency) {
    try {
      setError(null);
      const updated = await accountsApi.updateBalance(iban, amount, currency);
      setAccounts((prev) =>
        prev.map((a) => (a.iban === iban ? updated : a))
      );
      setUpdatingBalance(null);
    } catch (err) {
      console.error(err);
      if (err.status === 403) {
        setError("Fondos insuficientes para realizar la operación");
      } else {
        setError(err.message || "Error actualizando balance");
      }
    }
  }

  return (
    <div className="cards-page accounts-page">
      <header className="cards-header">
        <h1>Gestor de cuentas</h1>
        <p>Frontend React para el microservicio de cuentas</p>
      </header>

      <section className="cards-actions">
        <form className="cards-filter-form" onSubmit={handleSearch}>
          <label className="holder-select-label">
            <span>Buscar por IBAN:</span>
            <input
              type="text"
              className="iban-input"
              value={searchIban}
              onChange={(e) => setSearchIban(e.target.value)}
              placeholder="ES0000000000000000000000"
            />
          </label>

          <button type="submit" className="btn-secondary">
            Buscar
          </button>

          <button
            type="button"
            onClick={handleClearSearch}
            className="btn-secondary"
          >
            Limpiar
          </button>

          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="btn-primary"
          >
            Nueva cuenta
          </button>
        </form>
      </section>

      {error && <div className="cards-error">Error: {error}</div>}

      {loading ? (
        <div>Cargando cuentas...</div>
      ) : (
        <>
          <AccountTable
            accounts={accounts}
            onToggleBlock={handleToggleBlock}
            onDelete={handleDelete}
            onEdit={setEditingAccount}
            onManageCards={setManagingCards}
            onUpdateBalance={setUpdatingBalance}
          />

          {/* Controles de paginación */}
          {pagination.total > 0 && (
            <div className="pagination-controls">
              <span className="pagination-info">
                Mostrando {accounts.length} de {pagination.total} cuentas (Página {pagination.page} de {Math.ceil(pagination.total / pagination.size)})
              </span>
              <div className="pagination-buttons">
                <button
                  className="btn-secondary"
                  onClick={() => loadAllAccounts(pagination.page - 1, pagination.size)}
                  disabled={pagination.page <= 1}
                >
                  ← Anterior
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => loadAllAccounts(pagination.page + 1, pagination.size)}
                  disabled={pagination.page >= Math.ceil(pagination.total / pagination.size)}
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {isCreating && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Nueva cuenta</h2>
            <AccountForm
              onSubmit={handleCreate}
              onCancel={() => setIsCreating(false)}
            />
          </div>
        </div>
      )}

      {editingAccount && (
        <EditAccountModal
          account={editingAccount}
          onClose={() => setEditingAccount(null)}
          onSave={handleSaveEdit}
        />
      )}

      {managingCards && (
        <ManageCardsModal
          account={managingCards}
          onClose={() => setManagingCards(null)}
          onCreateCard={handleCreateCard}
          onDeleteCard={handleDeleteCard}
        />
      )}

      {updatingBalance && (
        <UpdateBalanceModal
          account={updatingBalance}
          onClose={() => setUpdatingBalance(null)}
          onUpdateBalance={handleUpdateBalance}
        />
      )}
    </div>
  );
}

export default AccountsPage;
