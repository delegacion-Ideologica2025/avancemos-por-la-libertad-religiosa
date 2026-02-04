export interface BaseEntity {
    name: string;
    referidos: number;
    meta: number;
    avance30: number;
    avance65: number;
    avance100: number;
    templosCount?: number;
    templosTarget?: number;
    type?: 'nacional' | 'departamento' | 'municipio' | 'templo';
}

export interface Templo extends BaseEntity {
    type: 'templo';
    localidad?: string;
    localidadMayor?: string;
}

export interface Municipio extends BaseEntity {
    type: 'municipio';
    departamento: string;
    temploName?: string;
    children?: Templo[];
}

export interface Departamento extends BaseEntity {
    type: 'departamento';
    children?: (Municipio | Templo)[];
}

export interface NationalStats extends BaseEntity {
    type: 'nacional';
}

export interface JuanFelipeData {
    total: number;
    locations: string;
}

export interface DashboardData {
    departamentos: Departamento[];
    municipios: Municipio[];
    templos: Templo[];
    national: NationalStats;
    lastUpdated: string;
    version?: number;
    juanFelipeData?: JuanFelipeData;
    carolinaData?: JuanFelipeData;
}
