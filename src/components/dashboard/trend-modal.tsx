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
}

const lineData = [
    { date: '29-dic', actual: 1491, acelerado: 1491 },
    { date: '15-ene', actual: 2611, acelerado: 2611 },
    { date: '28-Feb', actual: 5508, acelerado: 14681 },
];

const barData = [
    { name: 'Faltante', value: 9173, fill: '#0ea5e9' }, // sky-500
    { name: 'Plan Choque (274/día)', value: 12070, fill: '#f97316' }, // orange-500
    { name: 'Tendencia (66/día)', value: 4017, fill: '#0ea5e9' },
    { name: 'Ya Logrado (29-dic)', value: 1491, fill: '#f97316' },
];

export function TrendModal({ isOpen, onClose, metaTotal = 14681 }: TrendModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl bg-background/95 backdrop-blur border-muted shadow-2xl p-6">
                <div className="flex flex-col space-y-6">
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                            Ruta hacia los {metaTotal.toLocaleString('es-CO')} Referidos
                        </h2>
                        <p className="text-xl font-bold text-white/90">
                            Necesidad de Aceleración a partir del 15 de Enero
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full h-[400px]">
                        {/* Line Chart */}
                        <Card className="bg-muted/10 border-muted/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-bold text-center">Tendencia Referidos del SR</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[320px]">
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
                                                return (
                                                    <text x={x} y={y} dy={20} fill="#0ea5e9" fontSize={12} fontWeight="bold" textAnchor="middle">
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
                                            label={({ x, y, value }) => (
                                                <text x={x} y={y} dy={-15} fill="#f97316" fontSize={12} fontWeight="bold" textAnchor="middle">
                                                    {value.toLocaleString('es-CO')}
                                                </text>
                                            )}
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
                            <CardContent className="h-[320px]">
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
                </div>
            </DialogContent>
        </Dialog>
    );
}
