import React, { useEffect, useState } from "react";
import "./StatementsPage.css";

// NOTE: replaced mock data with real accountNumber and API call for months
const API_BASE = "https://68.221.252.242:10000/v1";


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
    //const iban = "ES1111111111111111111111"; // valor fijo para pruebas
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

                // Obtener token para la petición autenticada
                const token = localStorage.getItem('authToken');
                const headers = {
                    'Content-Type': 'application/json'
                };
                if (token) {
                    headers.Authorization = `Bearer ${token}`;
                }

                console.log('[StatementsPage] Cargando meses para IBAN:', accountNumber);
                const res = await fetch(`${API_BASE}/bankstatements/by-iban/${accountNumber}`, {
                    headers
                });

                console.log('[StatementsPage] Response status:', res.status);

                // Si no hay estados de cuenta (404), es normal, no es un error
                if (res.status === 404) {
                    if (mounted) {
                        setMonths([]);
                        setSelectedMonthId("");
                        setSelectedMonthLabel("");
                        setListStatus("No hay estados de cuenta disponibles para esta cuenta aún.");
                    }
                    return;
                }

                if (!res.ok) throw new Error(`status ${res.status}`);

                const json = await res.json();
                console.log('[StatementsPage] Meses recibidos:', json);
                const m = Array.isArray(json.months) ? json.months : [];
                if (mounted) {
                    setMonths(m);
                    // seleccionar el primer mes por Id y almacenar su label
                    if (m.length > 0) {
                        setSelectedMonthId(m[0].Id);
                        setSelectedMonthLabel(m[0].month_name);
                        setListStatus("");
                    } else {
                        setSelectedMonthId("");
                        setSelectedMonthLabel("");
                        setListStatus("No hay estados de cuenta disponibles.");
                    }
                }
            } catch (e) {
                console.error('StatementsPage.load months error', e);
                if (mounted) setListStatus('Error de conexión al cargar los meses. Inténtalo de nuevo.');
            }
        };
        load();
        return () => (mounted = false);
    }, [selectedAccount, accountNumber]);

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

                // Obtener token para la petición autenticada
                const token = localStorage.getItem('authToken');
                const headers = {
                    'Content-Type': 'application/json'
                };
                if (token) {
                    headers.Authorization = `Bearer ${token}`;
                }

                console.log('[StatementsPage] Cargando detalle del statement ID:', selectedMonthId);
                const res = await fetch(`${API_BASE}/bankstatements/${selectedMonthId}`, {
                    headers
                });

                console.log('[StatementsPage] Response status detalle:', res.status);
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

        // Usar el mes actual para simular el estado del mes en curso
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const currentMonth = `${year}-${month}`; // formato YYYY-MM

        // guardar para mostrar el período usado
        setGraphMonthYear(currentMonth);

        setGraphStatus("Generando estado de cuenta del mes actual...");

        try {
            // Obtener el token JWT del localStorage (la clave correcta es 'authToken')
            const token = localStorage.getItem('authToken');

            console.log('[Frontend] Token encontrado:', !!token);
            if (!token) {
                setGraphStatus("Error: No se encontró token de autenticación. Por favor, inicia sesión nuevamente.");
                return;
            }

            // Llamar al endpoint POST /generate-current con el IBAN en el body
            const res = await fetch(`${API_BASE}/bankstatements/generate-current`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ iban: graphIban })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));

                // Manejo específico de errores conocidos
                if (res.status === 404 && errorData.error === 'no_transactions_found') {
                    setGraphStatus("No se encontraron transacciones del mes actual. Realiza alguna operación primero.");
                    setGraphResult(null);
                    return;
                }

                if (res.status === 502 && errorData.error === 'error_fetching_transactions') {
                    setGraphStatus("Error: No se pudo conectar con el servicio de transacciones.");
                    setGraphResult(null);
                    return;
                }

                throw new Error(errorData.message || `HTTP ${res.status}`);
            }

            const json = await res.json();
            console.log('Respuesta de generate-current:', json);

            // Adaptar la respuesta al formato esperado por el componente
            const statement = json.statement;
            if (statement) {
                setGraphResult({
                    iban: statement.account?.iban || graphIban,
                    total_incoming: statement.total_incoming || 0,
                    total_outgoing: statement.total_outgoing || 0,
                    detail: statement
                });

                if (json.existing) {
                    setGraphStatus("Estado de cuenta ya existente (mes actual)");
                } else if (json.created) {
                    setGraphStatus("Estado de cuenta generado exitosamente");
                }
            } else {
                setGraphStatus(json.message || "Estado generado");
            }
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

    // Función para generar y descargar el PDF usando window.print()
    const handleDownloadPDF = () => {
        if (!statementDetail || !selectedMonthLabel) {
            alert('No hay datos para descargar');
            return;
        }

        const period = getMonthPeriod();
        const transactions = statementDetail.detail?.transactions || [];

        // Crear contenido HTML para imprimir
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Estado de Cuenta - ${selectedMonthLabel}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 40px;
                        color: #333;
                    }
                    h1 {
                        color: #2c3e50;
                        border-bottom: 3px solid #3498db;
                        padding-bottom: 10px;
                        margin-bottom: 30px;
                    }
                    .info-section {
                        margin: 20px 0;
                        padding: 15px;
                        background-color: #f8f9fa;
                        border-left: 4px solid #3498db;
                    }
                    .info-row {
                        margin: 8px 0;
                        display: flex;
                    }
                    .info-label {
                        font-weight: bold;
                        min-width: 120px;
                        color: #555;
                    }
                    .info-value {
                        color: #222;
                    }
                    h2 {
                        color: #2c3e50;
                        margin-top: 30px;
                        margin-bottom: 15px;
                        border-bottom: 2px solid #ecf0f1;
                        padding-bottom: 5px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 15px;
                    }
                    th {
                        background-color: #3498db;
                        color: white;
                        padding: 12px;
                        text-align: left;
                        font-weight: bold;
                    }
                    td {
                        padding: 10px;
                        border-bottom: 1px solid #ecf0f1;
                    }
                    tr:nth-child(even) {
                        background-color: #f8f9fa;
                    }
                    tr:hover {
                        background-color: #e8f4f8;
                    }
                    .amount-positive {
                        color: #27ae60;
                        font-weight: bold;
                    }
                    .amount-negative {
                        color: #e74c3c;
                        font-weight: bold;
                    }
                    .totals {
                        margin-top: 20px;
                        padding: 15px;
                        background-color: #ecf0f1;
                        border-radius: 5px;
                    }
                    .total-row {
                        display: flex;
                        justify-content: space-between;
                        margin: 5px 0;
                        font-size: 16px;
                    }
                    .total-label {
                        font-weight: bold;
                    }
                    .footer {
                        margin-top: 40px;
                        text-align: center;
                        color: #7f8c8d;
                        font-size: 12px;
                        border-top: 1px solid #ecf0f1;
                        padding-top: 15px;
                    }
                    @media print {
                        body { margin: 20px; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>Estado de Cuenta Mes ${selectedMonthLabel}</h1>
                
                <div class="info-section">
                    <div class="info-row">
                        <span class="info-label">ID:</span>
                        <span class="info-value">${statementDetail.id || statementDetail.detail?._id || 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">IBAN:</span>
                        <span class="info-value">${statementDetail.detail?.account?.iban || 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Nombre:</span>
                        <span class="info-value">${statementDetail.detail?.account?.name || 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Email:</span>
                        <span class="info-value">${statementDetail.detail?.account?.email || 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Periodo:</span>
                        <span class="info-value">${period.start} — ${period.end}</span>
                    </div>
                </div>

                <div class="totals">
                    <div class="total-row">
                        <span class="total-label">Total Ingresos:</span>
                        <span class="amount-positive">${(statementDetail.detail?.total_incoming ?? 0).toFixed(2)} €</span>
                    </div>
                    <div class="total-row">
                        <span class="total-label">Total Egresos:</span>
                        <span class="amount-negative">${(statementDetail.detail?.total_outgoing ?? 0).toFixed(2)} €</span>
                    </div>
                    <div class="total-row">
                        <span class="total-label">Balance:</span>
                        <span style="font-weight: bold; font-size: 18px;">
                            ${((statementDetail.detail?.total_incoming ?? 0) - (statementDetail.detail?.total_outgoing ?? 0)).toFixed(2)} €
                        </span>
                    </div>
                </div>

                <h2>Transacciones (${transactions.length})</h2>
                ${transactions.length > 0 ? `
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Fecha</th>
                                <th>Descripción</th>
                                <th>Monto</th>
                                <th>Moneda</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${transactions.map((t, i) => {
            const fecha = t.date ? new Date(t.date).toLocaleString() : 'N/A';
            const desc = t.description || 'Sin descripción';
            const amount = Number(t.amount) || 0;
            const amountClass = amount >= 0 ? 'amount-positive' : 'amount-negative';
            const amountFormatted = amount >= 0 ? `+${amount.toFixed(2)}` : amount.toFixed(2);

            return `
                                    <tr>
                                        <td>${i + 1}</td>
                                        <td>${fecha}</td>
                                        <td>${desc}</td>
                                        <td class="${amountClass}">${amountFormatted}</td>
                                        <td>${t.currency || 'EUR'}</td>
                                    </tr>
                                `;
        }).join('')}
                        </tbody>
                    </table>
                ` : '<p>No hay transacciones disponibles</p>'}

                <div class="footer">
                    <p>BancUS - Estado de cuenta generado el ${new Date().toLocaleDateString()}</p>
                    <p>Este documento es válido como comprobante de transacciones</p>
                </div>
            </body>
            </html>
        `;

        // Abrir ventana de impresión
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();

            // Esperar a que cargue y luego imprimir
            printWindow.onload = () => {
                printWindow.print();
            };
        } else {
            alert('Por favor, permite las ventanas emergentes para descargar el PDF');
        }
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
                <div className="stat-section" id="generate-state-section">
                    <h2>Simular estado de cuenta actual</h2>
                    <p className="muted">Simula tu estado de cuenta del mes actual con las transacciones realizadas hasta hoy.</p>

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
                            <label htmlFor="graph-date">Fecha (fija)</label>
                            <input
                                id="graph-date"
                                type="date"
                                className="input"
                                value={new Date().toISOString().slice(0, 10)}
                                disabled
                                aria-readonly="true"
                            />
                        </div>
                    </div>

                    <div className="generate-controls">
                        <button className="btn btn-secondary" onClick={handleGenerateByIban} aria-label="Simular estado">
                            Simular
                        </button>
                        {graphStatus && (
                            <span className={`status-inline ${graphStatus.toLowerCase().includes('error') ? 'status-error' : 'status-success'}`} role="status" aria-live="polite">
                                {graphStatus}
                            </span>
                        )}
                    </div>

                    {graphResult && (
                        <div className="result-card">
                            <h3>Resultado del estado de cuenta</h3>
                            <div className="result-details">
                                <p><strong>IBAN:</strong> {graphResult.iban || graphIban}</p>
                                <p><strong>Período:</strong> {graphMonthYear}</p>
                                <p><strong>Total Ingresos:</strong> {graphResult.total_incoming || 0} €</p>
                                <p><strong>Total Egresos:</strong> {graphResult.total_outgoing || 0} €</p>
                                <p><strong>Balance:</strong> {((graphResult.total_incoming || 0) - (graphResult.total_outgoing || 0)).toFixed(2)} €</p>

                                {graphResult.detail && graphResult.detail.transactions && graphResult.detail.transactions.length > 0 && (
                                    <div>
                                        <h4>Transacciones del mes ({graphResult.detail.transactions.length})</h4>
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
                                                    {graphResult.detail.transactions.slice(0, 10).map((t, i) => (
                                                        <tr key={i}>
                                                            <td>{t.date ? new Date(t.date).toLocaleString() : ''}</td>
                                                            <td>{t.description || 'Sin descripción'}</td>
                                                            <td className={t.amount >= 0 ? 'positive' : 'negative'}>
                                                                {t.amount >= 0 ? '+' : ''}{t.amount.toFixed(2)}
                                                            </td>
                                                            <td>{t.currency}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {graphResult.detail.transactions.length > 10 && (
                                                <p className="muted">
                                                    Mostrando 10 de {graphResult.detail.transactions.length} transacciones
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

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
                                    <button className="btn btn-download" onClick={handleDownloadPDF} aria-label="Descargar estado">
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
