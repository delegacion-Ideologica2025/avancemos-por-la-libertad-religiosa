import * as XLSX from 'xlsx';
import {
    DashboardData,
    Departamento,
    Municipio,
    Templo,
    NationalStats,
    BaseEntity
} from '@/lib/types';
import { normalize } from './utils';
import { LOCALIDAD_TO_LOCALIDAD_MAYOR } from './constants';

// --- HARDCODED METAS DATABASE ---
const METAS_BOGOTA: Record<string, number> = {
    "BOSA LA ESTACIÓN": 23,
    "BOSA RECREO": 23,
    "CANDELARIA LA NUEVA": 23,
    "CARVAJAL": 23,
    "CHAPINERO": 23,
    "EL SOSIEGO": 23,
    "ENGATIVÁ -VILLA GLADYS": 23,
    "FERIAS": 23,
    "FONTIBÓN": 23,
    "GALÁN": 23,
    "KENNEDY": 23,
    "CLASS ROMA": 23,
    "LA COLINA": 23,
    "LA GRANJA": 23,
    "LA VICTORIA": 23,
    "LIJACÁ": 23,
    "ORQUÍDEAS": 23,
    "PATIO BONITO": 23,
    "SAN VICENTE FERRER": 23,
    "SANTA LIBRADA": 23,
    "SANTA LUCÍA": 23,
    "SANTANDER BOGOTÁ": 23,
    "SUBA PINAR": 23,
    "SUBA FLORES": 23,
    "SUBA FONTANAR": 23,
    "SUBA LAS MERCEDES": 23,
    "SUBA LISBOA": 23,
    "PRADO VERANIEGO": 23,
    "SUBA RINCÓN": 23,
    "USME": 23
};

const METAS_DEPT: Record<string, number> = {
    "AMAZONAS": 23,
    "ANTIOQUIA": 736,
    "ARAUCA": 115,
    "ATLÁNTICO": 230,
    "BOGOTÁ D.C.": 690,
    "BOLÍVAR": 161,
    "BOYACÁ": 483,
    "CALDAS": 575,
    "CAQUETÁ": 437,
    "CASANARE": 161,
    "CAUCA": 437,
    "CÉSAR": 161,
    "CHOCÓ": 184,
    "CÓRDOBA": 230,
    "CUNDINAMARCA": 943,
    "GUAINÍA": 23,
    "GUAVIARE": 46,
    "HUILA": 644,
    "LA GUAJIRA": 115,
    "MAGDALENA": 207,
    "META": 506,
    "NARIÑO": 299,
    "NORTE DE SANTANDER": 253,
    "PUTUMAYO": 184,
    "QUINDÍO": 276,
    "RISARALDA": 552,
    "SAN ANDRÉS": 23,
    "SANTANDER": 414,
    "SUCRE": 115,
    "TOLIMA": 598,
    "VALLE DEL CAUCA": 1288,
    "VICHADA": 46
};

// --- HELPERS ---

// Specialized Bogotá Meta logic
const getMetaBogota = (name: string): number => {
    if (!name) return 23;
    const normalized = name.toUpperCase().trim();

    // Try exact match
    if (METAS_BOGOTA[normalized]) return METAS_BOGOTA[normalized];

    // Try fuzzy match
    const foundEntry = Object.entries(METAS_BOGOTA).find(([k]) => {
        return normalized.includes(k) || k.includes(normalized);
    });

    return foundEntry ? foundEntry[1] : 23;
};

// Generic safe cleaner
const cleanStr = (s: unknown): string => String(s || '').trim();
const cleanNum = (val: unknown): number => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const str = String(val).trim();
    if (str === '-') return 0;
    return Number(str) || 0;
};

// Fuzzy Key Finder
const findKey = (row: Record<string, any>, keyword: string): string | undefined => {
    const keys = Object.keys(row);
    if (row[keyword] !== undefined) return keyword;

    const lowerK = keyword.toLowerCase();

    if (keyword === 'Referidos Cargados') {
        const primary = keys.find(k => {
            const l = k.toLowerCase();
            return l.includes('referidos') && (l.includes('cargados') || l.includes('activos'));
        });
        if (primary) return primary;

        // Fallback: Just look for 'referidos' if no better match
        return keys.find(k => k.toLowerCase().includes('referidos'));
    }

    if (keyword === 'Localidad') {
        // Strict match first
        if (keys.includes('Localidad')) return 'Localidad';

        // Robust match with trim
        return keys.find(k => {
            const l = k.toLowerCase().trim();
            return l === 'localidad' || l === 'localidades' || l === 'templos' || l === 'templo' || l === 'centro' || l.includes('sector') || l.includes('estrategia') || l.includes('zona');
        });
    }

    if (keyword === 'Localidad Mayor') {
        const primary = keys.find(k => k.toLowerCase().includes('localidad') && k.toLowerCase().includes('mayor'));
        if (primary) return primary;
        // Fallback to anything with 'sector' or 'zona' if we're looking for the major bucket
        return keys.find(k => k.toLowerCase().includes('sector') || k.toLowerCase().includes('zona'));
    }

    if (keyword === 'Templo') {
        return keys.find(k => {
            const l = k.toLowerCase().trim();
            // EXCLUSION: If it matches 'referidos' or 'objetivo', it's NOT a temple name
            if (l.includes('referidos') || l.includes('activos') || l.includes('objetivo') || l.includes('meta')) return false;
            return l.includes('templo') || l.includes('centro') || l.includes('nombre') || l.includes('punto');
        });
    }

    if (keyword === 'Objetivo') {
        return keys.find(k => k.toLowerCase().includes('objetivo') || (k.toLowerCase().includes('meta') && !k.toLowerCase().includes('departamento')));
    }

    const found = keys.find(k => k.trim().toLowerCase() === lowerK.trim());
    return found;
};

const getVal = (row: Record<string, any>, key: string) => {
    const realKey = findKey(row, key);
    return realKey ? row[realKey] : undefined;
};

export const aggregateNodes = (nodes: (BaseEntity | Departamento | Municipio | Templo)[]): BaseEntity => {
    const referidos = nodes.reduce((acc, curr) => acc + (curr.referidos || 0), 0);
    const meta = nodes.reduce((acc, curr) => acc + (curr.meta || 0), 0);
    const templosCount = nodes.reduce((acc, curr) => acc + (curr.templosCount || 0), 0);

    const avance100 = meta > 0 ? (referidos / meta) * 100 : 0;
    const avance30 = meta > 0 ? Math.min((referidos / (meta * 0.3)) * 100, 100) : 0;
    const avance65 = meta > 0 ? Math.min((referidos / (meta * 0.65)) * 100, 100) : 0;

    return {
        name: 'Total',
        referidos,
        meta,
        templosCount,
        avance30: avance30,
        avance65: avance65,
        avance100: avance100
    };
};

export const processFiles = async (
    fileDept: File | null,
    fileMuni: File | null,
    fileTemplo: File | null
): Promise<DashboardData> => {

    const readExcel = async (file: File) => {
        try {
            const ab = await file.arrayBuffer();
            const wb = XLSX.read(ab, { type: 'array' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            return XLSX.utils.sheet_to_json(ws);
        } catch (e) {
            console.error("Error reading file", file.name, e);
            return [];
        }
    };

    let deptRaw: any[] = [];
    let muniRaw: any[] = [];
    let bogotaRaw: any[] = [];

    if (fileDept) deptRaw = await readExcel(fileDept);
    if (fileMuni) muniRaw = await readExcel(fileMuni);
    if (fileTemplo) bogotaRaw = await readExcel(fileTemplo);

    // --- 1. Process BOGOTA Localities (Excel 3) ---
    const bogotaTemplos: Templo[] = bogotaRaw.map((row, index) => {
        if (index === 0) {
            const keys = Object.keys(row);
            console.log('--- DEBUG: First Row Keys ---', keys);
            // Alert to show keys to the user
            alert(`COLUMNAS DE BOGOTÁ DETECTADAS:\n\n${JSON.stringify(keys, null, 2)}\n\nPor favor, toma una captura o dime qué columnas ves aquí.`);
        }
        let localidadMayor = cleanStr(getVal(row, 'Localidad Mayor'));
        const localidad = cleanStr(getVal(row, 'Localidad') || 'Desconocido');

        // If Localidad Mayor is missing, try to derive it from Localidad using constants
        if (!localidadMayor) {
            const normalizedLocalidad = normalize(localidad);
            // Search in LOCALIDAD_TO_LOCALIDAD_MAYOR by normalizing its keys too
            const matchedKey = Object.keys(LOCALIDAD_TO_LOCALIDAD_MAYOR).find(k => normalize(k) === normalizedLocalidad);
            if (matchedKey) {
                localidadMayor = LOCALIDAD_TO_LOCALIDAD_MAYOR[matchedKey];
            } else {
                // Last ditch effort: directly check if the localidad name matches an official sector name
                const officialSector = Object.values(LOCALIDAD_TO_LOCALIDAD_MAYOR).find(v => normalize(v) === normalizedLocalidad);
                if (officialSector) {
                    localidadMayor = officialSector;
                }
            }
        }

        const temploName = cleanStr(getVal(row, 'Templo') || getVal(row, 'Centro') || localidad);

        let meta = cleanNum(getVal(row, 'Objetivo'));
        if (!meta || meta === 0) meta = getMetaBogota(temploName);

        const referidos = cleanNum(getVal(row, 'Referidos Cargados'));
        const avance100 = meta > 0 ? (referidos / meta) * 100 : 0;
        const avance30 = meta > 0 ? Math.min((referidos / (meta * 0.3)) * 100, 100) : 0;
        const avance65 = meta > 0 ? Math.min((referidos / (meta * 0.65)) * 100, 100) : 0;

        return {
            type: 'templo',
            name: temploName,
            localidad: localidad,
            localidadMayor: localidadMayor,
            meta,
            referidos,
            avance30: avance30,
            avance65: avance65,
            avance100: avance100,
            templosCount: referidos > 0 ? 1 : 0
        };
    });

    // --- 2. Process MUNICIPIOS (Excel 2) ---
    const municipiosList: Municipio[] = muniRaw.map((row) => {
        const name = cleanStr(getVal(row, 'Municipio'));
        let dept = cleanStr(getVal(row, 'Departamento'));

        // Standardization for municipalities too
        if (normalize(dept) === 'NORTE DE SAN' || normalize(dept) === 'NORTE DE SANTANDER') {
            dept = 'NORTE DE SANTANDER';
        }
        if (normalize(dept) === 'VALLE' || normalize(dept) === 'VALLE DEL CAU') {
            dept = 'VALLE DEL CAUCA';
        }

        const meta = 23; // Default meta for municipios
        const referidos = cleanNum(getVal(row, 'Referidos Cargados'));
        const templosCount = cleanNum(getVal(row, 'Templos'));

        const avance100 = meta > 0 ? (referidos / meta) * 100 : 0;
        const avance30 = meta > 0 ? Math.min((referidos / (meta * 0.3)) * 100, 100) : 0;
        const avance65 = meta > 0 ? Math.min((referidos / (meta * 0.65)) * 100, 100) : 0;

        const temploRaw = getVal(row, 'Centro') || getVal(row, 'Templo') || getVal(row, 'Templos');
        const temploName = temploRaw ? cleanStr(temploRaw) : '';

        const isBogotaRow = normalize(name).includes('BOGOTA');

        return {
            type: 'municipio',
            name,
            departamento: dept,
            temploName,
            templosCount: (referidos > 0 && !isBogotaRow) ? 1 : 0,
            templosTarget: templosCount || 1, // Store total temples from Excel (default to 1)
            meta,
            referidos,
            avance30: avance30,
            avance65: avance65,
            avance100: avance100,
        };
    });

    // Handle Bogota Logic in Municipios List
    let bogotaMuni = municipiosList.find(m => normalize(m.name).includes('BOGOTA'));

    if (bogotaTemplos.length > 0) {
        const agg = aggregateNodes(bogotaTemplos);

        if (bogotaMuni) {
            bogotaMuni.children = bogotaTemplos;
            bogotaMuni.meta = agg.meta;
            bogotaMuni.referidos = agg.referidos;
            bogotaMuni.avance100 = agg.avance100;
            bogotaMuni.avance65 = agg.avance65;
            bogotaMuni.avance30 = agg.avance30;
            bogotaMuni.templosCount = agg.templosCount;
            bogotaMuni.templosTarget = bogotaTemplos.length;
        } else {
            bogotaMuni = {
                type: 'municipio',
                name: 'Bogotá D.C.',
                departamento: 'Bogotá D.C.',
                templosCount: agg.templosCount,
                templosTarget: bogotaTemplos.length, // Total temples in Bogota
                meta: agg.meta,
                referidos: agg.referidos,
                avance30: agg.avance30,
                avance65: agg.avance65,
                avance100: agg.avance100,
                children: bogotaTemplos
            };
            municipiosList.push(bogotaMuni);
        }
    }

    // --- 3. Process DEPARTAMENTOS (Excel 1) ---
    const departamentos: Departamento[] = deptRaw.map((row) => {
        let name = cleanStr(getVal(row, 'Departamento'));

        // FIX: Standardization of names
        if (normalize(name) === 'NORTE DE SAN' || normalize(name) === 'NORTE DE SANTANDER') {
            name = 'NORTE DE SANTANDER';
        }
        if (normalize(name) === 'VALLE' || normalize(name) === 'VALLE DEL CAU') {
            name = 'VALLE DEL CAUCA';
        }

        const referidos = cleanNum(getVal(row, 'Referidos Cargados'));
        const templosColumnVal = cleanNum(getVal(row, 'Templos')); // Metas of templos

        const meta = templosColumnVal * 23;
        let finalMeta = meta;

        if (normalize(name).includes('BOGOTA')) {
            finalMeta = 30 * 23;
        }

        let children = municipiosList.filter(m => normalize(m.departamento) === normalize(name));

        // PROGRESSIVE COUNT: Sum actual active templos from children (municipios with referidos)
        const activeTemplosCount = children.reduce((acc, c) => acc + (c.templosCount || 0), 0);

        const finalAvance100 = finalMeta > 0 ? (referidos / finalMeta) * 100 : 0;
        const finalAvance30 = finalMeta > 0 ? Math.min((referidos / (finalMeta * 0.3)) * 100, 100) : 0;
        const finalAvance65 = finalMeta > 0 ? Math.min((referidos / (finalMeta * 0.65)) * 100, 100) : 0;

        return {
            type: 'departamento',
            name,
            templosCount: activeTemplosCount, // Current Progress (Active)
            templosTarget: templosColumnVal, // Goal Target (Meta)
            meta: finalMeta,
            referidos,
            avance30: finalAvance30,
            avance65: finalAvance65,
            avance100: finalAvance100,
            children
        };
    });

    // --- 4. NATIONAL ---
    const aggNational = aggregateNodes(departamentos);

    // Robust National Calculation: Sum ALL active municipios/templos to avoid losses during depth matching
    const totalActiveTemplos = (municipiosList || []).reduce((acc, m) => acc + (m.templosCount || 0), 0);
    const totalTargetTemplos = (departamentos || []).reduce((acc, d) => acc + (d.templosTarget || 0), 0);

    const national: NationalStats = {
        type: 'nacional',
        name: 'Nacional',
        templosCount: totalActiveTemplos,
        templosTarget: totalTargetTemplos,
        meta: aggNational.meta,
        referidos: aggNational.referidos,
        avance30: aggNational.avance30,
        avance65: aggNational.avance65,
        avance100: aggNational.avance100
    };

    return {
        departamentos,
        municipios: municipiosList,
        templos: bogotaTemplos,
        national,
        lastUpdated: new Date().toISOString(),
        version: 2
    };
};

export const generateMockData = (): DashboardData => {
    const antioquiaMeta = METAS_DEPT["ANTIOQUIA"];
    const bogotaMeta = METAS_DEPT["BOGOTÁ D.C."];

    const bogotaT: Templo[] = [
        { type: 'templo', name: 'BOSA RECREO', localidad: 'BOSA RECREO', meta: 146, referidos: 73, avance30: 50, avance65: 50, avance100: 50 },
        { type: 'templo', name: 'USME', localidad: 'USME', meta: 93, referidos: 10, avance30: 10, avance65: 10, avance100: 10 },
    ];

    const bogotaMuni: Municipio = {
        type: 'municipio', name: 'Bogotá D.C.', departamento: 'Bogotá D.C.', templosCount: 2, meta: (146 + 93), referidos: 83, avance30: 34, avance65: 34, avance100: 34, children: bogotaT
    };

    const antioquiaMuni: Municipio = {
        type: 'municipio', name: 'Medellín', departamento: 'Antioquia', templosCount: 50, meta: 23, referidos: 20, avance30: 86, avance65: 86, avance100: 86
    };

    const antioquia: Departamento = {
        type: 'departamento', name: 'ANTIOQUIA', templosCount: 50, meta: antioquiaMeta, referidos: 700, avance30: 95, avance65: 95, avance100: 95, children: [antioquiaMuni]
    };

    const bogotaDept: Departamento = {
        type: 'departamento', name: 'BOGOTÁ D.C.', templosCount: 200, meta: bogotaMeta, referidos: 1000, avance30: 34, avance65: 34, avance100: 34, children: [bogotaMuni]
    };

    return {
        departamentos: [antioquia, bogotaDept],
        municipios: [antioquiaMuni, bogotaMuni],
        templos: bogotaT,
        national: { type: 'nacional', name: 'Nacional', templosCount: 250, meta: (antioquiaMeta + bogotaMeta), referidos: 1700, avance30: 47, avance65: 47, avance100: 47 },
        lastUpdated: new Date().toISOString()
    };
};
