"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn, getProgressColor } from "@/lib/utils";
import { User, Target, Users, Activity, Landmark, Search } from 'lucide-react';
import { DashboardData, Departamento, Municipio } from '@/lib/types';
import { getDefaultMilestone, isRedEnabled } from '@/lib/utils-dates';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, TrendingUp } from 'lucide-react';
import { CouncilEvolutionModal } from './council-evolution-modal';

interface CouncilCardProps {
    municipalityName: string;
    departmentName: string;
    meta: number;
    referidos: number;
    className?: string;
    customColor?: string;
    milestone: number;
}

function CouncilCard({ municipalityName, departmentName, meta, referidos, className, customColor: initialColor, milestone }: CouncilCardProps) {
    // Progress based on selected milestone
    const targetMeta = meta * (milestone / 100);
    const progress = targetMeta > 0 ? (referidos / targetMeta) * 100 : 0;

    // Use dynamic color based on progress and milestone
    const progressColor = getProgressColor(progress, milestone);
    const isSpecialCase = milestone === 100 && progress < 30 && !isRedEnabled();

    const borderColor = isSpecialCase ? "border-white/20" : `border-[${progressColor}]/50`;
    const bgColor = isSpecialCase ? "bg-white/5" : `bg-[${progressColor}]/10`;
    const accentBg = isSpecialCase ? "#1e293b" : progressColor; // Dark slate for header
    const textColor = progressColor;

    return (
        <Card className={cn("overflow-hidden border-2 transition-all hover:scale-105 z-10 hover:z-20 shadow-lg w-full max-w-[280px]", borderColor, bgColor, className)}>
            <div className="py-2 px-3 text-sm font-black text-white uppercase text-center truncate" style={{ backgroundColor: accentBg }}>
                {municipalityName}
            </div>
            <CardContent className="p-3 flex flex-col items-center">
                <div className="text-center space-y-0.5 mb-1">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase">
                        {departmentName}
                    </p>
                    <p className="text-xs font-bold text-muted-foreground uppercase">
                        Objetivo: {meta.toLocaleString('es-CO')} | REF: {referidos.toLocaleString('es-CO')}
                    </p>
                </div>
                <div className="text-3xl font-black font-mono" style={{ color: textColor }}>
                    {progress.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                </div>
            </CardContent>
        </Card>
    );
}

interface KPICardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    subtext?: string;
    color?: "default" | "blue" | "green" | "amber";
}

function KPICard({ title, value, icon: Icon, subtext, color = "default" }: KPICardProps) {
    const colorStyles = {
        default: "text-foreground",
        blue: "text-blue-400",
        green: "text-emerald-400",
        amber: "text-amber-400"
    };

    return (
        <Card className="bg-muted/10 border-muted/50 shadow-sm backdrop-blur-sm">
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                    <h3 className={cn("text-4xl font-bold tracking-tight", colorStyles[color])}>{value}</h3>
                    {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
                </div>
                <div className={cn("p-3 rounded-full bg-muted/20", colorStyles[color])}>
                    <Icon className="w-6 h-6" />
                </div>
            </CardContent>
        </Card>
    );
}

const normalize = (str: string) => {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
};

export function ConcejalesView({ data, panoramaScope }: { data: DashboardData, panoramaScope?: 'total' | 'nacional' | 'bogota' }) {
    const [milestone, setMilestone] = useState<string>(getDefaultMilestone());
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDept, setSelectedDept] = useState<string>("ALL");
    const [showZeroOnly, setShowZeroOnly] = useState(false);
    const [isEvolutionOpen, setIsEvolutionOpen] = useState(false);

    const targetEntities = useMemo(() => [
        { dept: "ANTIOQUIA", muni: "APARTADO", name: "WILLIAM BLANDON" },
        { dept: "ANTIOQUIA", muni: "CARMEN DE VIBORAL", name: "JOHN MONTOYA" },
        { dept: "ANTIOQUIA", muni: "COPACABANA", name: "DEISY SUAREZ" },
        { dept: "ANTIOQUIA", muni: "NECOCLI", name: "GERMAN CALLE" },
        { dept: "ARAUCA", muni: "TAME", name: "NORELA CORONADO" },
        { dept: "ARAUCA", muni: "ARAUCA", name: "LIONSO ARAUJO" },
        { dept: "BOGOTA", muni: "BOGOTA", name: "BOGOTÁ (2)" },
        { dept: "BOYACA", muni: "SACHICA", name: "EVELIN CABEZAS" },
        { dept: "BOYACA", muni: "SOGAMOSO", name: "DIEGO PEREZ" },
        { dept: "CALDAS", muni: "AGUADAS", name: "DIANA IGLESIAS" },
        { dept: "CALDAS", muni: "ANSERMA", name: "ANGIE RIVERA" },
        { dept: "CALDAS", muni: "CHINCHINA", name: "JOSE OCAMPO" },
        { dept: "CALDAS", muni: "FILADELFIA", name: "ELSY MANRIQUE" },
        { dept: "CALDAS", muni: "LA DORADA", name: "MARIA MORALES" },
        { dept: "CALDAS", muni: "MANIZALES", name: "YULI GALLEGO" },
        { dept: "CALDAS", muni: "PACORA", name: "LUIS GONZALEZ" },
        { dept: "CALDAS", muni: "SUPIA", name: "DENIS LARGO" },
        { dept: "CALDAS", muni: "VILLAMARIA", name: "MARIAN HERRERA" },
        { dept: "CALDAS", muni: "VITERBO", name: "ALBERTO VILLA" },
        { dept: "CAUCA", muni: "CORINTO", name: "MILDRETH GIL" },
        { dept: "CAUCA", muni: "GUACHENE", name: "JUAN MINA" },
        { dept: "CAUCA", muni: "MIRANDA", name: "ERIKA MOSQUERA" },
        { dept: "CAUCA", muni: "PATIA (EL BORDO)", name: "NINI GARCES" },
        { dept: "CAUCA", muni: "POPAYAN", name: "FERNANDO LÓPEZ" },
        { dept: "CESAR", muni: "AGUSTIN CODAZZI", name: "YEISETH MIRANDA" },
        { dept: "CHOCO", muni: "CONDOTO", name: "WALTER MOSQUERA" },
        { dept: "CHOCO", muni: "ISTMINA", name: "INGRID MINOTA" },
        { dept: "CHOCO", muni: "QUIBDO", name: "MARIA BLANDON" },
        { dept: "CUNDINAMARCA", muni: "CAJICA", name: "CLAUDIA GRACIANO" },
        { dept: "CUNDINAMARCA", muni: "CHIA", name: "JAVIER VALDIVIESO" },
        { dept: "CUNDINAMARCA", muni: "FACATATIVA", name: "DIANA MORALES" },
        { dept: "CUNDINAMARCA", muni: "FUNZA", name: "CARLOS JIMENEZ" },
        { dept: "CUNDINAMARCA", muni: "FUSAGASUGA", name: "SANDRA VARGAS" },
        { dept: "CUNDINAMARCA", muni: "MOSQUERA", name: "LUIS ORTIZ" },
        { dept: "CUNDINAMARCA", muni: "SAN BERNARDO", name: "ALEJANDRO CRUZ" },
        { dept: "CUNDINAMARCA", muni: "SILVANIA", name: "DANIA ALVAREZ" },
        { dept: "CUNDINAMARCA", muni: "SOACHA", name: "JAZMIN OLARTE" },
        { dept: "CUNDINAMARCA", muni: "TABIO", name: "ANDRES ZAPATA" },
        { dept: "CUNDINAMARCA", muni: "UBATE", name: "OMAR RODRIGUEZ" },
        { dept: "CUNDINAMARCA", muni: "VILLETA", name: "EMILCE ACERO" },
        { dept: "META", muni: "ACACIAS", name: "ZULMA DIAZ" },
        { dept: "META", muni: "RESTREPO", name: "SANTIAGO LOPEZ" },
        { dept: "META", muni: "VILLAVICENCIO", name: "KAREN CEDANO" },
        { dept: "QUINDIO", muni: "ARMENIA", name: "ALDRIN LUNA" },
        { dept: "QUINDIO", muni: "CALARCA", name: "ALBA PULIDO" },
        { dept: "QUINDIO", muni: "CIRCASIA", name: "NICOLAS TORO" },
        { dept: "QUINDIO", muni: "FILANDIA", name: "LUZ TEJADA" },
        { dept: "QUINDIO", muni: "GENOVA", name: "JEFERSON BLANDON" },
        { dept: "QUINDIO", muni: "LA TEBAIDA", name: "MARILY BUENO" },
        { dept: "QUINDIO", muni: "MONTENEGRO", name: "LILIANA FLOREZ" },
        { dept: "QUINDIO", muni: "QUIMBAYA", name: "BLANCA CEBALLOS" },
        { dept: "QUINDIO", muni: "SALENTO", name: "JAIME REYES" },
        { dept: "RISARALDA", muni: "DOSQUEBRADAS", name: "MARIA GARCIA" },
        { dept: "RISARALDA", muni: "DOSQUEBRADAS", name: "RICARDO ZULUAGA" },
        { dept: "RISARALDA", muni: "LA CELIA", name: "CARLOS SANCHEZ" },
        { dept: "RISARALDA", muni: "LA VIRGINIA", name: "JOSE ARCILA" },
        { dept: "RISARALDA", muni: "PEREIRA", name: "ANYELINE SANDOVAL" },
        { dept: "RISARALDA", muni: "SANTUARIO", name: "FRANCISCO LOPEZ" },
        { dept: "SANTANDER", muni: "BARBOSA", name: "EMYLCE GAMBOA" },
        { dept: "TOLIMA", muni: "CHAPARRAL", name: "JORGE LERMA" },
        { dept: "TOLIMA", muni: "GUAMO", name: "JUAN PEÑA" },
        { dept: "TOLIMA", muni: "IBAGUE", name: "CAMILO TAVERA" },
        { dept: "TOLIMA", muni: "LIBANO", name: "JORGE ORJUELA" },
        { dept: "VALLE", muni: "ANSERMANUEVO", name: "CRISTIAN DUQUE" },
        { dept: "VALLE", muni: "BUENAVENTURA", name: "MARBIN OBREGON" },
        { dept: "VALLE", muni: "CARTAGO", name: "MARIA CORTES" },
        { dept: "VALLE", muni: "JAMUNDI", name: "JOSE CABRERA" },
        { dept: "VALLE", muni: "PALMIRA", name: "GERZAHIN HURTADO" },
        { dept: "VALLE", muni: "RIOFRIO", name: "LUZ BAENA" },
        { dept: "VALLE", muni: "SEVILLA", name: "LUCEIDA SICARONY" },
        { dept: "VALLE", muni: "TULUA", name: "LUZ SEVILLANO" },
        { dept: "VALLE", muni: "DAGUA", name: "OSCAR MARTINEZ" }
    ], []);

    const filteredTargetEntities = useMemo(() => {
        if (panoramaScope === 'nacional' || panoramaScope === 'bogota') {
            return targetEntities.filter(t => t.dept !== "BOGOTA");
        }
        return targetEntities;
    }, [targetEntities, panoramaScope]);

    const departments = useMemo(() => {
        const set = new Set(filteredTargetEntities.map(t => t.dept));
        return Array.from(set).sort();
    }, [filteredTargetEntities]);

    const colors = ['#43a047', '#00b0f0', '#ffc000', '#e91e63', '#9c27b0', '#f44336', '#3f51b5', '#795548'];

    const councillors = useMemo(() => {
        return filteredTargetEntities.map((t, index) => {
            const isUnifiedBogota = t.name === "BOGOTÁ (2)";

            let displayReferidos = 0;
            let displayTemplos = 0;
            let displayMunicipalityName = t.muni;
            let displayDepartmentName = t.dept;

            if (isUnifiedBogota) {
                const bogotaDept = data.departamentos.find(d => normalize(d.name).includes('BOGOTA'));
                displayReferidos = bogotaDept?.referidos || 0;
                displayTemplos = bogotaDept?.templosTarget || 30;
                displayMunicipalityName = "BOGOTÁ D.C.";
                displayDepartmentName = "BOGOTÁ D.C.";
            } else {
                // AGGREGATION LOGIC: Find ALL rows for this municipality
                const muniRows = data.municipios.filter(m =>
                    normalize(m.name) === normalize(t.muni) &&
                    normalize(m.departamento || "") === normalize(t.dept)
                );

                // Fallback for names like VALLE DEL CAUCA / VALLE
                const finalMuniRows = muniRows.length > 0 ? muniRows : data.municipios.filter(m =>
                    normalize(m.name) === normalize(t.muni) &&
                    (normalize(m.departamento || "").includes(normalize(t.dept)) || normalize(t.dept).includes(normalize(m.departamento || "")))
                );

                displayReferidos = finalMuniRows.reduce((acc, curr) => acc + curr.referidos, 0);
                displayTemplos = finalMuniRows.length || 1;

                const representativeMuni = finalMuniRows[0];
                if (representativeMuni) {
                    displayMunicipalityName = representativeMuni.name;
                    displayDepartmentName = representativeMuni.departamento;
                }
            }

            const meta = displayTemplos * 23;
            const mVal = parseInt(milestone);
            const targetMeta = meta * (mVal / 100);
            const progress = targetMeta > 0 ? (displayReferidos / targetMeta) * 100 : 0;

            return {
                name: t.name,
                municipalityName: displayMunicipalityName,
                departmentName: displayDepartmentName,
                meta,
                referidos: displayReferidos,
                progress,
                color: getProgressColor(progress, mVal)
            };
        });
    }, [data.municipios, data.departamentos, milestone, filteredTargetEntities]);

    const filteredCouncillors = useMemo(() => {
        return councillors.filter(c => {
            const matchesSearch =
                normalize(c.municipalityName).includes(normalize(searchQuery));

            const matchesDept = selectedDept === "ALL" || normalize(c.departmentName).includes(normalize(selectedDept));

            const matchesZero = !showZeroOnly || c.referidos === 0;

            return matchesSearch && matchesDept && matchesZero;
        }).sort((a, b) => {
            if (b.progress !== a.progress) return b.progress - a.progress;
            return b.referidos - a.referidos;
        });
    }, [councillors, searchQuery, selectedDept, showZeroOnly]);

    const isNacional = panoramaScope === 'nacional';
    const totalCouncils = isNacional ? 71 : 73;
    const totalMeta = councillors.reduce((acc, curr) => acc + curr.meta, 0);
    const totalReferidos = councillors.reduce((acc, curr) => acc + curr.referidos, 0);
    const totalAvance = totalMeta > 0 ? (totalReferidos / totalMeta) * 100 : 0;
    const zeroCouncils = councillors.filter(c => c.referidos === 0).length;
    const activeCouncils = totalCouncils - zeroCouncils;

    const firstValue = 25;
    const reduction = firstValue > 0 ? ((firstValue - zeroCouncils) / firstValue) * 100 : 0;
    const reductionText = (
        <span className="flex items-baseline justify-center gap-1.5">
            <span className="text-2xl font-black text-emerald-400">{reduction.toFixed(0)}%</span>
            <span>Disminución territorios en cero</span>
        </span>
    );

    return (
        <div className="flex flex-col space-y-8 w-full">
            <div className="grid gap-4 md:grid-cols-4">
                <KPICard title="Objetivo Total" value={totalMeta.toLocaleString('es-CO')} icon={Target} color="blue" />
                <KPICard title="Referidos Cargados" value={totalReferidos.toLocaleString('es-CO')} icon={Users} color="green" />
                <KPICard title="Avance Global (100%)" value={`${totalAvance.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`} icon={Activity} color="amber" />
                <KPICard title="Cobertura" value={totalCouncils.toString()} icon={Landmark} subtext="Concejales" />
            </div>

            <div className="flex flex-col items-center p-4 pt-0 gap-6 relative">
                <div className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4 mb-2">
                    {/* Search Bar - Left Aligned */}
                    <div className="relative w-full md:w-[400px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por Municipio..."
                            className="bg-muted/10 border-muted/50 pl-10 h-10 ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-emerald-500 font-bold"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Selectors - Right Aligned */}
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-10 px-4 font-bold border-muted/50 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all border-blue-500/20"
                            onClick={() => setIsEvolutionOpen(true)}
                        >
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Evolución
                        </Button>

                        <Button
                            variant={showZeroOnly ? "destructive" : "outline"}
                            size="sm"
                            className={cn(
                                "h-10 px-4 font-bold border-muted/50 transition-all",
                                showZeroOnly ? "bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30" : "bg-muted/20 hover:bg-muted/30"
                            )}
                            onClick={() => setShowZeroOnly(!showZeroOnly)}
                        >
                            <Filter className="mr-2 h-4 w-4" />
                            {showZeroOnly ? `Mostrando ${filteredCouncillors.length} en Cero` : "En Cero"}
                        </Button>

                        <Select value={selectedDept} onValueChange={setSelectedDept}>
                            <SelectTrigger className="w-[180px] bg-muted/20 border-muted/50 font-bold">
                                <SelectValue placeholder="Departamentos" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todos los Deptos.</SelectItem>
                                {departments.map(dept => (
                                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={milestone} onValueChange={setMilestone}>
                            <SelectTrigger className="w-[160px] bg-muted/20 border-muted/50 font-bold">
                                <SelectValue placeholder="Seleccionar Avance" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="30">Avance 30%</SelectItem>
                                <SelectItem value="65">Avance 65%</SelectItem>
                                <SelectItem value="100">Avance 100%</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full justify-items-center">
                    {filteredCouncillors.map((councilor, index) => (
                        <CouncilCard
                            key={`${index}-${councilor.municipalityName}`}
                            municipalityName={councilor.municipalityName}
                            departmentName={councilor.departmentName}
                            meta={councilor.meta}
                            referidos={councilor.referidos}
                            customColor={councilor.color}
                            milestone={parseInt(milestone)}
                        />
                    ))}
                    {filteredCouncillors.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-xl font-bold text-muted-foreground">No se encontraron resultados para tu búsqueda.</p>
                        </div>
                    )}
                </div>
            </div>

            <CouncilEvolutionModal
                isOpen={isEvolutionOpen}
                onClose={() => setIsEvolutionOpen(false)}
                activeCouncils={activeCouncils}
                zeroCouncils={zeroCouncils}
                chartSubtitle={reductionText}
            />
        </div>
    );
}
