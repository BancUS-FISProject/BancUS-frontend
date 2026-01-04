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
