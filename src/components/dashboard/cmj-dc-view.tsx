"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn, getProgressColor, normalize } from "@/lib/utils";
import { Target, Users, Activity, Landmark, Search, Filter, TrendingUp } from 'lucide-react';
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
import { LOCALIDAD_TO_LOCALIDAD_MAYOR } from '@/lib/constants';
import { CMJ_DC_LIST, CMJ_OFFICIAL_CENTERS, CMJ_MAPPING_OVERRIDES, CMJ_TOTAL_COUNT } from '@/lib/cmj-constants';

interface CmjCardProps {
    localidadName: string;
    meta: number;
    referidos: number;
    className?: string;
    milestone: number;
}

function CmjCard({ localidadName, meta, referidos, className, milestone }: CmjCardProps) {
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

export function CmjDcView({ data }: { data: DashboardData }) {
    const [milestone, setMilestone] = useState<string>(getDefaultMilestone());
    const [searchQuery, setSearchQuery] = useState("");
    const [showZeroOnly, setShowZeroOnly] = useState(false);

    const cmjData = useMemo(() => {
        if (!data.templos || data.templos.length === 0) return [];

        // Use the CUSTOM CMJ list
        return CMJ_DC_LIST.filter(name => !['TEUSAQUILLO', 'USME'].includes(name)).map((cmjLocalityName) => {
            const normalizedTargetName = normalize(cmjLocalityName);
            // Get multiplier from custom CMJ centers or default to 1
            const multiplier = CMJ_OFFICIAL_CENTERS[cmjLocalityName] || 1;

            // Find rows in excel data that belong to this CMJ Locality
            const matches = data.templos.filter(templo => {
                const normalizedExcelLocality = normalize(templo.localidad || '');

                // 1. Check CUSTOM MAPPING overrides first (Highest priority)
                // e.g. 'SANTANDER' -> 'ANTONIO NARIÑO'
                // We check if the excel locality matches a key in overrides, and if its value is our current target
                const overrideTarget = Object.entries(CMJ_MAPPING_OVERRIDES).find(([key, _]) =>
                    normalize(key) === normalizedExcelLocality
                )?.[1];

                if (overrideTarget) {
                    return normalize(overrideTarget) === normalizedTargetName;
                }

                // 2. Fallback to standard Ediles/Mayor mapping if not overridden
                // Check if the excel locality maps to a 'Mayor' locality that matches our target
                // ONLY if the target is actually one of the standard major localities keys (to avoid false positives with new ones)
                // But generally LOCALIDAD_TO_LOCALIDAD_MAYOR covers the standard Bosa, Kennedy etc.
                const standardMayor = Object.entries(LOCALIDAD_TO_LOCALIDAD_MAYOR).find(([key, _]) =>
                    normalize(key) === normalizedExcelLocality
                )?.[1];

                if (standardMayor && normalize(standardMayor) === normalizedTargetName) {
                    return true;
                }

                // 3. Direct match
                if (normalizedExcelLocality === normalizedTargetName) return true;

                // 4. Also check temple.localidadMayor if present in excel
                if (templo.localidadMayor && normalize(templo.localidadMayor) === normalizedTargetName) return true;

                return false;
            });

            const meta = multiplier * 23;
            const referidos = matches.reduce((sum, t) => sum + (t.referidos || 0), 0);

            const mVal = parseInt(milestone);
            const targetMeta = meta * (mVal / 100);
            const progress = targetMeta > 0 ? (referidos / targetMeta) * 100 : 0;

            const displayName = multiplier > 1 ? `${cmjLocalityName} (${multiplier})` : cmjLocalityName;

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

    const filteredCmj = useMemo(() => {
        return cmjData.filter(c => {
            const matchesSearch = normalize(c.localidadName).includes(normalize(searchQuery));
            const matchesZero = !showZeroOnly || c.referidos === 0;
            return matchesSearch && matchesZero;
        }).sort((a, b) => {
            if (b.progress !== a.progress) return b.progress - a.progress;
            return b.referidos - a.referidos;
        });
    }, [cmjData, searchQuery, showZeroOnly]);

    const totalMeta = cmjData.reduce((acc, curr) => acc + curr.meta, 0);
    const totalReferidos = cmjData.reduce((acc, curr) => acc + curr.referidos, 0);
    const totalAvance = totalMeta > 0 ? (totalReferidos / totalMeta) * 100 : 0;

    // Cobertura is sum of official multipliers
    const totalTemples = cmjData.reduce((acc, curr) => acc + (curr.templesCount || 0), 0);

    return (
        <div className="flex flex-col space-y-8 w-full">
            <div className="grid gap-4 md:grid-cols-4">
                <KPICard title="Objetivo Total" value={totalMeta.toLocaleString('es-CO')} icon={Target} color="blue" />
                <KPICard title="Referidos Cargados" value={totalReferidos.toLocaleString('es-CO')} icon={Users} color="green" />
                <KPICard title="Avance Global (100%)" value={`${totalAvance.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`} icon={Activity} color="amber" />
                <KPICard title="Cobertura" value={totalTemples.toString()} icon={Landmark} subtext="Templos CMJ" />
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
                            variant={showZeroOnly ? "destructive" : "outline"}
                            size="sm"
                            className={cn(
                                "h-10 px-4 font-bold border-muted/50 transition-all",
                                showZeroOnly ? "bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30" : "bg-muted/20 hover:bg-muted/30"
                            )}
                            onClick={() => setShowZeroOnly(!showZeroOnly)}
                        >
                            <Filter className="mr-2 h-4 w-4" />
                            {showZeroOnly ? `Mostrando ${filteredCmj.length} en Cero` : "En Cero"}
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
                    {filteredCmj.map((cmj, index) => (
                        <CmjCard
                            key={`${index}-${cmj.localidadName}`}
                            localidadName={cmj.localidadName}
                            meta={cmj.meta}
                            referidos={cmj.referidos}
                            milestone={parseInt(milestone)}
                        />
                    ))}
                    {filteredCmj.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-xl font-bold text-muted-foreground">No se encontraron resultados.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
