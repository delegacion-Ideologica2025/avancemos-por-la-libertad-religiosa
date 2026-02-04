export const CMJ_DC_LIST = [
    'USAQUÉN',
    'SAN CRISTÓBAL',
    'BOSA',
    'KENNEDY',
    'FONTIBÓN',
    'ENGATIVÁ',
    'SUBA',
    'RAFAEL URIBE',
    // Nuevos
    'ANTONIO NARIÑO',
    'CIUDAD BOLÍVAR',
    'PUENTE ARANDA',
    'TEUSAQUILLO',
    'TUNJUELITO',
    'USME'
];

export const CMJ_OFFICIAL_CENTERS: Record<string, number> = {
    // Originales (heredados de Ediles, aunque en CMJ se pidió especificidad)
    'USAQUÉN': 2,
    'SAN CRISTÓBAL': 2,
    'BOSA': 2,
    'KENNEDY': 4,
    'FONTIBÓN': 1,
    'ENGATIVÁ': 3,
    'SUBA': 8,
    'RAFAEL URIBE': 1,

    // Nuevos con reglas específicas
    'CIUDAD BOLÍVAR': 1,
    'USME': 2,

    // Por defecto 1 si no está listado aquí explícitamente, pero es buena práctica listarlos
    'ANTONIO NARIÑO': 1,
    'PUENTE ARANDA': 1,
    'TEUSAQUILLO': 1,
    'TUNJUELITO': 1
};

export const CMJ_MAPPING_OVERRIDES: Record<string, string> = {
    'SANTANDER': 'ANTONIO NARIÑO',
    'CANDELARIA LA NUEVA': 'CIUDAD BOLÍVAR',
    'GALÁN': 'PUENTE ARANDA',
    'GALAN': 'PUENTE ARANDA',
    'CHAPINERO': 'TEUSAQUILLO',
    'SAN VICENTE FERRER': 'TUNJUELITO',
    'SANTA LIBRADA': 'USME',
    'USME': 'USME'
};

export const CMJ_TOTAL_COUNT = 300; // Aproximado
