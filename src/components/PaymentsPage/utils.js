export const getAccountIdFromLocalStorage = () => {

    const user = localStorage.getItem("authUser")

    if (!user) return null

    try {
    const userParsed = JSON.parse(user)
    return userParsed.iban || null
    } catch {
    return null
    }
}

export const getAuthToken = () => {
    const token = localStorage.getItem("authToken")
    return token || null
}

export const prettifyDaysOfWeek = (days) => {
    if (!Array.isArray(days) || days.length === 0) return "-"

    const translated = days.map((d) => DAY_ES[d] || d)

    if (translated.length === 1) return translated[0]
    if (translated.length === 2) return `${translated[0]} y ${translated[1]}`

    return `${translated.slice(0, -1).join(", ")} y ${translated[translated.length - 1]}`
}

export const DAY_ES = {
    MONDAY: "Lunes",
    TUESDAY: "Martes",
    WEDNESDAY: "Miércoles",
    THURSDAY: "Jueves",
    FRIDAY: "Viernes",
    SATURDAY: "Sábado",
    SUNDAY: "Domingo",
}

export const formatLocalDateTimeES = (utcValue) => {
  if (!utcValue) return "-"

  let v = utcValue

  if (typeof v === "string" && !/[zZ]|[+-]\d{2}:\d{2}$/.test(v)) {
    v = v + "Z"
  }

  const d = v instanceof Date ? v : new Date(v)
  if (Number.isNaN(d.getTime())) return "-"

  return d.toLocaleString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}
