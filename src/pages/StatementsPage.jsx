import React, { useEffect, useState } from "react";
import "./StatementsPage.css";

// NOTE: replaced mock data with real accountNumber and API call for months
const API_BASE = "http://localhost:3000";

function StatementsPage() {
    // cuenta de prueba (usar como id en el endpoint)
    const accountNumber = 1500;
    const [accounts, setAccounts] = useState([]);

    const [selectedAccount, setSelectedAccount] = useState(null);
    const [months, setMonths] = useState([]);
    // ahora guardamos Id y label del mes seleccionado
    const [selectedMonthId, setSelectedMonthId] = useState("");
    const [selectedMonthLabel, setSelectedMonthLabel] = useState("");
    // status por seccion
    const [listStatus, setListStatus] = useState("");
    const [updateStatus, setUpdateStatus] = useState("");
    const [deleteStatus, setDeleteStatus] = useState("");
    const [generateStatus, setGenerateStatus] = useState("");

    const listAccounts = async () => {
        try {
            // usar la variable `accountNumber` como la única cuenta disponible
            const acc = { id: String(accountNumber), name: `Cuenta ${accountNumber}` };
            setAccounts([acc]);
            setSelectedAccount(acc);
            setListStatus(`1 cuenta disponible: ${acc.name}`);
        } catch (e) {
            console.error('StatementsPage.listAccounts error', e);
            setListStatus("Error al listar cuentas");
        }
    };

    // auto-list accounts on mount
    useEffect(() => {
        listAccounts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // load months when selectedAccount changes
    useEffect(() => {
        if (!selectedAccount) {
            setMonths([]);
            setSelectedMonthId("");
            setSelectedMonthLabel("");
            return;
        }

        let mounted = true;
        const load = async () => {
            try {
                setListStatus("Cargando meses...");
                // use relative path (Vite dev proxy configured) to avoid CORS in development
                const res = await fetch(`/v1/bankstatemens/by-account/${accountNumber}`);
                if (!res.ok) throw new Error(`status ${res.status}`);
                const json = await res.json();
                const m = Array.isArray(json.months) ? json.months : [];
                if (mounted) {
                    setMonths(m);
                    // seleccionar el primer mes por Id y almacenar su label
                    if (m.length > 0) {
                        setSelectedMonthId(m[0].Id);
                        setSelectedMonthLabel(m[0].month_name);
                    } else {
                        setSelectedMonthId("");
                        setSelectedMonthLabel("");
                    }
                    setListStatus("");
                }
            } catch (e) {
                console.error('StatementsPage.load months error', e);
                if (mounted) setListStatus('Error cargando meses');
            }
        };
        load();
        return () => (mounted = false);
    }, [selectedAccount]);

    // fetch statement detail when a month (Id) is selected
    useEffect(() => {
        if (!selectedMonthId) {
            setStatementDetail(null);
            setDetailStatus("");
            return;
        }

        let mounted = true;
        const loadDetail = async () => {
            try {
                setDetailStatus('Cargando detalle...');
                const res = await fetch(`/v1/bankstatemens/${selectedMonthId}`);
                if (!res.ok) throw new Error(`status ${res.status}`);
                const json = await res.json();
                if (mounted) {
                    setStatementDetail(json);
                    setDetailStatus('');
                }
            } catch (e) {
                console.error('StatementsPage.load detail error', e);
                if (mounted) setDetailStatus('Error cargando detalle');
            }
        };
        loadDetail();
        return () => (mounted = false);
    }, [selectedMonthId]);

    // statement name storage (simulado)
    const [statementNames, setStatementNames] = useState({});
    const [editingMode, setEditingMode] = useState(false);
    const [editingName, setEditingName] = useState("");
    // borrar: input y confirmacion
    const [deleteInput, setDeleteInput] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [generatedSummary, setGeneratedSummary] = useState(null);
    const [statementDetail, setStatementDetail] = useState(null);
    const [detailStatus, setDetailStatus] = useState("");

    const startEditing = () => {
        if (!selectedAccount || !selectedMonthId) return setUpdateStatus("Selecciona cuenta y mes");
        const key = `${selectedAccount.id}-${selectedMonthId}`;
        setEditingName(statementNames[key] || `Estado ${selectedMonthLabel}`);
        setEditingMode(true);
        setUpdateStatus("");
    };

    const saveEditing = () => {
        if (!selectedAccount || !selectedMonthId) return setUpdateStatus("Selecciona cuenta y mes");
        const key = `${selectedAccount.id}-${selectedMonthId}`;
        setStatementNames((s) => ({ ...s, [key]: editingName }));
        setEditingMode(false);
        setUpdateStatus(`Nombre actualizado: ${editingName}`);
    };

    const cancelEditing = () => {
        setEditingMode(false);
        setEditingName("");
        setUpdateStatus("");
    };

    const handleGenerate = () => {
        if (!selectedAccount || !selectedMonthId) return setGenerateStatus("Selecciona cuenta y mes");
        setGenerateStatus(`Generando estado para ${selectedAccount.name} (${selectedMonthLabel})...`);

        // Simular resumen: ingresos, egresos y saldo
        setTimeout(() => {
            const income = Math.floor(500 + Math.random() * 4500);
            const expense = Math.floor(200 + Math.random() * 3000);
            const balance = income - expense;
            setGeneratedSummary({ income, expense, balance });
            setGenerateStatus("Estado generado (simulado)");
        }, 700);
    };

    // handleUpdate removed: actualizaciones se realizan vía editor (saveEditing)

    const handleDelete = () => {
        if (!selectedAccount || !selectedMonthId) return setDeleteStatus("Selecciona cuenta y mes");
        if (!deleteInput) return setDeleteStatus("Ingresa nombre o código a eliminar");
        // mostrar confirmación inline
        setDeleteConfirm(true);
        setDeleteStatus(`¿Borrar "${deleteInput}" de ${selectedAccount.name} (${selectedMonthLabel})? Confirma.`);
    };

    const confirmDelete = () => {
        setDeleteStatus(`Borrando ${deleteInput}...`);
        setDeleteConfirm(false);
        setTimeout(() => {
            setDeleteStatus("Estado borrado (simulado)");
            setDeleteInput("");
        }, 700);
    };

    const cancelDelete = () => {
        setDeleteConfirm(false);
        setDeleteStatus("Eliminación cancelada");
    };

    return (
        <main className="statements-page">
            <header className="page-header">
                <h1>Historial</h1>
                <p>Consulta y descarga tus estados de cuenta.</p>
            </header>

            <section className="statements-grid" aria-label="Panel de estados de cuenta">
                {/* 1) Listar cuentas y meses disponibles */}
                <div className="stat-section" id="list-section">
                    <h2>Seleccionar cuenta y mes</h2>
                    <div className="select-wrap">
                        <label htmlFor="account-select">Cuenta</label>
                        <select
                            id="account-select"
                            value={selectedAccount ? selectedAccount.id : ""}
                            onChange={(e) => {
                                const acc = accounts.find((a) => a.id === e.target.value);
                                setSelectedAccount(acc || null);
                            }}
                            aria-label="Seleccionar cuenta"
                        >
                            <option value="">-- Selecciona cuenta --</option>
                            {accounts.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="select-wrap">
                        <label htmlFor="month-select">Mes</label>
                        <select
                            id="month-select"
                            value={selectedMonthId}
                            onChange={(e) => {
                                const m = months.find((mm) => mm.Id === e.target.value);
                                setSelectedMonthId(e.target.value);
                                setSelectedMonthLabel(m ? m.month_name : "");
                            }}
                            aria-label="Seleccionar mes"
                            disabled={months.length === 0}
                        >
                            <option value="">-- Mes --</option>
                            {months.map((m) => (
                                <option key={m.Id} value={m.Id}>
                                    {m.month_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {listStatus && (
                        <div className="status" role="status" aria-live="polite">
                            {listStatus}
                        </div>
                    )}

                    {/* Detalle insertado aquí: tarjeta interna ordenada (sin Bootstrap) */}
                    {detailStatus && <div className="status">{detailStatus}</div>}

                    {statementDetail && (
                        <div className="detail-card">
                            <div className="detail-card-body">
                                <h3 className="detail-card-title">Detalle de estado</h3>
                                <div className="detail-table-wrapper">
                                    <table className="detail-table">
                                        <tbody>
                                            <tr>
                                                <th style={{ width: '160px' }}>Id</th>
                                                <td>{statementDetail.id || statementDetail.detail?._id || ''}</td>
                                            </tr>
                                            <tr>
                                                <th>Cuenta</th>
                                                <td>{statementDetail.detail?.account?.id || ''} - {statementDetail.detail?.account?.name || ''}</td>
                                            </tr>
                                            <tr>
                                                <th>IBAN</th>
                                                <td>{statementDetail.detail?.account?.iban || ''}</td>
                                            </tr>
                                            <tr>
                                                <th>Periodo</th>
                                                <td>{statementDetail.detail?.date_start ? new Date(statementDetail.detail?.date_start).toLocaleDateString() : ''} — {statementDetail.detail?.date_end ? new Date(statementDetail.detail?.date_end).toLocaleDateString() : ''}</td>
                                            </tr>
                                            <tr>
                                                <th>Ingresos</th>
                                                <td>{statementDetail.detail?.total_incoming ?? 0}</td>
                                            </tr>
                                            <tr>
                                                <th>Egresos</th>
                                                <td>{statementDetail.detail?.total_outgoing ?? 0}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <h4>Transacciones</h4>
                                <div className="tx-table-wrapper">
                                    <table className="tx-table">
                                        <thead>
                                            <tr>
                                                <th>Fecha</th>
                                                <th>Descripción</th>
                                                <th>Monto</th>
                                                <th>Moneda</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.isArray(statementDetail.detail?.transactions) && statementDetail.detail.transactions.map((t, i) => (
                                                <tr key={i}>
                                                    <td>{t.date ? new Date(t.date).toLocaleString() : ''}</td>
                                                    <td>{t.description}</td>
                                                    <td>{t.amount}</td>
                                                    <td>{t.currency}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2) Actualizar datos (nombre del estado) */}
                <div className="stat-section" id="update-section">
                    <h2>Actualizar datos</h2>
                    {!editingMode && (
                        <button className="btn btn-outline" onClick={startEditing} aria-label="Mostrar editor de nombre">
                            Actualizar nombre del estado
                        </button>
                    )}

                    {editingMode && (
                        <div className="edit-inline" role="group" aria-label="Editar nombre de estado">
                            <label htmlFor="edit-name" className="visually-hidden">
                                Nombre del estado de cuenta
                            </label>
                            <input
                                id="edit-name"
                                className="input"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                placeholder="Nombre del estado de cuenta"
                            />
                            <button className="btn" onClick={saveEditing} aria-label="Guardar nombre">
                                Guardar
                            </button>
                            <button className="btn btn-secondary" onClick={cancelEditing} aria-label="Cancelar edición">
                                Cancelar
                            </button>
                        </div>
                    )}
                    {updateStatus && (
                        <div className="status" role="status" aria-live="polite">
                            {updateStatus}
                        </div>
                    )}
                </div>

                {/* 3) Borrar estado de cuenta */}
                <div className="stat-section" id="delete-section">
                    <h2>Borrar estado</h2>
                    <p className="muted">Elimina el estado seleccionado.</p>
                    <div className="delete-input">
                        <label htmlFor="delete-input">Nombre o código a eliminar</label>
                        <input id="delete-input" className="input" value={deleteInput} onChange={(e) => setDeleteInput(e.target.value)} placeholder="Ej: Estado 2025-12" />
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                        <button className="btn btn-danger" onClick={handleDelete} aria-label="Borrar estado">
                            Borrar estado
                        </button>
                    </div>

                    {deleteConfirm && (
                        <div className="confirm-inline" role="alert">
                            <p>¿Confirmar borrado de "{deleteInput}"?</p>
                            <button className="btn" onClick={confirmDelete}>Confirmar</button>
                            <button className="btn btn-secondary" onClick={cancelDelete}>Cancelar</button>
                        </div>
                    )}

                    {deleteStatus && (
                        <div className="status" role="status" aria-live="polite">
                            {deleteStatus}
                        </div>
                    )}
                </div>

                {/* 4) Generar estado y mostrar resumen + gráfico */}
                <div className="stat-section" id="generate-section">
                    <h2>Generar estado</h2>
                    <p className="muted">Crea un resumen del mes seleccionado.</p>
                    <button className="btn btn-secondary" onClick={handleGenerate} aria-label="Generar estado">
                        Generar estado
                    </button>

                    {generatedSummary && (
                        <div className="summary-grid" aria-live="polite">
                            <div className="summary-box">
                                <h3>Resumen {selectedMonthLabel}</h3>
                                <ul>
                                    <li>
                                        <strong>Ingresos:</strong> {generatedSummary.income} €
                                    </li>
                                    <li>
                                        <strong>Egresos:</strong> {generatedSummary.expense} €
                                    </li>
                                    <li>
                                        <strong>Saldo final:</strong> {generatedSummary.balance} €
                                    </li>
                                </ul>
                            </div>

                            <div className="chart-box" aria-hidden="false">
                                <div className="pie-chart" role="img" aria-label={`Gráfico de ingresos ${generatedSummary.income} y egresos ${generatedSummary.expense}`} style={{
                                    background: (() => {
                                        const inc = generatedSummary.income;
                                        const exp = generatedSummary.expense;
                                        const total = inc + exp || 1;
                                        const incDeg = Math.round((inc / total) * 360);
                                        return `conic-gradient(#4caf50 ${incDeg}deg, #f44336 0deg)`;
                                    })()
                                }}>
                                    <div className="pie-center">{Math.round((generatedSummary.income / (generatedSummary.income + generatedSummary.expense)) * 100)}%</div>
                                </div>
                                <div className="chart-legend">
                                    <div><span className="legend-swatch swatch-inc" /> Ingresos</div>
                                    <div><span className="legend-swatch swatch-exp" /> Egresos</div>
                                </div>
                            </div>
                        </div>
                    )}
                    {generateStatus && (
                        <div className="status" role="status" aria-live="polite">
                            {generateStatus}
                        </div>
                    )}
                </div>
            </section>

            {/* Detalle ahora se muestra dentro de la primera sección (tarjeta interna) */}
        </main>
    );
}

export default StatementsPage;
