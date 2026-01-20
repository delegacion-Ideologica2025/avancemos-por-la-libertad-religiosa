/**
 * Determina el hito de avance predeterminado basado en la fecha actual.
 * - Hasta el 15 de febrero de 2026: "65"
 * - Desde el 16 de febrero de 2026 en adelante: "100"
 */
export const getDefaultMilestone = (): string => {
    const today = new Date();
    const targetDate = new Date(2026, 1, 15); // 15 de Febrero (Mes 1 en JS)

    return today <= targetDate ? "65" : "100";
};
