"use client";

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn, getProgressColor } from "@/lib/utils";
import { User, Target, Users, Activity, Landmark } from 'lucide-react';
import { Departamento, DashboardData, Municipio } from '@/lib/types';
import { getDefaultMilestone, isRedEnabled } from '@/lib/utils-dates';
import { normalize } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface DeputyCardProps {
    departmentName: string;
    meta: number;
    referidos: number;
    className?: string;
    customColor?: string;
    milestone: number;
}

function DeputyCard({ departmentName, meta, referidos, className, customColor: initialColor, milestone }: DeputyCardProps) {
    // Progress based on selected milestone
    const targetMeta = meta * (milestone / 100);
    const progress = targetMeta > 0 ? (referidos / targetMeta) * 100 : 0;

    // Use dynamic color based on progress and milestone
    const progressColor = getProgressColor(progress, milestone);
    const isSpecialCase = milestone === 100 && progress < 30 && !isRedEnabled();

    const borderColor = isSpecialCase ? "border-white/20" : `border-[${progressColor}]/50`;
    const bgColor = isSpecialCase ? "bg-white/5" : `bg-[${progressColor}]/10`;
    const accentBg = isSpecialCase ? "#1e293b" : progressColor; // Dark slate for header in special case
    const accentBgClass = isSpecialCase ? "bg-slate-800" : "";
    const textColor = progressColor;

    return (
        <Card className={cn("overflow-hidden border-2 transition-all hover:scale-105 z-10 hover:z-20 shadow-lg w-[260px]", borderColor, bgColor, className)}>
            <div className="py-1.5 px-3 text-sm font-black text-white uppercase text-center truncate" style={{ backgroundColor: accentBg }}>
                {departmentName}
            </div>
            <CardContent className="p-4 flex flex-col items-center">
                <div className="text-center space-y-1">
                    <p className="text-sm font-bold text-muted-foreground uppercase">
                        Objetivo: {meta.toLocaleString('es-CO')}
                    </p>
                    <p className="text-sm font-bold text-muted-foreground uppercase">
                        Referidos: {referidos.toLocaleString('es-CO')}
                    </p>
                </div>
                <div className="mt-2 text-3xl font-black font-mono" style={{ color: textColor }}>
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

interface DiputadosViewProps {
    data: DashboardData;
    panoramaScope?: 'total' | 'nacional' | 'bogota';
}

// Use imported normalize

export function DiputadosView({ data, panoramaScope }: DiputadosViewProps) {
    const departamentos = data.departamentos;
    const [milestone, setMilestone] = useState<string>(getDefaultMilestone());

    const targetDepartments = [
        "RISARALDA",
        "QUINDIO",
        "CALDAS",
        "TOLIMA",
        "VALLE DEL CAUCA",
        "CHOCO",
        "CAUCA",
        "ANTIOQUIA"
    ];

    const colors = ['#43a047', '#00b0f0', '#ffc000', '#e91e63', '#9c27b0', '#f44336', '#3f51b5', '#795548'];

    const deputies = targetDepartments.map((targetName, index) => {
        const dep = departamentos.find(d => normalize(d.name) === normalize(targetName))
            || departamentos.find(d => normalize(d.name).includes(normalize(targetName)));
        const meta = dep ? dep.meta : 0;
        const referidos = dep ? dep.referidos : 0;
        const templosCount = dep ? dep.templosCount : 0;

        const mVal = parseInt(milestone);
        const targetMeta = meta * (mVal / 100);
        const progress = targetMeta > 0 ? (referidos / targetMeta) * 100 : 0;

        return {
            departmentName: dep ? dep.name : targetName,
            meta,
            referidos,
            progress,
            templosCount,
            color: getProgressColor(progress, mVal)
        };
    });

    const sortedDeputies = [...deputies].sort((a, b) => {
        if (b.progress !== a.progress) return b.progress - a.progress;
        return b.referidos - a.referidos;
    });

    const row1 = sortedDeputies.slice(0, 4);
    const row2 = sortedDeputies.slice(4, 8);

    // THE 202 FIX: Isolated logic to count municipalities for target departments
    const totalTemplos = React.useMemo(() => {
        // Count raw municipalities that match our target departments
        const mList = data.municipios || [];
        const targetsNormalized = targetDepartments.map(t => normalize(t));

        const matchingMunis = mList.filter(m => {
            const mDept = normalize(m.departamento);
            return targetsNormalized.some(tn => mDept === tn || mDept.includes(tn) || tn.includes(mDept));
        });

        let count = matchingMunis.length;

        // Bogotá has no deputy, so Total scope in this view is same as National (202 municipios)
        return count;
    }, [data.municipios, panoramaScope]);

    const totalMeta = totalTemplos * 23;
    const totalReferidos = deputies.reduce((acc, curr) => acc + curr.referidos, 0);
    const totalAvance = totalMeta > 0 ? (totalReferidos / totalMeta) * 100 : 0;

    return (
        <div className="flex flex-col space-y-8 w-full">
            <div className="grid gap-4 md:grid-cols-4">
                <KPICard title="Objetivo Total" value={totalMeta.toLocaleString('es-CO')} icon={Target} color="blue" />
                <KPICard title="Referidos Cargados" value={totalReferidos.toLocaleString('es-CO')} icon={Users} color="green" />
                <KPICard title="Avance Global (100%)" value={`${totalAvance.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`} icon={Activity} color="amber" />
                <KPICard title="Cobertura" value={totalTemplos.toLocaleString('es-CO')} icon={Landmark} subtext="Templos" />
            </div>

            <div className="flex flex-col items-center p-4 pt-0 gap-8 relative">
                <div className="w-full max-w-7xl flex justify-end mb-2">
                    <Select value={milestone} onValueChange={setMilestone}>
                        <SelectTrigger className="w-[180px] bg-muted/20 border-muted/50 font-bold">
                            <SelectValue placeholder="Seleccionar Avance" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="30">Avance 30%</SelectItem>
                            <SelectItem value="65">Avance 65%</SelectItem>
                            <SelectItem value="100">Avance 100%</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 z-10 w-full max-w-7xl justify-items-center">
                    {row1.map((diputado, index) => (
                        <DeputyCard key={index} departmentName={diputado.departmentName} meta={diputado.meta} referidos={diputado.referidos} customColor={diputado.color} milestone={parseInt(milestone)} />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 z-10 w-full max-w-7xl justify-items-center">
                    {row2.map((diputado, index) => (
                        <DeputyCard key={index + 4} departmentName={diputado.departmentName} meta={diputado.meta} referidos={diputado.referidos} customColor={diputado.color} milestone={parseInt(milestone)} />
                    ))}
                </div>
            </div>
        </div>
    );
}
