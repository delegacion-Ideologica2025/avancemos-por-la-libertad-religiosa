"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn, getProgressColor } from "@/lib/utils";
import { Target, Users, Activity, Landmark, Search, Filter, TrendingUp } from 'lucide-react';
import { GenericEvolutionModal } from './generic-evolution-modal';
import { DashboardData } from '@/lib/types';
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
import { ENLACES_LIST } from '@/lib/constants';

interface EnlaceCardProps {
    municipalityName: string;
    departmentName: string;
    meta: number;
    referidos: number;
    className?: string;
    milestone: number;
}

function EnlaceCard({ municipalityName, departmentName, meta, referidos, className, milestone }: EnlaceCardProps) {
    const targetMeta = meta * (milestone / 100);
    const progress = targetMeta > 0 ? (referidos / targetMeta) * 100 : 0;

    const progressColor = getProgressColor(progress, milestone);
    const isSpecialCase = milestone === 100 && progress < 30 && !isRedEnabled();

    const borderColor = isSpecialCase ? "border-white/20" : `border-[${progressColor}]/50`;
    const bgColor = isSpecialCase ? "bg-white/5" : `bg-[${progressColor}]/10`;
    const accentBg = isSpecialCase ? "#1e293b" : progressColor;
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

function KPICard({ title, value, icon: Icon, subtext, color = "default" }: { title: string, value: string, icon: any, subtext?: string, color?: string }) {
    const colorStyles: any = {
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

export function EnlacesView({ data }: { data: DashboardData }) {
    const [milestone, setMilestone] = useState<string>(getDefaultMilestone());
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDept, setSelectedDept] = useState<string>("ALL");
    const [showZeroOnly, setShowZeroOnly] = useState(false);
    const [isEvolutionOpen, setIsEvolutionOpen] = useState(false);

    const departments = useMemo(() => {
        const set = new Set(ENLACES_LIST.map(t => t.dept));
        return Array.from(set).sort();
    }, []);

    const enlacesData = useMemo(() => {
        return ENLACES_LIST.map((t) => {
            const isGobernacion = normalize(t.muni) === "GOBERNACION";

            let displayReferidos = 0;
            let displayTemplos = 0;
            let displayName = t.muni;

            if (isGobernacion) {
                // Find department level data
                const match = data.departamentos.find(d => normalize(d.name) === normalize(t.dept));
                displayReferidos = match?.referidos || 0;
                displayTemplos = match?.templosTarget || 0;
                displayName = `GOBERNACION ${t.dept}`;
            } else {
                // AGGREGATION LOGIC: Find ALL rows for this municipality
                const muniRows = data.municipios.filter(m =>
                    normalize(m.name) === normalize(t.muni) &&
                    normalize(m.departamento || "") === normalize(t.dept)
                );

                const finalMuniRows = muniRows.length > 0 ? muniRows : data.municipios.filter(m =>
                    normalize(m.name) === normalize(t.muni) &&
                    (normalize(m.departamento || "").includes(normalize(t.dept)) || normalize(t.dept).includes(normalize(m.departamento || "")))
                );

                displayReferidos = finalMuniRows.reduce((acc, curr) => acc + curr.referidos, 0);
                displayTemplos = finalMuniRows.length || 1;
                displayName = finalMuniRows[0]?.name || t.muni;
            }

            const meta = (displayTemplos || 1) * 23;
            const mVal = parseInt(milestone);
            const targetMeta = meta * (mVal / 100);
            const progress = targetMeta > 0 ? (displayReferidos / targetMeta) * 100 : 0;

            return {
                municipalityName: displayName,
                departmentName: t.dept,
                meta,
                referidos: displayReferidos,
                progress,
                color: getProgressColor(progress, mVal)
            };
        });
    }, [data, milestone]);

    const filteredEnlaces = useMemo(() => {
        return enlacesData.filter(c => {
            const matchesSearch = normalize(c.municipalityName).includes(normalize(searchQuery));
            const matchesDept = selectedDept === "ALL" || normalize(c.departmentName).includes(normalize(selectedDept));
            const matchesZero = !showZeroOnly || c.referidos === 0;
            return matchesSearch && matchesDept && matchesZero;
        }).sort((a, b) => {
            if (b.progress !== a.progress) return b.progress - a.progress;
            return b.referidos - a.referidos;
        });
    }, [enlacesData, searchQuery, selectedDept, showZeroOnly]);

    const totalMeta = enlacesData.reduce((acc, curr) => acc + curr.meta, 0);
    const totalReferidos = enlacesData.reduce((acc, curr) => acc + curr.referidos, 0);
    const totalAvance = totalMeta > 0 ? (totalReferidos / totalMeta) * 100 : 0;
    const zeroCount = enlacesData.filter(e => e.referidos === 0).length;
    const activeCount = enlacesData.length - zeroCount;

    const firstValue = 50;
    const reduction = firstValue > 0 ? ((firstValue - zeroCount) / firstValue) * 100 : 0;
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
                <KPICard title="Cobertura" value={ENLACES_LIST.length.toString()} icon={Landmark} subtext="Enlaces" />
            </div>

            <div className="flex flex-col items-center p-4 pt-0 gap-6 relative">
                <div className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4 mb-2">
                    <div className="relative w-full md:w-[400px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por Enlace/Municipio..."
                            className="bg-muted/10 border-muted/50 pl-10 h-10 font-bold focus-visible:ring-emerald-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

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
                            {showZeroOnly ? `Mostrando ${filteredEnlaces.length} en Cero` : "En Cero"}
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
                    {filteredEnlaces.map((enlace, index) => (
                        <EnlaceCard
                            key={`${index}-${enlace.municipalityName}`}
                            municipalityName={enlace.municipalityName}
                            departmentName={enlace.departmentName}
                            meta={enlace.meta}
                            referidos={enlace.referidos}
                            milestone={parseInt(milestone)}
                        />
                    ))}
                    {filteredEnlaces.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-xl font-bold text-muted-foreground">No se encontraron resultados.</p>
                        </div>
                    )}
                </div>
            </div>

            <GenericEvolutionModal
                isOpen={isEvolutionOpen}
                onClose={() => setIsEvolutionOpen(false)}
                title="Territorios activados"
                activeLabel="Municipios con Enlaces activos"
                activeCount={activeCount}
                timeline={[
                    { date: '29-dic', value: 50 },
                    { date: '13-ene', value: 42 },
                    { date: '16-ene', value: 39 },
                    { date: 'Hoy', value: zeroCount }
                ]}
                maxChartValue={60}
                chartSubtitle={reductionText}
            />
        </div>
    );
}
