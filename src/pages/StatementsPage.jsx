import React, { useEffect, useState } from "react";
import "./StatementsPage.css";

// NOTE: replaced mock data with real accountNumber and API call for months
const API_BASE = "http://localhost:10000/v1";


function StatementsPage() {
    // cuenta de prueba (usar como id en el endpoint)

    const [userInfo, setUserInfo] = useState(() => {
        if (typeof localStorage === "undefined") return null;
        try {
            const stored = localStorage.getItem("authUser");
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    const iban = userInfo?.iban || "No se ha podido obtener el iban"
    const accountNumber = iban;
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
            const acc = { id: String(accountNumber), name: accountNumber };
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
        // Inicializar graphIban con el IBAN del usuario
        if (iban && iban !== "No se ha podido obtener el iban") {
            setGraphIban(iban);
        }
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
                const res = await fetch(`${API_BASE}/bankstatements/by-iban/${accountNumber}`);
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
                console.log(res);
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
            setGeneratedSummary(null);
            return;
        }

        let mounted = true;
        const loadDetail = async () => {
            try {
                setDetailStatus('Cargando detalle...');
                setLoadingTransactions(true);
                const res = await fetch(`${API_BASE}/bankstatements/${selectedMonthId}`);
                if (!res.ok) throw new Error(`status ${res.status}`);
                const json = await res.json();
                console.log('Detalle del estado de cuenta:', json);
                console.log('Fechas:', {
                    start: json.detail?.date_start,
                    end: json.detail?.date_end,
                    monthId: selectedMonthId,
                    monthLabel: selectedMonthLabel
                });
                console.log('Montos recibidos de la API:', {
                    total_incoming: json.detail?.total_incoming,
                    total_outgoing: json.detail?.total_outgoing,
                    transactions_count: json.detail?.transactions?.length || 0,
                    transactions: json.detail?.transactions
                });
                if (mounted) {
                    setStatementDetail(json);
                    setDetailStatus('');
                    setGeneratedSummary(null); // Limpiar resumen al cambiar mes
                    setLoadingTransactions(false);
                }
            } catch (e) {
                console.error('StatementsPage.load detail error', e);
                if (mounted) {
                    setDetailStatus('Error cargando detalle');
                    setLoadingTransactions(false);
                }
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
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [graphIban, setGraphIban] = useState("");
    const [graphMonthYear, setGraphMonthYear] = useState("");
    const [graphResult, setGraphResult] = useState(null);
    const [graphStatus, setGraphStatus] = useState("");

    const startEditing = () => {
        if (!selectedAccount || !selectedMonthId) return setUpdateStatus("Selecciona cuenta y mes");
        const key = `${selectedAccount.id}-${selectedMonthId}`;
        setEditingName(statementNames[key] || `Estado ${selectedMonthLabel}`);
        setEditingMode(true);
        setUpdateStatus("");
    };

    const saveEditing = async () => {
        if (!selectedAccount || !selectedMonthId) return setUpdateStatus("Selecciona cuenta y mes");

        // NOTA: El endpoint PUT /v1/bankstatements/account/{accountId}/statements
        // reemplaza TODA la lista de estados, no solo actualiza uno.
        // Por ahora mantenemos actualización local hasta tener endpoint específico.
        const key = `${selectedAccount.id}-${selectedMonthId}`;
        setStatementNames((s) => ({ ...s, [key]: editingName }));
        setEditingMode(false);
        setUpdateStatus(`Nombre actualizado localmente: ${editingName}`);

        // TODO: Implementar cuando exista endpoint PATCH /bankstatements/{id}
    };

    const cancelEditing = () => {
        setEditingMode(false);
        setEditingName("");
        setUpdateStatus("");
    };

    const handleGenerate = () => {
        if (!selectedAccount || !selectedMonthId) return setGenerateStatus("Selecciona cuenta y mes");
        if (!statementDetail?.detail) return setGenerateStatus("No hay datos del estado de cuenta");

        setGenerateStatus(`Generando estado para ${selectedAccount.name} (${selectedMonthLabel})...`);

        // Usar datos reales del estado de cuenta
        const income = statementDetail.detail.total_incoming || 0;
        const expense = statementDetail.detail.total_outgoing || 0;
        const balance = income - expense;

        console.log('Generando resumen con:', {
            monthId: selectedMonthId,
            monthLabel: selectedMonthLabel,
            income,
            expense,
            balance,
            fullDetail: statementDetail.detail
        });

        setGeneratedSummary({ income, expense, balance });
        setGenerateStatus("Estado generado correctamente");
    };

    const handleGenerateByIban = async () => {
        if (!graphIban) return setGraphStatus("Ingresa el IBAN");
        if (!graphMonthYear) return setGraphStatus("Selecciona mes y año");

        setGraphStatus("Generando estado...");

        try {
            const res = await fetch(`${API_BASE}/bankstatements/by-iban?iban=${encodeURIComponent(graphIban)}&month=${graphMonthYear}`);
            if (!res.ok) throw new Error(`status ${res.status}`);
            const json = await res.json();

            console.log('Respuesta de by-iban:', json);
            setGraphResult(json);
            setGraphStatus("Estado generado correctamente");
        } catch (e) {
            console.error('Error generando estado:', e);
            setGraphStatus(`Error: ${e.message}`);
        }
    };

    // handleUpdate removed: actualizaciones se realizan vía editor (saveEditing)

    const handleDelete = () => {
        if (!selectedAccount || !selectedMonthId) return setDeleteStatus("Selecciona cuenta y mes");
        if (!deleteInput) return setDeleteStatus("Ingresa nombre o código a eliminar");
        // mostrar confirmación inline
        setDeleteConfirm(true);
        setDeleteStatus(`¿Borrar "${deleteInput}" de ${selectedAccount.name} (${selectedMonthLabel})? Confirma.`);
    };

    const confirmDelete = async () => {
        if (!selectedMonthId) return setDeleteStatus("No hay mes seleccionado");

        setDeleteStatus(`Borrando estado...`);
        setDeleteConfirm(false);

        try {
            const res = await fetch(`${API_BASE}/bankstatements/by-identifier`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: selectedMonthId })
            });

            if (!res.ok) {
                throw new Error(`Error ${res.status}: ${res.statusText}`);
            }

            setDeleteStatus("Estado borrado exitosamente");
            setDeleteInput("");

            // Recargar la lista de meses
            const loadRes = await fetch(`${API_BASE}/bankstatements/by-iban/${accountNumber}`);
            if (loadRes.ok) {
                const json = await loadRes.json();
                const m = Array.isArray(json.months) ? json.months : [];
                setMonths(m);

                // Si hay meses disponibles, seleccionar el primero
                if (m.length > 0) {
                    setSelectedMonthId(m[0].Id);
                    setSelectedMonthLabel(m[0].month_name);
                } else {
                    setSelectedMonthId("");
                    setSelectedMonthLabel("");
                    setStatementDetail(null);
                }
            }
        } catch (e) {
            console.error('Error al borrar estado:', e);
            setDeleteStatus(`Error al borrar: ${e.message}`);
        }
    };

    const cancelDelete = () => {
        setDeleteConfirm(false);
        setDeleteStatus("Eliminación cancelada");
    };

    // Helper para formatear fechas sin problemas de zona horaria
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        return `${day}/${month}/${year}`;
    };

    // Calcular periodo basado en el label del mes
    const getMonthPeriod = () => {
        if (!selectedMonthLabel || !statementDetail?.detail?.date_start) return { start: '', end: '' };

        const monthNames = {
            'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
            'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
        };

        // Obtener el mes del label
        const monthName = selectedMonthLabel.toLowerCase().trim();
        const month = monthNames[monthName];

        if (month === undefined) return { start: '', end: '' };

        // Obtener el año de date_start de la API
        const year = new Date(statementDetail.detail.date_start).getUTCFullYear();

        // Calcular primer y último día del mes
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const formatLocalDate = (date) => {
            const d = String(date.getDate()).padStart(2, '0');
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const y = date.getFullYear();
            return `${d}/${m}/${y}`;
        };

        return {
            start: formatLocalDate(firstDay),
            end: formatLocalDate(lastDay)
        };
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
                    <div className="selector-grid">
                        <div className="selector-col">
                            <label htmlFor="account-select">IBAN</label>
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

                        <div className="selector-col">
                            <label>Año</label>
                            <div className="year-display">2025</div>
                        </div>

                        <div className="selector-col">
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
                    </div>
                    {listStatus && (
                        <div className={`status ${listStatus.toLowerCase().includes('error') ? 'status-error' : 'status-success'}`} role="status" aria-live="polite">
                            {listStatus}
                        </div>
                    )}

                    {/* Detalle insertado aquí: tarjeta interna ordenada (sin Bootstrap) */}
                    {detailStatus && <div className={`status ${detailStatus.toLowerCase().includes('error') ? 'status-error' : ''}`}>{detailStatus}</div>}

                    {statementDetail && (
                        <div className="detail-card">
                            <div className="detail-card-body">
                                <div className="detail-card-header">
                                    <h3 className="detail-card-title">Detalle de estado</h3>
                                    <button className="btn btn-download" onClick={() => alert('Descargando estado de cuenta...')} aria-label="Descargar estado">
                                        ↓ Descargar
                                    </button>
                                </div>
                                <div className="detail-table-wrapper">
                                    <table className="detail-table">
                                        <tbody>
                                            <tr>
                                                <th style={{ width: '160px' }}>Id</th>
                                                <td>{statementDetail.id || statementDetail.detail?._id || ''}</td>
                                            </tr>
                                            <tr>
                                                <th>IBAN</th>
                                                <td>{statementDetail.detail?.account?.iban || ''}</td>
                                            </tr>
                                            <tr>
                                                <th>Periodo</th>
                                                <td>{(() => {
                                                    const period = getMonthPeriod();
                                                    return `${period.start} — ${period.end}`;
                                                })()}</td>
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
                                {loadingTransactions ? (
                                    <div className="tx-loader">
                                        <div className="spinner"></div>
                                        <p>Cargando transacciones...</p>
                                    </div>
                                ) : (
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
                                )}
                            </div>
                        </div>
                    )}

                    {/* Generar gráficas - dentro de list-section */}
                    <div className="generate-subsection">
                        <p className="muted">Crea un resumen del mes seleccionado.</p>
                        <div className="generate-controls">
                            <button className="btn btn-secondary" onClick={handleGenerate} aria-label="Generar gráficas">
                                Generar gráficas
                            </button>
                            {generateStatus && (
                                <span className={`status-inline ${generateStatus.toLowerCase().includes('error') ? 'status-error' : 'status-success'}`} role="status" aria-live="polite">
                                    {generateStatus}
                                </span>
                            )}
                        </div>

                        {generatedSummary && (
                            <div className="summary-grid" aria-live="polite">
                                <div className="summary-box">
                                    <h4>Resumen {selectedMonthLabel}</h4>
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
                                    <h4 className="chart-title">Proporción</h4>
                                    <div className="pie-chart" role="img" aria-label={`Gráfico de ingresos ${generatedSummary.income} y egresos ${generatedSummary.expense}`} title={`Ingresos: ${generatedSummary.income}€ (${(() => {
                                        const inc = Math.abs(generatedSummary.income);
                                        const exp = Math.abs(generatedSummary.expense);
                                        const total = inc + exp;
                                        if (total === 0) return '0';
                                        return Math.round((inc / total) * 100);
                                    })()}%) | Egresos: ${generatedSummary.expense}€ (${(() => {
                                        const inc = Math.abs(generatedSummary.income);
                                        const exp = Math.abs(generatedSummary.expense);
                                        const total = inc + exp;
                                        if (total === 0) return '0';
                                        return Math.round((exp / total) * 100);
                                    })()}%)`} style={{
                                        background: (() => {
                                            const inc = Math.abs(generatedSummary.income);
                                            const exp = Math.abs(generatedSummary.expense);
                                            const total = inc + exp;

                                            if (total === 0) {
                                                return 'conic-gradient(#ccc 360deg)';
                                            }

                                            const incDeg = Math.round((inc / total) * 360);
                                            return `conic-gradient(#4caf50 ${incDeg}deg, #f44336 0deg)`;
                                        })()
                                    }}>
                                        <div className="pie-center">
                                            {(() => {
                                                const inc = Math.abs(generatedSummary.income);
                                                const exp = Math.abs(generatedSummary.expense);
                                                const total = inc + exp;
                                                if (total === 0) return '0%';
                                                return `${Math.round((inc / total) * 100)}%`;
                                            })()}
                                        </div>
                                    </div>
                                    <div className="chart-legend">
                                        <div><span className="legend-swatch swatch-inc" /> Ingresos</div>
                                        <div><span className="legend-swatch swatch-exp" /> Egresos</div>
                                    </div>
                                </div>

                                <div className="chart-box" aria-hidden="false">
                                    <h4 className="chart-title">Comparación</h4>
                                    <div className="bar-chart" role="img" aria-label={`Gráfico de barras: ingresos ${generatedSummary.income} y egresos ${generatedSummary.expense}`}>
                                        <div className="bar-group">
                                            <div className="bar-label">Ingresos</div>
                                            <div className="bar-container">
                                                <div className="bar bar-income" style={{
                                                    width: (() => {
                                                        const inc = Math.abs(generatedSummary.income);
                                                        const exp = Math.abs(generatedSummary.expense);
                                                        const max = Math.max(inc, exp);
                                                        if (max === 0) return '0%';
                                                        return `${(inc / max) * 100}%`;
                                                    })()
                                                }}>
                                                    <span className="bar-value">{generatedSummary.income}€</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bar-group">
                                            <div className="bar-label">Egresos</div>
                                            <div className="bar-container">
                                                <div className="bar bar-expense" style={{
                                                    width: (() => {
                                                        const inc = Math.abs(generatedSummary.income);
                                                        const exp = Math.abs(generatedSummary.expense);
                                                        const max = Math.max(inc, exp);
                                                        if (max === 0) return '0%';
                                                        return `${(exp / max) * 100}%`;
                                                    })()
                                                }}>
                                                    <span className="bar-value">{generatedSummary.expense}€</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="stat-section" id="generate-state-section">
                    <h2>Generar Estado</h2>
                    <p className="muted">Genera un estado de cuenta por IBAN y período.</p>
                    
                    <div className="graph-inputs">
                        <div className="input-group">
                            <label htmlFor="graph-iban">IBAN</label>
                            <input
                                id="graph-iban"
                                type="text"
                                className="input"
                                value={graphIban}
                                onChange={(e) => setGraphIban(e.target.value)}
                                placeholder="ES00 0000 0000 0000 0000 0000"
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="graph-month">Mes y Año (YYYY-MM)</label>
                            <input
                                id="graph-month"
                                type="month"
                                className="input"
                                value={graphMonthYear}
                                onChange={(e) => setGraphMonthYear(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="generate-controls">
                        <button className="btn btn-secondary" onClick={handleGenerateByIban} aria-label="Generar estado">
                            Generar Estado
                        </button>
                        {graphStatus && (
                            <span className={`status-inline ${graphStatus.toLowerCase().includes('error') ? 'status-error' : 'status-success'}`} role="status" aria-live="polite">
                                {graphStatus}
                            </span>
                        )}
                    </div>

                    {graphResult && (
                        <div className="result-card">
                            <h3>Resultado</h3>
                            <div className="result-details">
                                <p><strong>IBAN:</strong> {graphResult.iban || graphIban}</p>
                                <p><strong>Período:</strong> {graphMonthYear}</p>
                                <p><strong>Total Ingresos:</strong> {graphResult.total_incoming || 0} €</p>
                                <p><strong>Total Egresos:</strong> {graphResult.total_outgoing || 0} €</p>
                                {graphResult.months && graphResult.months.length > 0 && (
                                    <div>
                                        <h4>Meses disponibles:</h4>
                                        <ul>
                                            {graphResult.months.map((m, idx) => (
                                                <li key={idx}>{m.month_name} - ID: {m.Id}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                {/* 2) Actualizar datos (nombre del estado) */}
                {/* <div className="stat-section" id="update-section">
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
                        <div className={`status ${updateStatus.toLowerCase().includes('error') ? 'status-error' : 'status-success'}`} role="status" aria-live="polite">
                            {updateStatus}
                        </div>
                    )}
                </div> */}

                {/* 3) Borrar estado de cuenta */}
                {/* <div className="stat-section" id="delete-section">
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
                        <div className={`status ${deleteStatus.toLowerCase().includes('error') ? 'status-error' : 'status-success'}`} role="status" aria-live="polite">
                            {deleteStatus}
                        </div>
                    )}
                </div> */}


            </section>

            {/* Detalle ahora se muestra dentro de la primera sección (tarjeta interna) */}
        </main>
    );
}

export default StatementsPage;
