import React, { useEffect, useState } from "react";
import { cardsApi } from "../api";
import CardTable from "./CardTable";
import CardForm from "./CardForm";
import EditCardModal from "./EditCardModal";

function CardsPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lista de titulares disponibles para el select
  const [holderOptions, setHolderOptions] = useState([]);
  const [selectedHolder, setSelectedHolder] = useState("");

  const [isCreating, setIsCreating] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  // Cargar todas las tarjetas al inicio
  useEffect(() => {
    loadAllCards();
  }, []);

  // Extraer titulares únicos y guardarlos ordenados
  function updateHolderOptions(cardsList) {
    const names = Array.from(
      new Set(
        (cardsList || [])
          .map((c) => c.cardholderName)
          .filter(Boolean) // quitamos undefined/null
      )
    ).sort((a, b) => a.localeCompare(b, "es"));
    setHolderOptions(names);
  }

  async function loadAllCards() {
    setLoading(true);
    setError(null);
    try {
      const data = await cardsApi.getAll();
      setCards(data || []);
      updateHolderOptions(data || []);
      setSelectedHolder(""); // “Todos los titulares”
    } catch (err) {
      console.error(err);
      setError(err.message || "Error cargando tarjetas");
      setCards([]);
      setHolderOptions([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadCardsByHolder(name) {
    if (!name) {
      return loadAllCards();
    }
    setLoading(true);
    setError(null);
    try {
      const data = await cardsApi.getByHolder(name);
      setCards(Array.isArray(data) ? data : []);
      // Opcional: mantenemos las opciones de titulares tal cual estaban
    } catch (err) {
      if (err.status === 404) {
        setCards([]);
        setError(`No hay tarjetas para el titular "${name}"`);
      } else {
        console.error(err);
        setError(err.message || "Error filtrando tarjetas");
      }
    } finally {
      setLoading(false);
    }
  }

  // Crear tarjeta
  async function handleCreate(cardholderName) {
    try {
      setError(null);
      const created = await cardsApi.create(cardholderName);
      setCards((prev) => [...prev, created]);
      // Actualizamos opciones de titulares
      updateHolderOptions([...cards, created]);
      setIsCreating(false);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error creando tarjeta");
    }
  }

  // Cambiar estado Active <-> Frozen
  async function handleToggleFreeze(card) {
    const current = card.cardFreeze; // "Active" o "Frozen"
    const nextStatus = current === "Active" ? "frozen" : "active";

    try {
      setError(null);
      const updated = await cardsApi.setStatus(card._id, nextStatus);
      setCards((prev) =>
        prev.map((c) => (c._id === card._id ? updated : c))
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Error cambiando estado de la tarjeta");
    }
  }

  // Borrar tarjeta
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

  // Guardar cambios al editar
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

  // Cambio del select de titular
  function handleHolderChange(e) {
    const value = e.target.value;
    setSelectedHolder(value);
    loadCardsByHolder(value);
  }

  return (
    <div className="cards-page">
      <header className="cards-header">
        <h1>Gestor de tarjetas</h1>
        <p>Frontend React para el microservicio de tarjetas</p>
      </header>

      <section className="cards-actions">
        <div className="cards-filter-form">
          <label className="holder-select-label">
            <span>Filtrar por titular:</span>
            <select
              className="holder-select"
              value={selectedHolder}
              onChange={handleHolderChange}
            >
              <option value="">Todos los titulares</option>
              {holderOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>

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
      </section>

      {error && <div className="cards-error">Error: {error}</div>}

      {loading ? (
        <div>Cargando tarjetas...</div>
      ) : (
        <CardTable
          cards={cards}
          onToggleFreeze={handleToggleFreeze}
          onDelete={handleDelete}
          onEdit={setEditingCard}
        />
      )}

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
