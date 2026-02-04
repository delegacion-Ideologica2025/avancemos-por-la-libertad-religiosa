"use client";

import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';
import { Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TerritoriesModalProps {
    isOpen: boolean;
    onClose: () => void;
    munisZeroCount: number;
    panoramaScope?: 'total' | 'nacional' | 'bogota';
}

export function TerritoriesModal({ isOpen, onClose, munisZeroCount, panoramaScope }: TerritoriesModalProps) {
    const isBogota = panoramaScope === 'bogota';
    const totalBase = isBogota ? 30 : 250;
    const activeTemplos = totalBase - munisZeroCount;

    // Get current date formatted as "DD-MMM" in Spanish
    const getCurrentDateLabel = () => {
        const now = new Date();
        const day = now.getDate();
        const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        const month = months[now.getMonth()];
        return `${day}-${month}`;
    };

    const currentDateLabel = getCurrentDateLabel();

    const chartData = isBogota ? [
        { date: '29-dic', value: 29 },
        { date: '13-ene', value: 28 },
        { date: '16-ene', value: 27 },
        { date: 'Hoy', value: munisZeroCount },
    ] : [
        { date: '29-dic', value: 250 },
        { date: '16-ene', value: 234 },
        { date: '21-ene', value: 210 },
        { date: 'Hoy', value: munisZeroCount },
    ];

    const initialZero = isBogota ? 29 : 250;
    const currentZero = munisZeroCount;
    const reductionZero = initialZero > 0 ? ((initialZero - currentZero) / initialZero) * 100 : 0;
    const reductionZeroText = (
        <span className="flex items-baseline justify-center gap-1.5">
            <span className="text-2xl font-black text-emerald-400">{reductionZero.toFixed(0)}%</span>
            <span>Disminución territorios en cero</span>
        </span>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-[#0a0f16]/95 backdrop-blur-md border-[#1e293b] shadow-2xl p-8 rounded-2xl">
                <div className="flex flex-col items-center space-y-8">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter text-center">
                        Territorios activados
                    </h2>

                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/30">
                            <Landmark className="w-10 h-10 text-emerald-400" />
                        </div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                            {isBogota ? "Localidades activas" : "Municipios activos"}
                        </p>
                        <h3 className="text-6xl font-black text-emerald-400 leading-none">{activeTemplos}</h3>
                    </div>

                    <div className="w-full h-[300px]">
                        <Card className="bg-transparent border-none shadow-none">
                            <CardHeader className="p-0 mb-4">
                                <CardTitle className="text-sm font-bold text-center text-muted-foreground uppercase tracking-widest">
                                    {reductionZeroText}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 30, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#9ca3af"
                                            tick={{ fontSize: 10, fontWeight: 'bold' }}
                                            axisLine={false}
                                            tickLine={false}
                                            interval={0}
                                        />
                                        <YAxis hide domain={[0, (dataMax: number) => Math.max(dataMax * 1.2, 5)]} />
                                        <Line
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#10b981"
                                            strokeWidth={4}
                                            dot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                                            label={({ x, y, value }) => (
                                                <text
                                                    x={x}
                                                    y={y}
                                                    dy={-15}
                                                    fill="#10b981"
                                                    fontSize={13}
                                                    fontWeight="900"
                                                    textAnchor="middle"
                                                >
                                                    {value}
                                                </text>
                                            )}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
