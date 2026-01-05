import React, { useEffect, useState } from "react"
import { getAccountIdFromLocalStorage, getAuthToken, prettifyDaysOfWeek } from "./utils"

function OverviewPaymentsPage() {

    const [upcomingPayments, setUpcomingPayments] = useState([]);
    const [upcomingLoading, setUpcomingLoading] = useState(false);
    const [upcomingError, setUpcomingError] = useState("");

    const formatMoney = (amount) => {
        const value = amount?.value
        const currency = amount?.currency

        if (value == null) return "-"

        return `${value} ${currency || ""}`.trim()
    }

    const formatWhen = (p) => {
        const s = p?.schedule

        if (!s?.frequency) return ""

        if (s.frequency === "ONCE") {
            return s.executionDate ? 
                `Una vez · ${new Date(s.executionDate).toLocaleString()}`
            : 
                "Una vez"
        }

        if (s.frequency === "MONTHLY") {
            return s.dayOfMonth ? 
                `Mensual · día ${s.dayOfMonth}` 
            : 
                "Mensual"
        }

        if (s.frequency === "WEEKLY") {
            const days = Array.isArray(s.daysOfWeek) ? 
                prettifyDaysOfWeek(s.daysOfWeek)
            : 
                ""
            return days ? `Semanal · ${days}` : "Semanal"
        }

        return s.frequency
    }

    useEffect(() => {

        const loadUpcoming = async () => {

            setUpcomingLoading(true)
            setUpcomingError("")
            setUpcomingPayments([])

            const accountId = getAccountIdFromLocalStorage()

            if (!accountId) {
                setUpcomingError("No se pudo obtener la cuenta del usuario.")
                setUpcomingLoading(false)
                return
            }

            const token = getAuthToken()

            try {
                const res = await fetch(
                    `http://localhost:10000/v1/scheduled-payments/accounts/${accountId}/upcoming?limit=2`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                    }
                )

                if (res.status === 404) {
                    setUpcomingError("La cuenta no existe.")
                    return
                }

                if (!res.ok) {
                    const txt = await res.text().catch(() => "")
                    setUpcomingError(`Error obteniendo próximos pagos (${res.status}). ${txt}`)
                    return
                }

                const data = await res.json()
                setUpcomingPayments(Array.isArray(data) ? data : [])
            } catch {
                setUpcomingError("No se pudo conectar con el microservicio de pagos.")
            } finally {
                setUpcomingLoading(false)
            }
        }

    loadUpcoming()
}, [])


    return (
        <div className="list-block">
            {upcomingLoading && (
                <div className="list-row">
                <span>Cargando próximos pagos...</span>
                <span></span>
                </div>
            )}

            {!upcomingLoading && upcomingError && (
                <div className="list-row">
                <span style={{ color: "#b00020" }}>{upcomingError}</span>
                <span></span>
                </div>
            )}

            {!upcomingLoading && !upcomingError && upcomingPayments.length === 0 && (
                <div className="list-row">
                <span className="muted">No tienes pagos programados próximos.</span>
                <span></span>
                </div>
            )}

            {!upcomingLoading &&
            !upcomingError &&
            upcomingPayments.map((p) => (
                <div className="list-row" key={p.id}>
                <span>
                <strong>{p.description || "Pago programado"}</strong>
                <span className="muted"> · {formatWhen(p)}</span>
                </span>
                <span>{formatMoney(p.amount)}</span>
                </div>
            ))}
        </div>
    )
}

export default OverviewPaymentsPage
