"use client";

import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';
import { Landmark } from 'lucide-react';

interface EvolutionPoint {
    date: string;
    value: number;
}

interface GenericEvolutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    activeLabel: string;
    activeCount: number;
    timeline: EvolutionPoint[];
    maxChartValue?: number;
    chartSubtitle?: React.ReactNode;
}

export function GenericEvolutionModal({
    isOpen,
    onClose,
    title,
    activeLabel,
    activeCount,
    timeline,
    maxChartValue = 30,
    chartSubtitle = "Disminución territorios en cero"
}: GenericEvolutionModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-[#0a0f16]/95 backdrop-blur-md border-[#1e293b] shadow-2xl p-8 rounded-2xl">
                <div className="flex flex-col items-center space-y-8">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter text-center">
                        {title}
                    </h2>

                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/30">
                            < Landmark className="w-10 h-10 text-emerald-400" />
                        </div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{activeLabel}</p>
                        <h3 className="text-6xl font-black text-emerald-400 leading-none">{activeCount}</h3>
                    </div>

                    <div className="w-full h-[300px]">
                        <Card className="bg-transparent border-none shadow-none">
                            <CardHeader className="p-0 mb-4">
                                <CardTitle className="text-sm font-bold text-center text-muted-foreground uppercase tracking-widest">
                                    {chartSubtitle}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={timeline} margin={{ top: 20, right: 30, left: 30, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                        <XAxis
                                            dataKey="date"
                                            stroke="#9ca3af"
                                            tick={{ fontSize: 10, fontWeight: 'bold' }}
                                            axisLine={false}
                                            tickLine={false}
                                            interval={0}
                                        />
                                        <YAxis hide domain={[0, maxChartValue]} />
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
