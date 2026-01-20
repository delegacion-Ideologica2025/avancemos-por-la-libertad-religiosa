"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ScoreRow {
    label: string;
    value: number;
    color?: string;
    isPercentage?: boolean;
    missing?: number;
    target?: number;
}

interface NewScoreCardProps {
    title: string;
    rows: ScoreRow[];
    actionLabel?: string;
    onAction?: () => void;
    actionElement?: React.ReactNode;
    secondaryActionLabel?: string;
    onSecondaryAction?: () => void;
}

function NewScoreCard({ title, rows, actionLabel, onAction, actionElement, secondaryActionLabel, onSecondaryAction }: NewScoreCardProps) {
    return (
        <Card className="bg-muted/10 border-muted/50 overflow-hidden">
            <CardHeader className="relative flex flex-row items-center justify-center pb-2 bg-muted/20 min-h-[50px]">
                {secondaryActionLabel && onSecondaryAction && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onSecondaryAction}
                            className="text-xs font-bold uppercase tracking-widest bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                        >
                            {secondaryActionLabel}
                        </Button>
                    </div>
                )}
                <CardTitle className="text-xl font-black tracking-tighter uppercase italic text-muted-foreground/80 text-center">
                    {title}
                </CardTitle>
                {actionElement ? (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {actionElement}
                    </div>
                ) : actionLabel && onAction && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onAction}
                            className="text-xs font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                        >
                            {actionLabel}
                        </Button>
                    </div>
                )}
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-muted/30">
                    {rows.map((row, idx) => (
                        <div key={idx} className="flex flex-row items-center justify-between p-4 hover:bg-muted/5 transition-colors">
                            <div className="flex flex-col">
                                <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                    {row.label}
                                </span>
                                {(row.target !== undefined) && (
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-tight mt-1">
                                        Objetivo: {row.target.toLocaleString('es-CO')}
                                        {row.missing !== undefined && row.missing > 0 && ` | Faltan: ${row.missing.toLocaleString('es-CO')}`}
                                    </span>
                                )}
                            </div>
                            <div className={cn(
                                "text-lg font-black font-mono px-3 py-1 rounded",
                                row.color || "bg-emerald-500/10 text-emerald-500"
                            )}>
                                {row.isPercentage
                                    ? `${(row.label.includes('30%') || row.label.includes('65%')
                                        ? Math.min(row.value, 100)
                                        : row.value).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
                                    : row.value.toLocaleString('es-CO')}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

interface ScoreboardProps {
    main: {
        name: string;
        score30: number;
        score65: number;
        score100: number;
        missing30?: number;
        missing65?: number;
        missing100?: number;
        target30?: number;
        target65?: number;
        target100?: number;
    };
    zeroStats?: {
        deps: number;
        munis: number;
        metaDeps?: number;
        metaMunis?: number;
    };
    onViewZero?: () => void;
    onViewSenadores?: () => void; // Kept for backward compat if needed, but we'll prefer actionElement
    senadoresActionElement?: React.ReactNode;
    onViewStrategy?: () => void;
    onViewTrend?: () => void;
}

export function Scoreboard({
    main,
    zeroStats,
    onViewZero,
    onViewSenadores,
    senadoresActionElement,
    onViewStrategy,
    onViewTrend
}: ScoreboardProps) {
    return (
        <div className="flex flex-col gap-6">
            <NewScoreCard
                title="PANORAMA NACIONAL"
                actionLabel={!senadoresActionElement ? "Senadores" : undefined}
                onAction={!senadoresActionElement ? onViewSenadores : undefined}
                actionElement={senadoresActionElement}
                secondaryActionLabel="Tendencia"
                onSecondaryAction={onViewTrend}
                rows={[
                    { label: "AVANCE 30%", value: main.score30, color: "bg-amber-500/10 text-amber-500", isPercentage: true, missing: main.missing30, target: main.target30 },
                    { label: "AVANCE 65%", value: main.score65, color: "bg-orange-500/10 text-orange-500", isPercentage: true, missing: main.missing65, target: main.target65 },
                    { label: "AVANCE 100%", value: main.score100, color: "bg-red-500/10 text-red-500", isPercentage: true, missing: main.missing100, target: main.target100 }
                ]}
            />
            {zeroStats && (
                <NewScoreCard
                    title="PANORAMA CERO REFERIDOS"
                    actionLabel="Ver"
                    onAction={onViewZero}
                    secondaryActionLabel="Estrategia"
                    onSecondaryAction={onViewStrategy}
                    rows={[
                        {
                            label: "DEPARTAMENTOS",
                            value: zeroStats.deps,
                            color: zeroStats.deps === 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500",
                            target: zeroStats.metaDeps
                        },
                        {
                            label: "TEMPLOS",
                            value: zeroStats.munis,
                            color: zeroStats.munis === 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500",
                            target: zeroStats.metaMunis
                        }
                    ]}
                />
            )}
        </div>
    );
}
