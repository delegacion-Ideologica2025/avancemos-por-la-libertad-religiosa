import * as XLSX from 'xlsx';
import type {
    DashboardData,
    Departamento,
    Municipio,
    Templo,
    NationalStats,
    BaseEntity
} from '@/lib/types';

// --- HARDCODED METAS DATABASE ---
const METAS_BOGOTA: Record<string, number> = {
    "BOSA LA ESTACIÓN": 93,
    "BOSA RECREO": 146,
    "CANDELARIA LA NUEVA": 93,
    "CARVAJAL": 93,
    "CHAPINERO": 93,
    "EL SOSIEGO": 60,
    "ENGATIVÁ -VILLA GLADYS": 93,
    "FERIAS": 146,
    "FONTIBÓN": 146,
    "GALÁN": 146,
    "KENNEDY": 146,
    "CLASS ROMA": 61,
    "LA COLINA": 146,
    "LA GRANJA": 146,
    "LA VICTORIA": 60,
    "LIJACÁ": 60,
    "ORQUÍDEAS": 146,
    "PATIO BONITO": 60,
    "SAN VICENTE FERRER": 60,
    "SANTA LIBRADA": 60,
    "SANTA LUCÍA": 146,
    "SANTANDER BOGOTÁ": 146,
    "SUBA PINAR": 60,
    "SUBA FLORES": 60,
    "SUBA FONTANAR": 60,
    "SUBA LAS MERCEDES": 60,
    "SUBA LISBOA": 60,
    "PRADO VERANIEGO": 60,
    "SUBA RINCÓN": 60,
    "USME": 93
};

const METAS_DEPT: Record<string, number> = {
    "AMAZONAS": 23,
    "ANTIOQUIA": 736,
    "ARAUCA": 115,
    "ATLÁNTICO": 230,
    "BOGOTÁ D.C.": 2859,
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

// Normalize string for dictionary lookup (remove accents, trim, uppercase)
const normalize = (str: string) => {
    if (!str) return '';
    let s = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
    s = s.replace(/\.?D\.?C\.?/g, '').trim();
    s = s.replace(/\(BTA\)/g, '').trim();
    s = s.replace(/[^A-Z0-9\s]/g, ' ').replace(/\s+/g, ' ');
    return s;
};

// Normalized maps
const METAS_BOGOTA_NORM = Object.entries(METAS_BOGOTA).reduce((acc, [k, v]) => {
    acc[normalize(k)] = v;
    return acc;
}, {} as Record<string, number>);

const METAS_DEPT_NORM = Object.entries(METAS_DEPT).reduce((acc, [k, v]) => {
    acc[normalize(k)] = v;
    return acc;
}, {} as Record<string, number>);


const getMetaBogota = (name: string): number => {
    const n = normalize(name);
    if (METAS_BOGOTA_NORM[n]) return METAS_BOGOTA_NORM[n];
    const key = Object.keys(METAS_BOGOTA_NORM).find(k => k === n || n.includes(k) || k.includes(n));
    return key ? METAS_BOGOTA_NORM[key] : 23;
};

const getMetaDept = (name: string): number => {
    const n = normalize(name);

    // Explicit Aliases
    if (n === 'VALLE') return METAS_DEPT["VALLE DEL CAUCA"];
    if (n === 'NORTE DE SAN') return METAS_DEPT["NORTE DE SANTANDER"]; // Common abbreviation
    if (n === 'SAN ANDRES') return METAS_DEPT["SAN ANDRÉS"];

    const key = Object.keys(METAS_DEPT_NORM).find(k => k === n);
    if (key) return METAS_DEPT_NORM[key];

    // Fuzzy fallback
    const fuzzy = Object.keys(METAS_DEPT_NORM).find(k => k.startsWith(n) || n.startsWith(k));
    return fuzzy ? METAS_DEPT_NORM[fuzzy] : 23;
};

// Helper to calculate milestone progress
const calcProgress = (ref: number, meta: number, factor: number, cap: boolean = false) => {
    if (!meta || meta === 0) return 0;
    const progress = (ref / (meta * factor)) * 100;
    return cap ? Math.min(progress, 100) : progress;
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
        return keys.find(k => {
            const l = k.toLowerCase();
            return l.includes('referidos') && (l.includes('cargados') || l.includes('activos'));
        });
    }

    if (keyword === 'Localidad') {
        if (keys.includes('Localidad')) return 'Localidad';
    }

    const found = keys.find(k => k.trim().toLowerCase() === lowerK.trim());
    return found;
};

const getVal = (row: Record<string, any>, key: string) => {
    const realKey = findKey(row, key);
    return realKey ? row[realKey] : undefined;
};

const aggregateNodes = (nodes: (BaseEntity | Departamento | Municipio | Templo)[]): BaseEntity => {
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
    const bogotaTemplos: Templo[] = bogotaRaw.map((row) => {
        const name = cleanStr(getVal(row, 'Localidad') || getVal(row, 'Templo') || 'Desconocido');
        const meta = getMetaBogota(name);

        const referidos = cleanNum(getVal(row, 'Referidos Cargados'));
        const avance100 = meta > 0 ? (referidos / meta) * 100 : 0;
        const avance30 = meta > 0 ? Math.min((referidos / (meta * 0.3)) * 100, 100) : 0;
        const avance65 = meta > 0 ? Math.min((referidos / (meta * 0.65)) * 100, 100) : 0;

        return {
            type: 'templo',
            name: name,
            localidad: name,
            meta,
            referidos,
            avance30: avance30,
            avance65: avance65,
            avance100: avance100
        };
    });

    // --- 2. Process MUNICIPIOS (Excel 2) ---
    const municipiosList: Municipio[] = muniRaw.map((row) => {
        const name = cleanStr(getVal(row, 'Municipio'));
        const dept = cleanStr(getVal(row, 'Departamento'));

        const meta = 23; // Default meta for municipios
        const referidos = cleanNum(getVal(row, 'Referidos Cargados'));
        const templosCount = cleanNum(getVal(row, 'Templos'));

        const avance100 = meta > 0 ? (referidos / meta) * 100 : 0;
        const avance30 = meta > 0 ? Math.min((referidos / (meta * 0.3)) * 100, 100) : 0;
        const avance65 = meta > 0 ? Math.min((referidos / (meta * 0.65)) * 100, 100) : 0;

        const temploRaw = getVal(row, 'Centro') || getVal(row, 'Templo') || getVal(row, 'Templos');
        const temploName = temploRaw ? cleanStr(temploRaw) : '';

        return {
            type: 'municipio',
            name,
            departamento: dept,
            temploName,
            templosCount,
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
            bogotaMuni.templosCount = bogotaTemplos.length;
        } else {
            bogotaMuni = {
                type: 'municipio',
                name: 'Bogotá D.C.',
                departamento: 'Bogotá D.C.',
                templosCount: bogotaTemplos.length,
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
        if (normalize(name) === 'VALLE') {
            name = 'VALLE DEL CAUCA';
        }

        const meta = getMetaDept(name);

        const referidos = cleanNum(getVal(row, 'Referidos Cargados'));
        const templosCount = cleanNum(getVal(row, 'Templos'));

        const avance100 = meta > 0 ? (referidos / meta) * 100 : 0;
        const avance30 = meta > 0 ? Math.min((referidos / (meta * 0.3)) * 100, 100) : 0;
        const avance65 = meta > 0 ? Math.min((referidos / (meta * 0.65)) * 100, 100) : 0;
        let children = municipiosList.filter(m => normalize(m.departamento) === normalize(name));

        // Special case for Bogotá: 
        // 1. If children is empty (common if Excel 2 lacks BGA), use bogotaTemplos (Excel 3)
        // 2. Ensure templosCount reflects the number of localities/units
        let finalTemplosCount = templosCount;
        if (normalize(name).includes('BOGOTA')) {
            if (children.length === 0 || (children.length === 1 && normalize(children[0].name).includes('BOGOTA'))) {
                // If we only have the "BOGOTA" muni but we have specific localities, use those as children
                if (bogotaTemplos.length > 0) {
                    children = bogotaTemplos as any;
                }
            }

            // Aggressive meta correction for Bogotá department
            if (!finalTemplosCount || finalTemplosCount === 0) {
                finalTemplosCount = children.length;
            }
        }

        return {
            type: 'departamento',
            name,
            templosCount: finalTemplosCount, // Use the raw count from Excel row
            meta,
            referidos,
            avance30: avance30,
            avance65: avance65,
            avance100: avance100,
            children
        };
    });

    // --- 4. NATIONAL ---
    let national: NationalStats;
    if (departamentos.length > 0) {
        const agg = aggregateNodes(departamentos);
        national = {
            type: 'nacional',
            name: 'Nacional',
            templosCount: 485, // Use the fixed national meta as requested
            meta: agg.meta,
            referidos: agg.referidos,
            avance30: agg.avance30,
            avance65: agg.avance65,
            avance100: agg.avance100
        };
    } else {
        const emptyNational: NationalStats = { name: "Nacional", type: 'nacional', meta: 0, referidos: 0, avance30: 0, avance65: 0, avance100: 0, templosCount: 485 };
        national = emptyNational;
    }

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
