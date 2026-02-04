"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Target, Users, Landmark, Activity, TrendingUp } from "lucide-react";

interface KPICardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    subtext?: string;
    trend?: number;
    color?: "default" | "blue" | "green" | "amber";
    action?: React.ReactNode;
    secondaryIcon?: React.ReactNode;
}

function KPICard({ title, value, icon: Icon, subtext, color = "default", action, secondaryIcon }: KPICardProps) {
    const colorStyles = {
        default: "text-foreground",
        blue: "text-blue-400",
        green: "text-emerald-400",
        amber: "text-amber-400"
    };

    return (
        <Card className="bg-muted/10 border-muted/50 shadow-sm backdrop-blur-sm h-full flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col justify-center">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col justify-center">
                        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                        <h3 className={cn("text-4xl font-bold tracking-tight", colorStyles[color])}>{value}</h3>
                        {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                        {secondaryIcon && (
                            <div className="flex-shrink-0">
                                {secondaryIcon}
                            </div>
                        )}
                        <div className={cn("p-3 rounded-full bg-muted/20 flex-shrink-0", colorStyles[color])}>
                            <Icon className="w-6 h-6" />
                        </div>
                    </div>
                </div>
                {action && <div className="mt-4 pt-4 border-t border-muted/20">{action}</div>}
            </CardContent>
        </Card>
    );
}

export function KPIGrid({ stats, isZeroView, onViewEvolucion, onViewReferidosEvolution, onViewTemplosEvolution, panoramaScope }: { stats: any, isZeroView?: boolean, onViewEvolucion?: () => void, onViewReferidosEvolution?: () => void, onViewTemplosEvolution?: () => void, panoramaScope?: 'total' | 'nacional' | 'bogota' }) {
    if (!stats) return null;

    const isBogota = panoramaScope === 'bogota';

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
                secondaryIcon={!isZeroView && onViewReferidosEvolution ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewReferidosEvolution();
                        }}
                        className="p-2 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors shadow-sm"
                        title="Ver evolución de referidos"
                    >
                        <TrendingUp className="w-5 h-5" />
                    </button>
                ) : undefined}
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

                    // 1. Try Target count (Meta 471)
                    if (stats.templosTarget && stats.templosTarget > 0) return stats.templosTarget.toLocaleString('es-CO');

                    // 2. Try explicit count
                    if (stats.templosCount && stats.templosCount > 0) return stats.templosCount.toLocaleString('es-CO');

                    // 3. Try counting children
                    if (stats.children && stats.children.length > 0) return stats.children.length.toLocaleString('es-CO');

                    // 4. Final fallback
                    return "0";
                })()}
                icon={Landmark}
                subtext={isZeroView ? (isBogota ? "Localidades" : "Municipios") : "Templos"}
                secondaryIcon={!isZeroView && onViewTemplosEvolution ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewTemplosEvolution();
                        }}
                        className="p-2 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors shadow-sm"
                        title="Ver evolución de templos"
                    >
                        <TrendingUp className="w-5 h-5" />
                    </button>
                ) : undefined}
                action={isZeroView && (
                    <button
                        onClick={onViewEvolucion}
                        className="w-full py-2 px-4 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest transition-colors border border-blue-500/20"
                    >
                        Evolución
                    </button>
                )}
            />
        </div>
    )
}
