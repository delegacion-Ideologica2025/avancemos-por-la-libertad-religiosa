"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, LabelList } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getDefaultMilestone } from "@/lib/utils-dates";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function RankingChart({ data, title = "Ranking por Avance" }: { data: any[], title?: string }) {
    const [onlyTop10, setOnlyTop10] = useState(true);
    const defaultMilestone = getDefaultMilestone();
    const [metric, setMetric] = useState<"avance30" | "avance65" | "avance100">(`avance${defaultMilestone}` as any);

    // Sort data: Always Best to Worst (Descending) based on selected metric
    // Tie-break with real referidos count
    const sorted = [...data].sort((a, b) => {
        if (b[metric] !== a[metric]) {
            return b[metric] - a[metric];
        }
        return b.referidos - a.referidos;
    });

    // If onlyTop10 is true, show first 10. Else show all.
    const chartData = onlyTop10 ? sorted.slice(0, 10) : sorted;

    const metricLabels = {
        avance30: "Avance 30%",
        avance65: "Avance 65%",
        avance100: "Avance 100%"
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const d = payload[0].payload;
            return (
                <div className="bg-popover border border-border p-3 rounded shadow-xl text-popover-foreground">
                    <p className="font-bold mb-1">{d.name}</p>
                    <p className="text-sm">{metricLabels[metric]}: <span className="font-mono">{(metric === 'avance100' ? d[metric] : Math.min(d[metric], 100)).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</span></p>
                    <p className="text-xs text-muted-foreground">Objetivo: {d.meta.toLocaleString('es-CO')}</p>
                    <p className="text-xs text-muted-foreground">Ref: {d.referidos.toLocaleString('es-CO')}</p>
                </div>
            );
        }
        return null;
    };

    const CustomYAxisTick = (props: any) => {
        const { x, y, payload, index } = props;
        const entry = chartData[index];
        if (!entry) return null;

        const temploName = entry.temploName || '';
        const muniName = payload.value.toUpperCase();
        const fullTemploNorm = temploName.toUpperCase();

        // Only show if different from municipality name
        const shouldShowTemplo = fullTemploNorm && fullTemploNorm !== muniName;

        return (
            <g transform={`translate(${x},${y})`}>
                <text
                    x={-5}
                    y={shouldShowTemplo ? -2 : 3}
                    dy={0}
                    textAnchor="end"
                    fill="#9ca3af"
                    style={{ fontSize: '10px', fontWeight: 'bold' }}
                >
                    {payload.value}
                </text>
                {shouldShowTemplo && (
                    <text
                        x={-5}
                        y={8}
                        dy={0}
                        textAnchor="end"
                        fill="#6b7280"
                        style={{ fontSize: '8px' }}
                    >
                        ({temploName})
                    </text>
                )}
            </g>
        );
    };

    // Calculate dynamic height based on data points when not in Top 10 mode
    const chartHeight = onlyTop10 ? 400 : Math.max(400, chartData.length * 35);

    return (
        <Card className="col-span-1">
            <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle>{title}</CardTitle>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <Select value={metric} onValueChange={(v: any) => setMetric(v)}>
                            <SelectTrigger className="w-[140px] h-8 text-xs">
                                <SelectValue placeholder="Métrica" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="avance30">Avance 30%</SelectItem>
                                <SelectItem value="avance65">Avance 65%</SelectItem>
                                <SelectItem value="avance100">Avance 100%</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex items-center space-x-2 border-l pl-4 border-muted/20">
                            <Label htmlFor="top-mode" className="text-sm font-medium whitespace-nowrap">
                                Top 10
                            </Label>
                            <Switch
                                id="top-mode"
                                checked={onlyTop10}
                                onCheckedChange={setOnlyTop10}
                            />
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div
                    className="w-full transition-all duration-300 overflow-visible"
                    style={{ height: `${chartHeight}px` }}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={chartData}
                            margin={{ top: 5, right: 130, left: 10, bottom: 5 }}
                        >
                            <XAxis type="number" domain={[0, 100]} hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={130}
                                tick={<CustomYAxisTick />}
                                interval={0}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                            />
                            <Bar dataKey={metric} radius={[0, 4, 4, 0]} barSize={20}>
                                <LabelList
                                    dataKey={metric}
                                    position="right"
                                    formatter={(v: any) => `${(metric === 'avance100' ? Number(v) : Math.min(Number(v), 100)).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`}
                                    style={{ fontSize: '12px', fill: '#cbd5e1', fontWeight: 'bold' }}
                                />
                                {
                                    chartData.map((entry, index) => {
                                        const val = entry[metric];
                                        let fillColor = "#ef4444"; // default red < 30
                                        if (val >= 100) fillColor = "#10b981"; // green >= 100
                                        else if (val >= 65) fillColor = "#facc15"; // yellow 65-99
                                        else if (val >= 30) fillColor = "#f97316"; // orange 30-64

                                        return (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={fillColor}
                                            />
                                        );
                                    })
                                }
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
