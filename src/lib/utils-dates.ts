/**
 * Determina el hito de avance predeterminado basado en la fecha actual.
 * - Hasta el 15 de febrero de 2026: "65"
 * - Desde el 16 de febrero de 2026 en adelante: "100"
 */
export const getDefaultMilestone = (): string => {
    const today = new Date();
    const cut30 = new Date(2026, 0, 15); // 15 de Enero
    const cut65 = new Date(2026, 1, 7);  // 7 de Febrero (Mes 1 en JS)

    if (today <= cut30) return "30";
    if (today <= cut65) return "65";
    return "100";
};

export const isRedEnabled = (): boolean => {
    const today = new Date();
    const redActivationDate = new Date(2026, 1, 8); // 8 de Febrero
    return today >= redActivationDate;
};
