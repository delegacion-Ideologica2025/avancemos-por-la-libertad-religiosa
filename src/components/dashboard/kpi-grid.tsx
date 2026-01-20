"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Target, Users, Landmark, Activity } from "lucide-react";

interface KPICardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    subtext?: string;
    trend?: number;
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

export function KPIGrid({ stats, isZeroView }: { stats: any, isZeroView?: boolean }) {
    if (!stats) return null;

    return (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
            <KPICard
                title="Objetivo Total"
                value={stats.meta.toLocaleString('es-CO')}
                icon={Target}
                color="blue"
            />
            <KPICard
                title="Referidos Cargados"
                value={stats.referidos.toLocaleString('es-CO')}
                icon={Users}
                subtext={isZeroView && stats.totalNationalMeta
                    ? `${((stats.meta / stats.totalNationalMeta) * 100).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% del total`
                    : `${((stats.referidos / stats.meta) * 100).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% del total`
                }
                color="green"
            />
            <KPICard
                title="Avance Ponderado"
                value={`${stats.avance100.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`}
                icon={Activity}
                subtext="Objetivo al 100%"
                color="amber"
            />
            <KPICard
                title="Cobertura"
                value={(() => {
                    if (isZeroView) return stats.zeroMuniCount?.toLocaleString('es-CO') || "0";

                    // 1. Hardcore National fallback
                    if (stats.name === 'Nacional') return (485).toLocaleString('es-CO');

                    // 2. Try explicit count
                    if (stats.templosCount && stats.templosCount > 0) return stats.templosCount.toLocaleString('es-CO');

                    // 3. Try counting children (Municipios in Dept, or Templos in Muni)
                    if (stats.children && stats.children.length > 0) return stats.children.length.toLocaleString('es-CO');

                    // 4. Final fallback
                    return stats.templosCount !== undefined ? stats.templosCount.toLocaleString('es-CO') : "0";
                })()}
                icon={Landmark}
                subtext={isZeroView ? "Municipios" : "Templos"}
            />
        </div>
    )
}
