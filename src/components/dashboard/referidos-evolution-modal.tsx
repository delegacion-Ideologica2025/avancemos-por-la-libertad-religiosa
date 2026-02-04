"use client";

import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';
import { Users } from 'lucide-react';

interface ReferidosEvolutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentReferidos: number;
    panoramaScope?: 'total' | 'nacional' | 'bogota';
}

export function ReferidosEvolutionModal({ isOpen, onClose, currentReferidos, panoramaScope }: ReferidosEvolutionModalProps) {
    const isBogota = panoramaScope === 'bogota';
    const initialValue = isBogota ? 7 : 900;

    // Growth percentage relative to day 1 (without target meta)
    const avancePercentage = initialValue > 0 ? (currentReferidos / initialValue) * 100 : 0;

    const chartData = isBogota ? [
        { date: '29-dic', value: 7 },
        { date: '13-ene', value: 39 },
        { date: '16-ene', value: 105 },
        { date: 'Hoy', value: currentReferidos },
    ] : [
        { date: '29-dic', value: 900 },
        { date: '13-ene', value: 2800 },
        { date: '16-ene', value: 3100 },
        { date: 'Hoy', value: currentReferidos },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-[#0a0f16]/95 backdrop-blur-md border-[#1e293b] shadow-2xl p-8 rounded-2xl">
                <div className="flex flex-col items-center space-y-8">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter text-center">
                        Evolución Referidos Cargados
                    </h2>

                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/30">
                            <Users className="w-10 h-10 text-emerald-400" />
                        </div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Referidos Totales</p>
                        <h3 className="text-6xl font-black text-emerald-400 leading-none">{currentReferidos.toLocaleString('es-CO')}</h3>
                    </div>

                    <div className="text-center">
                        {!['total', 'nacional', 'bogota'].includes(panoramaScope || '') && (
                            <span className="text-2xl font-black text-emerald-400">
                                {avancePercentage.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}%
                            </span>
                        )}
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-2">
                            avance de referidos cargados
                        </span>
                    </div>

                    <div className="w-full h-[300px]">
                        <Card className="bg-transparent border-none shadow-none">
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
                                        <YAxis hide domain={[0, (dataMax: number) => Math.max(dataMax * 1.2, 20)]} />
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
                                                    {value.toLocaleString('es-CO')}
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
