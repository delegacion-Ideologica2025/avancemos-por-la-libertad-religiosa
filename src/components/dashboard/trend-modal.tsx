"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';

interface TrendModalProps {
    isOpen: boolean;
    onClose: () => void;
    metaTotal?: number;
    currentReferidos?: number;
    isBogota?: boolean;
}

export function TrendModal({ isOpen, onClose, metaTotal = 14681, currentReferidos = 0, isBogota = false }: TrendModalProps) {
    // Get current date formatted as "DD-MMM" in Spanish
    const getCurrentDateLabel = () => {
        const now = new Date();
        const day = now.getDate();
        const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        const month = months[now.getMonth()];
        return `${day}-${month}`;
    };

    const currentDateLabel = getCurrentDateLabel();
    const startReferidos = isBogota ? 7 : 1491; // 29-dic baseline: 7 for Bogota, 1491 National

    // Calculate current daily rate from 29-dic to today
    const now = new Date();
    const startDate = new Date(2025, 11, 29); // Dec 29, 2025
    const daysSinceStart = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const currentDailyRate = Math.ceil((currentReferidos - startReferidos) / daysSinceStart);

    // Calculate days from today to Feb 28
    const endDate = new Date(2026, 1, 28); // Feb 28, 2026
    const daysLeft = Math.max(1, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    // Project where we'll be on Feb 28 if we continue at current daily rate
    const projectedFeb28 = currentReferidos + (currentDailyRate * daysLeft);

    const lineData = [
        { date: '29-dic', actual: startReferidos, acelerado: startReferidos },
        { date: currentDateLabel, actual: currentReferidos, acelerado: currentReferidos },
        { date: '28-Feb', actual: projectedFeb28, acelerado: metaTotal },
    ];

    const requiredDaily = Math.ceil((metaTotal - currentReferidos) / daysLeft);
    const faltante = metaTotal - currentReferidos;

    // Function to get color based on progress
    const getProgressColor = (value: number, target: number) => {
        const progress = (value / target) * 100;
        if (progress >= 100) return '#43a047'; // Green
        if (progress >= 65) return '#fdd835';  // Yellow
        if (progress >= 30) return '#fb8c00';  // Orange
        return '#e53935'; // Red
    };

    const barData = [
        { name: 'Faltante', value: Math.max(0, faltante), fill: '#0ea5e9' },
        { name: `Plan Choque (${requiredDaily}/día)`, value: metaTotal - currentReferidos, fill: '#f97316' },
        { name: `Tendencia (${currentDailyRate}/día)`, value: currentReferidos - startReferidos, fill: '#0ea5e9' },
        { name: 'Ya Logrado (29-dic)', value: startReferidos, fill: '#f97316' },
    ];

    const evoPlanChoqueData = [
        { date: '29-dic', value: 321 },
        { date: '15-ene', value: 274 },
        { date: '20-ene', value: 245 },
        { date: currentDateLabel, value: requiredDaily },
    ];

    const startPlanChoque = 321;
    const disminucionAbsoluta = startPlanChoque - requiredDaily;
    const porcentajeReduccion = ((disminucionAbsoluta / startPlanChoque) * 100).toFixed(1);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl bg-background/95 backdrop-blur border-muted shadow-2xl p-6">
                <div className="flex flex-col space-y-6 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                            Ruta hacia los {metaTotal.toLocaleString('es-CO')} Referidos
                        </h2>
                        <p className="text-xl font-bold text-white/90">
                            Necesidad de Aceleración a partir del {currentDateLabel}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                        {/* Line Chart */}
                        <Card className="bg-muted/10 border-muted/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-bold text-center">Tendencia Referidos del SR</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={lineData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                        <XAxis dataKey="date" stroke="#9ca3af" />
                                        <YAxis stroke="#9ca3af" tickFormatter={(value) => value.toLocaleString('es-CO')} />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="actual"
                                            name="Escenario 1 (Actual)"
                                            stroke="#0ea5e9"
                                            strokeWidth={3}
                                            dot={{ r: 4 }}
                                            label={({ x, y, value, index }) => {
                                                if (index < 2) return <></>;
                                                const color = getProgressColor(value, metaTotal);
                                                return (
                                                    <text x={x} y={y} dy={20} fill={color} fontSize={12} fontWeight="bold" textAnchor="middle">
                                                        {value.toLocaleString('es-CO')}
                                                    </text>
                                                );
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="acelerado"
                                            name="Escenario 2 (Acelerado)"
                                            stroke="#f97316"
                                            strokeWidth={3}
                                            dot={{ r: 4 }}
                                            label={({ x, y, value }) => {
                                                const color = getProgressColor(value, metaTotal);
                                                return (
                                                    <text x={x} y={y} dy={-15} fill={color} fontSize={12} fontWeight="bold" textAnchor="middle">
                                                        {value.toLocaleString('es-CO')}
                                                    </text>
                                                );
                                            }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Bar Chart */}
                        <Card className="bg-muted/10 border-muted/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-bold text-center">Referidos por Día</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart layout="vertical" data={barData} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                                        <XAxis type="number" stroke="#9ca3af" tickFormatter={(value) => value.toLocaleString('es-CO')} />
                                        <YAxis dataKey="name" type="category" width={140} stroke="#9ca3af" tick={{ fontSize: 11 }} />
                                        <Bar
                                            dataKey="value"
                                            radius={[0, 4, 4, 0]}
                                            barSize={30}
                                            label={{
                                                position: 'right',
                                                fill: '#fff',
                                                formatter: (val: number) => val.toLocaleString('es-CO'),
                                                fontSize: 12,
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Evo Plan Choque Chart - Centered Below */}
                    <div className="w-full max-w-2xl mx-auto">
                        <Card className="bg-muted/10 border-muted/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-bold text-center">Evolución Plan Choque</CardTitle>
                                <div className="flex flex-col items-center mt-1 leading-normal">
                                    <p className="text-[14px] font-black text-white">
                                        <span className="text-[#43a047]">-{disminucionAbsoluta}</span> referidos diarios
                                    </p>
                                    <p className="text-[14px] font-black text-white">
                                        <span className="text-[#43a047]">{porcentajeReduccion}%</span> disminuido
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={evoPlanChoqueData} margin={{ top: 20, right: 30, left: 30, bottom: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                        <XAxis dataKey="date" stroke="#9ca3af" interval={0} tick={{ fontSize: 10 }} />
                                        <YAxis stroke="#9ca3af" hide />
                                        <Line
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#f97316"
                                            strokeWidth={4}
                                            dot={{ r: 6, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }}
                                            label={({ x, y, value }) => (
                                                <text x={x} y={y} dy={-15} fill="#f97316" fontSize={13} fontWeight="900" textAnchor="middle">
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
