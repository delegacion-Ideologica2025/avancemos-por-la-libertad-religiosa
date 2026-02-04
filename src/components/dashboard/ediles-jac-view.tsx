"use client";

import React, { useMemo, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn, getProgressColor, normalize } from "@/lib/utils";
import { Target, Users, Activity, Landmark, Search } from 'lucide-react';
import { DashboardData } from '@/lib/types';
import { getDefaultMilestone, isRedEnabled } from '@/lib/utils-dates';
import { JAC_LIST, JAC_TOTAL_COUNT } from '@/lib/jac-constants';
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface JacCardProps {
    municipalityName: string;
    departmentName: string;
    meta: number;
    referidos: number;
    className?: string;
    milestone: number;
}

function JacCard({ municipalityName, departmentName, meta, referidos, className, milestone }: JacCardProps) {
    const targetMeta = meta * (milestone / 100);
    const progress = targetMeta > 0 ? (referidos / targetMeta) * 100 : 0;

    const progressColor = getProgressColor(progress, milestone);

    // The user rule: cards below 30% are red ONLY in 30 and 65 milestones.
    // In 100 milestone, they stay neutral/gray if progress < 30.
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
                        Objetivo: {Math.round(meta).toLocaleString('es-CO')} | REF: {referidos.toLocaleString('es-CO')}
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

export function EdilesJacView({ data }: { data: DashboardData }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [milestone, setMilestone] = useState<string>(getDefaultMilestone());
    const INDIVIDUAL_JAC = JAC_LIST;

    const jacCardsData = useMemo(() => {
        // Group by Municipality
        const muniGroups = new Map<string, { muni: string, dept: string }>();
        INDIVIDUAL_JAC.forEach(j => {
            const key = `${normalize(j.muni)}-${normalize(j.dept)}`;
            if (!muniGroups.has(key)) {
                muniGroups.set(key, j);
            }
        });

        return Array.from(muniGroups.values()).map((t) => {
            // Find all records for this municipality in DB
            const muniRows = data.municipios.filter(m =>
                normalize(m.name) === normalize(t.muni) &&
                normalize(m.departamento || "") === normalize(t.dept)
            );

            const finalMuniRows = muniRows.length > 0 ? muniRows : data.municipios.filter(m =>
                normalize(m.name) === normalize(t.muni) &&
                (normalize(m.departamento || "").includes(normalize(t.dept)) || normalize(t.dept).includes(normalize(m.departamento || "")))
            );

            // Total Meta = Number of Temples * 23
            const totalTemples = finalMuniRows.length;
            const muniMeta = totalTemples * 23;
            const muniReferidos = finalMuniRows.reduce((acc, curr) => acc + curr.referidos, 0);

            const displayName = finalMuniRows[0]?.name || t.muni;

            return {
                municipalityName: displayName,
                departmentName: t.dept,
                meta: muniMeta,
                referidos: muniReferidos
            };
        });
    }, [data, INDIVIDUAL_JAC]);

    const filteredJacCards = useMemo(() => {
        const mVal = parseInt(milestone);
        return jacCardsData.map(c => {
            const targetMeta = c.meta * (mVal / 100);
            const progress = targetMeta > 0 ? (c.referidos / targetMeta) * 100 : 0;
            return {
                ...c,
                progress,
                color: getProgressColor(progress, mVal)
            };
        }).filter(c =>
            normalize(c.municipalityName).includes(normalize(searchQuery)) ||
            normalize(c.departmentName).includes(normalize(searchQuery))
        ).sort((a, b) => {
            if (b.progress !== a.progress) return b.progress - a.progress;
            return b.referidos - a.referidos;
        });
    }, [jacCardsData, searchQuery, milestone]);

    // For KPIs, we still use the total records and referidos from ALL municipalities
    const totalMeta = jacCardsData.reduce((acc, curr) => acc + curr.meta, 0);
    const totalReferidos = jacCardsData.reduce((acc, curr) => acc + curr.referidos, 0);
    const totalAvance = totalMeta > 0 ? (totalReferidos / totalMeta) * 100 : 0;

    return (
        <div className="flex flex-col space-y-8 w-full">

            {/* 1. KPI Section (TOP) */}
            <div className="grid gap-4 md:grid-cols-4">
                <KPICard title="Objetivo Total" value={totalMeta.toLocaleString('es-CO')} icon={Target} color="blue" />
                <KPICard title="Referidos Cargados" value={totalReferidos.toLocaleString('es-CO')} icon={Users} color="green" />
                <KPICard title="Avance Global (100%)" value={`${totalAvance.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`} icon={Activity} color="amber" />
                <KPICard title="Cobertura" value={JAC_TOTAL_COUNT.toString()} icon={Landmark} subtext="Ediles JAL" />
            </div>

            {/* 2. Controls Section */}
            <div className="flex flex-col md:flex-row justify-start items-center gap-4 px-4 max-w-7xl mx-auto w-full">
                <div className="relative w-full md:w-[400px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por Municipio (JAL)..."
                        className="bg-muted/10 border-muted/50 pl-10 h-10 font-bold focus-visible:ring-emerald-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={milestone} onValueChange={setMilestone}>
                    <SelectTrigger className="w-[180px] bg-muted/20 border-muted/50 font-bold h-10">
                        <SelectValue placeholder="Seleccionar Avance" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="30">Avance 30%</SelectItem>
                        <SelectItem value="65">Avance 65%</SelectItem>
                        <SelectItem value="100">Avance 100%</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* 3. Cards Section */}
            <div className="p-4 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full justify-items-center">
                    {filteredJacCards.map((jac, index) => (
                        <JacCard
                            key={`${index}-${jac.municipalityName}`}
                            municipalityName={jac.municipalityName}
                            departmentName={jac.departmentName}
                            meta={jac.meta}
                            referidos={jac.referidos}
                            milestone={parseInt(milestone)}
                        />
                    ))}
                    {filteredJacCards.length === 0 && (
                        <div className="col-span-full py-20 text-center w-full">
                            <p className="text-xl font-bold text-muted-foreground">No se encontraron resultados.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
