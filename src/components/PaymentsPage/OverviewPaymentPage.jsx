import React, { useEffect, useState } from "react"
import { getAccountIdFromLocalStorage, prettifyDaysOfWeek, formatLocalDateTimeES } from "./utils"
import { schedulerApi } from "../../api";

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
                `Una vez · ${formatLocalDateTimeES(s.executionDate)}`
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

            try {
                const res = await schedulerApi.getUpcomingTransfer(accountId)

                setUpcomingPayments(Array.isArray(res) ? res : [])
            } catch (error) {
                setUpcomingError(`Error al obtener próximos pagos programados: ${error.message}`)
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
