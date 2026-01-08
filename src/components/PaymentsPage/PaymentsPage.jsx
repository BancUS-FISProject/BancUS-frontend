import React, { useEffect, useState } from "react"
import { getAccountIdFromLocalStorage, prettifyDaysOfWeek, DAY_ES, formatLocalDateTimeES } from "./utils"
import { schedulerApi } from "../../api"

function PaymentsPage() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  const [form, setForm] = useState({
    description: "",
    beneficiaryName: "",
    beneficiaryIban: "",
    amountValue: "",
    amountCurrency: "EUR",
    frequency: "ONCE",
    executionDate: "",
    daysOfWeek: [],
    dayOfMonth: 1,
    startDate: "",
    endDate: "",
  })

  const loadPayments = async () => {
      setLoading(true)
      setError(null)
      setPayments([])

      const accountId = getAccountIdFromLocalStorage()

      if (!accountId) {
        setError("No hay usuario logeado.")
        setLoading(false)
        return
      }

      try {
        const response = await schedulerApi.getTransferByAccount(accountId)

        if (response.status === 404) {
          setError("La cuenta no existe")
          return
        }

        if (!response.ok) {
          const txt = await response.text().catch(() => "")
          setError(`Error obteniendo los pagos (${response.status}). ${txt}`)
          return
        }

        const data = await response.json()
        setPayments(Array.isArray(data) ? data : [])
      } catch {
        setError("No se pudo conectar con el backend")
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    loadPayments()
  }, [])

  const resetForm = () => {
    setFormError(null)
    setForm({
      description: "",
      beneficiaryName: "",
      beneficiaryIban: "",
      amountValue: "",
      amountCurrency: "EUR",
      frequency: "ONCE",
      executionDate: "",
      daysOfWeek: [],
      dayOfMonth: 1,
      startDate: "",
      endDate: "",
    })
  }

  const openModal = () => {
    resetForm()
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setFormError(null)
  }

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const toggleDay = (day) => {
    setForm((prev) => {
      const exists = prev.daysOfWeek.includes(day)
      return {
        ...prev,
        daysOfWeek: exists
          ? prev.daysOfWeek.filter((d) => d !== day)
          : [...prev.daysOfWeek, day],
      }
    })
  }

  const buildSchedulePayload = () => {
    if (form.frequency === "ONCE") {
      if (!form.executionDate) return { error: "Indica la fecha de ejecución" }
      return {
        schedule: {
          frequency: "ONCE",
          executionDate: new Date(form.executionDate).toISOString(),
        },
      }
    }

    if (form.frequency === "WEEKLY") {
      if (!form.startDate || !form.endDate) return { error: "Indica fecha de inicio y fin" }
      if (!form.daysOfWeek.length) return { error: "Selecciona al menos un día" }
      return {
        schedule: {
          frequency: "WEEKLY",
          daysOfWeek: form.daysOfWeek,
          startDate: new Date(form.startDate).toISOString(),
          endDate: new Date(form.endDate).toISOString(),
        },
      }
    }

    if (form.frequency === "MONTHLY") {
      if (!form.startDate || !form.endDate) return { error: "Indica fecha de inicio y fin" }
      const day = Number(form.dayOfMonth)
      if (!day || day < 1 || day > 31) return { error: "El día del mes debe estar entre 1 y 31" }
      return {
        schedule: {
          frequency: "MONTHLY",
          dayOfMonth: day,
          startDate: new Date(form.startDate).toISOString(),
          endDate: new Date(form.endDate).toISOString(),
        },
      }
    }

    return { error: "Frecuencia no válida" }
  }

  const handleCreatePayment = async (e) => {
    e.preventDefault()
    setFormError(null)

    const accountId = getAccountIdFromLocalStorage()
    if (!accountId) {
      setFormError("No hay usuario logeado.")
      return
    }

    if (!form.description.trim()) return setFormError("La descripción es obligatoria")
    if (!form.beneficiaryName.trim()) return setFormError("El nombre del beneficiario es obligatorio")
    if (!form.beneficiaryIban.trim()) return setFormError("El IBAN del beneficiario es obligatorio")

    const val = Number(form.amountValue)
    if (!val || val <= 0) return setFormError("La cantidad debe ser mayor que 0")

    const scheduleBuild = buildSchedulePayload()
    if (scheduleBuild.error) return setFormError(scheduleBuild.error)

    const payload = {
      accountId,
      description: form.description.trim(),
      beneficiary: {name: form.beneficiaryName.trim(), iban: form.beneficiaryIban.trim()},
      amount: {value: val, currency: form.amountCurrency || "EUR"},
      ...scheduleBuild,
    }

    setSubmitting(true)
    try {
      const resp = await schedulerApi.postSchedulerTransfer(payload)

      if (!resp.ok) {
        const txt = await resp.text().catch(() => "")
        setFormError(`Error creando el pago (${resp.status}). ${txt}`)
        return
      }

      closeModal()
      await loadPayments()
    } catch {
      setFormError("No se pudo conectar con el backend")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePayment = async (paymentId) => {
    const confirmed = window.confirm(
      "¿Seguro que quieres eliminar este pago programado?"
    )

    if (!confirmed) return

    try {
      const response = await schedulerApi.deleteSchedulerTransfer(paymentId)

      if (!response.ok) {
        const txt = await response.text().catch(() => "")
        throw new Error(txt || "Error eliminando el pago")
      }

      setPayments((prev) => prev.filter((p) => p.id !== paymentId))
    } catch (err) {
      alert(err.message || "No se pudo eliminar el pago")
    }
  }


  return (
  <div>
    <h1 style={{ marginBottom: "3rem" }}>Pagos programados</h1>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <button
          onClick={openModal}
          style={{
            padding: "10px 14px",
            borderRadius: "10px",
            border: "1px solid #d0f0df",
            background: "#00a86b",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
          }}
        >
          Nuevo pago
        </button>
      </div>

    {loading && <p>Cargando pagos...</p>}

    {!loading && error && <p style={{ color: "#b00020" }}>{error}</p>}

    {!loading && !error && (
      <div
        style={{
          borderRadius: "14px",
          overflow: "hidden",
          background: "#fff",
          border: "1px solid #e9ecef",
          boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: "#f8f9fa" }}>
                {[
                  "Descripción",
                  "Beneficiario",
                  "Cantidad",
                  "Frecuencia",
                  "Día/s",
                  "Periodo (inicio-fin)",
                  "Ejecución (una vez)",
                  ""
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      fontWeight: 700,
                      fontSize: "12px",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: "#5f6368",
                      padding: "14px 16px",
                      borderBottom: "1px solid #e9ecef",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      padding: "22px 16px",
                      color: "#6c757d",
                      textAlign: "center",
                    }}
                  >
                    No hay pagos programados para esta cuenta
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const sched = p.schedule || {}
                  const freqRaw = sched.frequency || ""

                  const freqLabel =
                    freqRaw === "MONTHLY"
                      ? "Mensual"
                      : freqRaw === "WEEKLY"
                      ? "Semanal"
                      : freqRaw === "ONCE"
                      ? "Una sola vez"
                      : freqRaw || "-"

                  const daysWeekly =
                    freqRaw === "WEEKLY" && Array.isArray(sched.daysOfWeek) && sched.daysOfWeek.length
                      ? sched.daysOfWeek.join(", ")
                      : "-"

                  const period =
                    (freqRaw === "WEEKLY" || freqRaw === "MONTHLY") && (sched.startDate || sched.endDate)
                      ? `${sched.startDate ? new Date(sched.startDate).toLocaleDateString() : "-"}  →  ${
                          sched.endDate ? new Date(sched.endDate).toLocaleDateString() : "-"
                        }`
                      : "-"

                  const onceExec =
                    freqRaw === "ONCE" && sched.executionDate
                      ? formatLocalDateTimeES(sched.executionDate)
                      : "-"

                  const amount =
                    p.amount?.value != null ? `${p.amount.value} ${p.amount?.currency || ""}`.trim() : "-"

                  return (
                    <tr key={p.id} style={{ background: "#fff" }}>
                      <td
                        style={{
                          padding: "14px 16px",
                          borderBottom: "1px solid #f1f3f5",
                          verticalAlign: "top",
                          minWidth: 180,
                        }}
                      >
                        <div style={{ fontWeight: 700, color: "#212529" }}>
                          {p.description || "-"}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6c757d", marginTop: 4 }}>
                          {p.isActive ? "Activo" : "Inactivo"}
                        </div>
                      </td>

                      <td
                        style={{
                          padding: "14px 16px",
                          borderBottom: "1px solid #f1f3f5",
                          verticalAlign: "top",
                          minWidth: 180,
                        }}
                      >
                        <div style={{ fontWeight: 600, color: "#212529" }}>
                          {p.beneficiary?.name || "-"}
                        </div>
                        <div
                          style={{
                            display: "inline-block",
                            marginTop: 6,
                            padding: "4px 10px",
                            borderRadius: 999,
                            background: "#f1f3f5",
                            color: "#495057",
                            fontSize: "12px",
                            fontFamily:
                              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                            maxWidth: 320,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={p.beneficiary?.iban || ""}
                        >
                          {p.beneficiary?.iban || "-"}
                        </div>
                      </td>

                      <td
                        style={{
                          padding: "14px 16px",
                          borderBottom: "1px solid #f1f3f5",
                          verticalAlign: "top",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span style={{ fontWeight: 700, color: "#212529" }}>{amount}</span>
                      </td>

                      <td
                        style={{
                          padding: "14px 16px",
                          borderBottom: "1px solid #f1f3f5",
                          verticalAlign: "top",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {freqLabel}
                      </td>

                      <td
                        style={{
                          padding: "14px 16px",
                          borderBottom: "1px solid #f1f3f5",
                          verticalAlign: "top",
                          minWidth: 150,
                        }}
                      >
                        {freqRaw === "MONTHLY" && sched.dayOfMonth ? 
                          `Día ${sched.dayOfMonth}`
                        : freqRaw === "WEEKLY" && sched.daysOfWeek ?
                            prettifyDaysOfWeek(sched.daysOfWeek)
                          :
                            null
                        }
                      </td>

                      <td
                        style={{
                          padding: "14px 16px",
                          borderBottom: "1px solid #f1f3f5",
                          verticalAlign: "top",
                          minWidth: 220,
                        }}
                      >
                        {period}
                      </td>

                      <td
                        style={{
                          padding: "14px 16px",
                          borderBottom: "1px solid #f1f3f5",
                          verticalAlign: "top",
                          minWidth: 200,
                        }}
                      >
                        {onceExec}
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          borderBottom: "1px solid #f1f3f5",
                          verticalAlign: "top",
                        }}
                      >
                        <button
                          onClick={() => handleDeletePayment(p.id)}
                          style={{
                            background: "transparent",
                            border: "1px solid #dc3545",
                            color: "#dc3545",
                            borderRadius: 6,
                            padding: "6px 10px",
                            fontSize: "13px",
                            cursor: "pointer",
                          }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    )}
    {showModal && (
      <div
        onClick={closeModal}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          zIndex: 9999,
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "min(760px, 100%)",
            background: "#fff",
            borderRadius: "14px",
            border: "1px solid #e9ecef",
            boxShadow: "0 10px 30px #0000002e",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid #f1f3f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#f8f9fa",
            }}
          >
            <div style={{ fontWeight: 800 }}>Crear pago programado</div>
            <button
              onClick={closeModal}
              style={{
                border: "none",
                background: "transparent",
                fontSize: 18,
                cursor: "pointer",
                padding: 6,
                color: "#111827",
              }}
              aria-label="Cerrar"
              title="Cerrar"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleCreatePayment} style={{maxWidth: "fit-content", margin: "1em auto 1em auto"}}>
            {formError && (
              <div style={{ marginBottom: 12, color: "#b00020", fontWeight: 600 }}>
                {formError}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: "#495057" }}>
                  Descripción
                </label>
                <input
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  placeholder="Ej: Alquiler"
                  style={{
                    width: "-webkit-fill-available",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #dee2e6",
                    marginTop: 6,
                    background: "#3c3c3c",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: "#495057" }}>
                  Beneficiario (nombre)
                </label>
                <input
                  value={form.beneficiaryName}
                  onChange={(e) => updateForm("beneficiaryName", e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  style={{
                    width: "-webkit-fill-available",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #dee2e6",
                    marginTop: 6,
                    background: "#3c3c3c",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: "#495057" }}>
                  Beneficiario (IBAN)
                </label>
                <input
                  value={form.beneficiaryIban}
                  onChange={(e) => updateForm("beneficiaryIban", e.target.value)}
                  placeholder="ES12..."
                  style={{
                    width: "-webkit-fill-available",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #dee2e6",
                    marginTop: 6,
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    background: "#3c3c3c",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: "#495057" }}>
                  Cantidad
                </label>
                <input
                  value={form.amountValue}
                  onChange={(e) => updateForm("amountValue", e.target.value)}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  style={{
                    width: "-webkit-fill-available",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #dee2e6",
                    marginTop: 6,
                    background: "#3c3c3c",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: "#495057" }}>
                  Moneda
                </label>
                <select
                  value={form.amountCurrency}
                  onChange={(e) => updateForm("amountCurrency", e.target.value)}
                  style={{
                    width: "-webkit-fill-available",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #dee2e6",
                    marginTop: 6,
                    background: "#3c3c3c",
                  }}
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: "#495057" }}>
                  Frecuencia
                </label>
                <select
                  value={form.frequency}
                  onChange={(e) => updateForm("frequency", e.target.value)}
                  style={{
                    width: "-webkit-fill-available",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #dee2e6",
                    marginTop: 6,
                    background: "#3c3c3c",
                  }}
                >
                  <option value="ONCE">Una sola vez</option>
                  <option value="WEEKLY">Semanal</option>
                  <option value="MONTHLY">Mensual</option>
                </select>
              </div>

              {form.frequency === "ONCE" && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: 12, fontWeight: 800, color: "#495057" }}>
                    Fecha de ejecución
                  </label>
                  <input
                    value={form.executionDate}
                    onChange={(e) => updateForm("executionDate", e.target.value)}
                    type="datetime-local"
                    style={{
                      width: "-webkit-fill-available",
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "1px solid #dee2e6",
                      marginTop: 6,
                      background: "#3c3c3c",
                    }}
                  />
                </div>
              )}

              {form.frequency === "WEEKLY" && (
                <>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: "#495057" }}>
                      Días de la semana
                    </label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                      {["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"].map((d) => {
                        const active = form.daysOfWeek.includes(d)
                        return (
                          <button
                            type="button"
                            key={d}
                            onClick={() => toggleDay(d)}
                            style={{
                              padding: "8px 10px",
                              borderRadius: 999,
                              border: "1px solid " + (active ? "#00a86b" : "#dee2e6"),
                              background: active ? "#3c3c3c" : "#fff",
                              color: active ? "#fff" : "#495057",
                              cursor: "pointer",
                              fontWeight: 700,
                              fontSize: 12,
                            }}
                          >
                            {DAY_ES[d] || d}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: "#495057" }}>
                      Inicio
                    </label>
                    <input
                      value={form.startDate}
                      onChange={(e) => updateForm("startDate", e.target.value)}
                      type="date"
                      style={{
                        width: "-webkit-fill-available",
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid #dee2e6",
                        marginTop: 6,
                        background: "#3c3c3c",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: "#495057" }}>
                      Fin
                    </label>
                    <input
                      value={form.endDate}
                      onChange={(e) => updateForm("endDate", e.target.value)}
                      type="date"
                      style={{
                        width: "-webkit-fill-available",
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid #dee2e6",
                        marginTop: 6,
                        background: "#3c3c3c",
                      }}
                    />
                  </div>
                </>
              )}

              {form.frequency === "MONTHLY" && (
                <>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: "#495057" }}>
                      Día del mes
                    </label>
                    <input
                      value={form.dayOfMonth}
                      onChange={(e) => updateForm("dayOfMonth", e.target.value)}
                      type="number"
                      min="1"
                      max="31"
                      style={{
                        width: "-webkit-fill-available",
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid #dee2e6",
                        marginTop: 6,
                        background: "#3c3c3c",
                      }}
                    />
                  </div>

                  <div />

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: "#495057" }}>
                      Inicio
                    </label>
                    <input
                      value={form.startDate}
                      onChange={(e) => updateForm("startDate", e.target.value)}
                      type="date"
                      style={{
                        width: "-webkit-fill-available",
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid #dee2e6",
                        marginTop: 6,
                        background: "#3c3c3c",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: "#495057" }}>
                      Fin
                    </label>
                    <input
                      value={form.endDate}
                      onChange={(e) => updateForm("endDate", e.target.value)}
                      type="date"
                      style={{
                        width: "-webkit-fill-available",
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid #dee2e6",
                        marginTop: 6,
                        background: "#3c3c3c",
                      }}
                    />
                  </div>
                </>
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 16,
                paddingTop: 14,
                borderTop: "1px solid #f1f3f5",
              }}
            >
              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #dee2e6",
                  background: "#fff",
                  color: "#495057",
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontWeight: 700,
                }}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #d0f0df",
                  background: submitting ? "#66c9a6" : "#00a86b",
                  color: "white",
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontWeight: 800,
                }}
              >
                {submitting ? "Creando..." : "Crear programación"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
  )
}

export default PaymentsPage
