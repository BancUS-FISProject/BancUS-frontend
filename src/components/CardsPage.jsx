import React, { useEffect, useState } from "react";
import { cardsApi } from "../api";
import CardTable from "./CardTable";
import CardForm from "./CardForm";
import EditCardModal from "./EditCardModal";
import "./cardsPage.css";

function CardsPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [holderOptions, setHolderOptions] = useState([]);
  const [selectedHolder, setSelectedHolder] = useState("");

  const [isCreating, setIsCreating] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  function getLoggedUser() {
    if (typeof localStorage === "undefined") return null;
    try {
      const stored = localStorage.getItem("authUser");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  function getPan(card) {
    return card?.pan || card?.PAN || "";
  }

  useEffect(() => {
    loadMyCards();
  }, []);

  function updateHolderOptions(cardsList) {
    const names = Array.from(
      new Set((cardsList || []).map((c) => c.cardholderName).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, "es"));
    setHolderOptions(names);
  }

  // Cargar solo las tarjetas del usuario logueado
  async function loadMyCards() {
    setLoading(true);
    setError(null);

    const user = getLoggedUser();
    const holderName = user?.name?.trim();

    if (!holderName) {
      setCards([]);
      setHolderOptions([]);
      setSelectedHolder("");
      setError("No se encontró el usuario logueado (authUser.name). Inicia sesión de nuevo.");
      setLoading(false);
      return;
    }

    try {
      
      const data = await cardsApi.getByHolder(holderName);

      const list = Array.isArray(data) ? data : [];
      setCards(list);

            updateHolderOptions(list);
      setSelectedHolder(holderName);
    } catch (err) {
            if (err.status === 404) {
        setCards([]);
        setHolderOptions([holderName]);
        setSelectedHolder(holderName);
        setError(`No hay tarjetas para el titular "${holderName}"`);
      } else {
        console.error(err);
        setError(err.message || "Error cargando tarjetas");
        setCards([]);
        setHolderOptions([holderName]);
        setSelectedHolder(holderName);
      }
    } finally {
      setLoading(false);
    }
  }

    async function loadAllCards() {
    return loadMyCards();
  }

    async function loadCardsByHolder(name) {
    const user = getLoggedUser();
    const holderName = user?.name?.trim();

    if (!holderName) return;

        if (!name || name !== holderName) {
      setSelectedHolder(holderName);
      return loadMyCards();
    }

    return loadMyCards();
  }

    async function handleCreate(_cardholderNameFromForm) {
    const user = getLoggedUser();
    const holderName = user?.name?.trim();

    if (!holderName) {
      setError("No se encontró el usuario logueado para crear la tarjeta.");
      return;
    }

    try {
      setError(null);
      const created = await cardsApi.create(holderName);

            setCards((prev) => [...prev, created]);
      updateHolderOptions([...cards, created]);
      setSelectedHolder(holderName);

      setIsCreating(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error creando tarjeta");
    }
  }

  async function handleToggleFreeze(card) {
    const current = card.cardFreeze;
    const nextStatus = current === "Active" ? "frozen" : "active";

    const pan = getPan(card);
    if (!pan) {
      setError("PAN no disponible. No se puede congelar/descongelar esta tarjeta.");
      return;
    }

    try {
      setError(null);

            const updated = await cardsApi.setStatus(pan, nextStatus);

            setCards((prev) => prev.map((c) => (getPan(c) === pan ? updated : c)));
    } catch (err) {
      console.error(err);
      setError(err.message || "Error cambiando estado de la tarjeta");
    }
  }

  async function handleDelete(card) {
        const ok = window.confirm(
      `¿Seguro que quieres borrar la tarjeta ${card._id} de ${card.cardholderName}?`
    );
    if (!ok) return;

    try {
      setError(null);
      await cardsApi.deleteById(card._id);

      const updated = cards.filter((c) => c._id !== card._id);
      setCards(updated);
      updateHolderOptions(updated);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error borrando la tarjeta");
    }
  }

  async function handleSaveEdit(id, payload) {
    try {
      setError(null);
      const updated = await cardsApi.updateById(id, payload);

      const newCards = cards.map((c) => (c._id === id ? updated : c));
      setCards(newCards);
      updateHolderOptions(newCards);
      setEditingCard(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error actualizando la tarjeta");
    }
  }

  function handleHolderChange(e) {
    const value = e.target.value;
    setSelectedHolder(value);
    loadCardsByHolder(value);
  }

  return (
    <div className="cards-page">
      <header className="cards-header">
        <h1>Gestor de tarjetas</h1>
        <p>
          Interfaz React para gestionar tarjetas del microservicio: alta,
          filtrado, congelación y borrado.
        </p>
      </header>

      <section className="cards-actions">
        <div className="cards-actions-card">
          <div className="cards-filter-form">
            <label className="holder-select-label">
              <span>Filtrar por titular</span>
              <select
                className="holder-select"
                value={selectedHolder}
                onChange={handleHolderChange}
              >

                {holderOptions.length === 0 ? (
                  <option value="">Cargando titular...</option>
                ) : (
                  holderOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))
                )}
              </select>
            </label>

            <div className="cards-buttons">
              <button
                type="button"
                onClick={loadAllCards}
                className="btn-secondary"
              >
                Limpiar filtro
              </button>

              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="btn-primary"
              >
                Nueva tarjeta
              </button>
            </div>
          </div>
        </div>
      </section>

      {error && <div className="cards-error">Error: {error}</div>}

      <section className="cards-table-card">
        {loading ? (
          <div className="cards-loading">Cargando tarjetas…</div>
        ) : (
          <CardTable
            cards={cards}
            onToggleFreeze={handleToggleFreeze}
            onDelete={handleDelete}
            onEdit={setEditingCard}
          />
        )}
      </section>

      {isCreating && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Nueva tarjeta</h2>
            <CardForm
              onSubmit={handleCreate}
              onCancel={() => setIsCreating(false)}
            />
          </div>
        </div>
      )}

      {editingCard && (
        <EditCardModal
          card={editingCard}
          onClose={() => setEditingCard(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}


export default CardsPage;
