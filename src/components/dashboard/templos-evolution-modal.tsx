"use client";

import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';
import { Landmark } from 'lucide-react';

interface TemplosEvolutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTemplos: number;
    panoramaScope?: 'total' | 'nacional' | 'bogota';
}

export function TemplosEvolutionModal({ isOpen, onClose, currentTemplos, panoramaScope }: TemplosEvolutionModalProps) {
    const isBogota = panoramaScope === 'bogota';
    const initialValue = isBogota ? 1 : 130;

    // Growth percentage relative to day 1
    const avancePercentage = initialValue > 0 ? (currentTemplos / initialValue) * 100 : 0;

    const chartData = isBogota ? [
        { date: '29-dic', value: 1 },
        { date: '13-ene', value: 2 },
        { date: '16-ene', value: 3 },
        { date: 'Hoy', value: currentTemplos },
    ] : [
        { date: '29-dic', value: 130 },
        { date: '13-ene', value: 190 },
        { date: '16-ene', value: 215 },
        { date: 'Hoy', value: currentTemplos },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-[#0a0f16]/95 backdrop-blur-md border-[#1e293b] shadow-2xl p-8 rounded-2xl">
                <div className="flex flex-col items-center space-y-8">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter text-center">
                        Evolución Templos cargando referidos
                    </h2>

                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/30">
                            <Landmark className="w-10 h-10 text-blue-400" />
                        </div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Templos</p>
                        <h3 className="text-6xl font-black text-blue-400 leading-none">{currentTemplos.toLocaleString('es-CO')}</h3>
                    </div>

                    <div className="text-center">
                        {!['total', 'nacional', 'bogota'].includes(panoramaScope || '') && (
                            <span className="text-2xl font-black text-blue-400">
                                {avancePercentage.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}%
                            </span>
                        )}
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-2">
                            avance de templos cargando referidos
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
                                        <YAxis hide domain={[0, (dataMax: number) => Math.max(dataMax * 1.2, 5)]} />
                                        <Line
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#60a5fa"
                                            strokeWidth={4}
                                            dot={{ r: 6, fill: '#60a5fa', stroke: '#fff', strokeWidth: 2 }}
                                            label={({ x, y, value }) => (
                                                <text
                                                    x={x}
                                                    y={y}
                                                    dy={-15}
                                                    fill="#60a5fa"
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
