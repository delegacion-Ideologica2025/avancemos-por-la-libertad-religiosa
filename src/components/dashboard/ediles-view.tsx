"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn, getProgressColor, normalize } from "@/lib/utils";
import { Target, Users, Activity, Landmark, Search, Filter, TrendingUp } from 'lucide-react';
import { GenericEvolutionModal } from './generic-evolution-modal';
import { DashboardData, Templo } from '@/lib/types';
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
import { EDILES_DC_LIST, LOCALIDAD_TO_LOCALIDAD_MAYOR, EDIL_OFFICIAL_CENTERS } from '@/lib/constants';

interface EdilCardProps {
    localidadName: string;
    meta: number;
    referidos: number;
    className?: string;
    milestone: number;
}

function EdilCard({ localidadName, meta, referidos, className, milestone }: EdilCardProps) {
    const targetMeta = meta * (milestone / 100);
    const progress = targetMeta > 0 ? (referidos / targetMeta) * 100 : 0;

    const progressColor = getProgressColor(progress, milestone);
    const isSpecialCase = milestone === 100;
    const accentBg = isSpecialCase ? "#1e293b" : progressColor;
    const textColor = progressColor;

    return (
        <Card
            className={cn("overflow-hidden border-2 transition-all hover:scale-105 z-10 hover:z-20 shadow-lg w-full max-w-[280px]")}
            style={{
                borderColor: isSpecialCase ? "rgba(255,255,255,0.2)" : `${progressColor}80`, // 50% opacity
                backgroundColor: isSpecialCase ? "rgba(255,255,255,0.05)" : `${progressColor}1a` // 10% opacity
            }}
        >
            <div className="py-2 px-3 text-sm font-black text-white uppercase text-center truncate" style={{ backgroundColor: accentBg }}>
                {localidadName}
            </div>
            <CardContent className="p-3 flex flex-col items-center">
                <div className="text-center space-y-0.5 mb-1">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase">
                        BOGOTÁ D.C.
                    </p>
                    <p className="text-xs font-bold text-muted-foreground uppercase">
                        Objetivo: {meta.toLocaleString('es-CO')} | REF: {referidos.toLocaleString('es-CO')}
                    </p>
                    <p className="text-xs font-bold text-muted-foreground uppercase">
                        Faltante: {Math.ceil(Math.max(0, targetMeta - referidos)).toLocaleString('es-CO')}
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

export function EdilesView({ data }: { data: DashboardData }) {
    const [milestone, setMilestone] = useState<string>(getDefaultMilestone());
    const [searchQuery, setSearchQuery] = useState("");
    const [showZeroOnly, setShowZeroOnly] = useState(false);
    const [isEvolutionOpen, setIsEvolutionOpen] = useState(false);

    const edilesData = useMemo(() => {
        if (!data.templos || data.templos.length === 0) return [];

        // Map Localidades Mayores and aggregate their temples from data.templos
        return EDILES_DC_LIST.map((localidadMayor) => {
            const normalizedLocalidadMayorTarget = normalize(localidadMayor);
            const multiplier = EDIL_OFFICIAL_CENTERS[localidadMayor] || 1;

            // 1. Find all temples that belong to this Localidad Mayor
            const templesInLocalidadMayor = data.templos.filter(temple => {
                // A. Explicit match if the Excel already has the Mayor column
                if (temple.localidadMayor && normalize(temple.localidadMayor) === normalizedLocalidadMayorTarget) {
                    return true;
                }
                // B. Mapping match (Excel locality name -> Edil)
                const normalizedLocalidadFromExcel = normalize(temple.localidad || '');
                return Object.entries(LOCALIDAD_TO_LOCALIDAD_MAYOR)
                    .some(([localidadExcel, mayor]) =>
                        normalize(mayor) === normalizedLocalidadMayorTarget &&
                        normalize(localidadExcel) === normalizedLocalidadFromExcel
                    );
            });

            const meta = multiplier * 23;
            const referidos = templesInLocalidadMayor.reduce((sum, temple) => sum + (temple.referidos || 0), 0);

            const mVal = parseInt(milestone);
            const targetMeta = meta * (mVal / 100);
            const progress = targetMeta > 0 ? (referidos / targetMeta) * 100 : 0;

            const displayName = multiplier > 1 ? `${localidadMayor} (${multiplier})` : localidadMayor;

            return {
                localidadName: displayName,
                meta,
                referidos,
                progress,
                color: getProgressColor(progress, mVal),
                templesCount: multiplier
            };
        });
    }, [data, milestone]);

    const filteredEdiles = useMemo(() => {
        return edilesData.filter(c => {
            const matchesSearch = normalize(c.localidadName).includes(normalize(searchQuery));
            const matchesZero = !showZeroOnly || c.referidos === 0;
            return matchesSearch && matchesZero;
        }).sort((a, b) => {
            if (b.progress !== a.progress) return b.progress - a.progress;
            return b.referidos - a.referidos;
        });
    }, [edilesData, searchQuery, showZeroOnly]);

    const totalMeta = edilesData.reduce((acc, curr) => acc + curr.meta, 0);
    const totalReferidos = edilesData.reduce((acc, curr) => acc + curr.referidos, 0);
    const totalAvance = totalMeta > 0 ? (totalReferidos / totalMeta) * 100 : 0;
    const totalTemples = edilesData.reduce((acc, curr) => acc + (curr.templesCount || 0), 0);
    const zeroCount = edilesData.filter(e => e.referidos === 0).length;
    const activeCount = edilesData.length - zeroCount;

    const firstValue = 8;
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
                <KPICard title="Cobertura" value={totalTemples.toString()} icon={Landmark} subtext="Templos" />
            </div>

            <div className="flex flex-col items-center p-4 pt-0 gap-6 relative">
                <div className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4 mb-2">
                    <div className="relative w-full md:w-[400px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por Localidad..."
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
                            {showZeroOnly ? `Mostrando ${filteredEdiles.length} en Cero` : "En Cero"}
                        </Button>

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
                    {filteredEdiles.map((edil, index) => (
                        <EdilCard
                            key={`${index}-${edil.localidadName}`}
                            localidadName={edil.localidadName}
                            meta={edil.meta}
                            referidos={edil.referidos}
                            milestone={parseInt(milestone)}
                        />
                    ))}
                    {filteredEdiles.length === 0 && (
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
                activeLabel="Localidades con Ediles activos"
                activeCount={activeCount}
                timeline={[
                    { date: '29-dic', value: 8 },
                    { date: '13-ene', value: 6 },
                    { date: '16-ene', value: 5 },
                    { date: 'Hoy', value: zeroCount }
                ]}
                maxChartValue={10}
                chartSubtitle={reductionText}
            />
        </div>
    );
}
