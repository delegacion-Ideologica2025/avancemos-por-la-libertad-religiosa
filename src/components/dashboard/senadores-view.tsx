"use client";

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn, getProgressColor } from "@/lib/utils";
import { User } from 'lucide-react';
import { DashboardData } from '@/lib/types';
import { getDefaultMilestone, isRedEnabled } from '@/lib/utils-dates';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';

interface SenatorCardProps {
    name: string;
    image?: string;
    meta: number;
    referidos: number;
    className?: string;
    customColor?: string;
    imageFit?: 'cover' | 'contain';
    imagePosition?: 'center' | 'top';
    labelPosition?: 'left' | 'right';
    milestone: number;
    onClick?: () => void;
}

function SenatorCard({ name, image, meta, referidos, className, customColor, imageFit = 'cover', imagePosition = 'center', labelPosition = 'left', milestone, onClick }: SenatorCardProps) {
    // Progress based on selected milestone
    const targetMeta = meta * (milestone / 100);
    const progress = targetMeta > 0 ? (referidos / targetMeta) * 100 : 0;

    // Use custom color if provided
    const isSpecialCase = milestone === 100 && progress < 30 && !isRedEnabled();
    const pColor = getProgressColor(progress, milestone);
    const borderColor = isSpecialCase ? "border-white/20" : `border-[${pColor}]/50`;
    const bgColor = isSpecialCase ? "bg-white/5" : `bg-[${pColor}]/10`;
    const accentBg = isSpecialCase ? "#1e293b" : (customColor || "#43a047");

    return (
        <Card
            onClick={onClick}
            className={cn(
                "overflow-hidden border-2 transition-all cursor-pointer hover:scale-105 hover:shadow-xl group/card",
                borderColor,
                bgColor,
                className
            )}
        >
            <div className="relative aspect-square w-full bg-muted/20 flex items-center justify-center overflow-hidden">
                {image ? (
                    <img src={image} alt={name} className={`object-${imageFit} w-full h-full ${imagePosition === 'top' ? 'object-top' : ''}`} />
                ) : (
                    <User className="w-20 h-20 text-muted-foreground/30" />
                )}
            </div>
            <div className="py-1.5 px-3 text-sm font-black text-white uppercase text-center" style={{ backgroundColor: accentBg }}>
                {name}
            </div>
            <CardContent className="p-2 flex flex-col items-center">
                <div className="text-center space-y-0.5">
                    <p className="text-sm font-bold text-muted-foreground uppercase">
                        Objetivo: {meta.toLocaleString('es-CO')}
                    </p>
                    <p className="text-sm font-bold text-muted-foreground uppercase">
                        Referidos: {referidos.toLocaleString('es-CO')}
                    </p>
                    <p className="text-sm font-bold text-muted-foreground uppercase">
                        Faltante: {Math.ceil(Math.max(0, targetMeta - referidos)).toLocaleString('es-CO')}
                    </p>
                </div>
                <div className="mt-1.5 text-3xl font-black font-mono" style={{ color: pColor }}>
                    {progress.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                </div>
            </CardContent>
        </Card>
    );
}

function ColombiaMap() {
    return (
        <div className="relative w-full aspect-[3/4] max-w-[500px] flex items-center justify-center">
            <img
                src="/colombia-map.png"
                alt="Mapa de Colombia"
                className="w-full h-full object-contain drop-shadow-2xl"
            />
        </div>
    );
}

const SENATOR_DEPARTMENTS: Record<string, string[]> = {
    "Manuel Virgüez Piraquive": [
        "ATLANTICO", "BOLIVAR", "CORDOBA", "MAGDALENA", "CESAR", "CHOCO",
        "NORTE DE SANTANDER", "LA GUAJIRA", "SAN ANDRES", "SANTANDER",
        "SUCRE", "ANTIOQUIA", "CALDAS", "QUINDIO", "RISARALDA"
    ],
    "Carlos Eduardo Guevara": ["CUNDINAMARCA", "BOGOTA", "BOYACA"],
    "Ana Paola Agudelo": [
        "AMAZONAS", "CAQUETA", "CASANARE", "CAUCA", "CONSULADOS", "GUAINIA",
        "GUAVIARE", "HUILA", "META", "NARINO", "PUTUMAYO", "TOLIMA", "VAUPES",
        "VICHADA", "ARAUCA", "VALLE DEL CAUCA"
    ]
};

const SENATOR_MODAL_TITLES: Record<string, string> = {
    "Manuel Virgüez Piraquive": "Ranking Departamental - Senador Manuel Virguëz",
    "Carlos Eduardo Guevara": "Ranking Departamental - Senador Carlos Eduardo Guevara",
    "Ana Paola Agudelo": "Ranking Departamental - Senadora Ana Paola Agudelo"
};

export function SenadoresView({ data }: { data: DashboardData }) {
    const [milestone, setMilestone] = useState<string>(getDefaultMilestone());
    const [selectedSenator, setSelectedSenator] = useState<string | null>(null);

    const normalize = (str: string) => {
        if (!str) return '';
        return str.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase()
            .replace(/\.?D\.?C\.?/g, '')
            .replace(/[^A-Z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    };

    const getStats = (deptNames: string[]) => {
        const normalizedTargets = deptNames.map(normalize);
        const filtered = data.departamentos.filter(d => {
            const normalizedName = normalize(d.name);
            return normalizedTargets.some(target =>
                normalizedName === target ||
                normalizedName.includes(target) ||
                target.includes(normalizedName)
            );
        });

        return {
            meta: filtered.reduce((acc, d) => acc + (d.meta || 0), 0),
            referidos: filtered.reduce((acc, d) => acc + (d.referidos || 0), 0)
        };
    };

    const manuelStats = getStats([
        "ATLANTICO", "BOLIVAR", "CORDOBA", "MAGDALENA", "CESAR", "CHOCO",
        "NORTE DE SANTANDER", "LA GUAJIRA", "SAN ANDRES", "SANTANDER",
        "SUCRE", "ANTIOQUIA", "CALDAS", "QUINDIO", "RISARALDA"
    ]);

    const carlosStats = getStats(["CUNDINAMARCA", "BOGOTA", "BOYACA"]);

    const anaStats = getStats([
        "AMAZONAS", "CAQUETA", "CASANARE", "CAUCA", "CONSULADOS", "GUAINIA",
        "GUAVIARE", "HUILA", "META", "NARINO", "PUTUMAYO", "TOLIMA", "VAUPES",
        "VICHADA", "ARAUCA", "VALLE DEL CAUCA"
    ]);

    return (
        <div className="flex flex-col space-y-4 w-full animate-in fade-in zoom-in duration-500">
            <div className="w-full max-w-7xl flex justify-end px-4">
                <Select value={milestone} onValueChange={setMilestone}>
                    <SelectTrigger className="w-[180px] bg-muted/20 border-muted/50 font-bold">
                        <SelectValue placeholder="Seleccionar Avance" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="30">Objetivo 30%</SelectItem>
                        <SelectItem value="65">Objetivo 65%</SelectItem>
                        <SelectItem value="100">Objetivo 100%</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-12 gap-6 items-center px-4">
                {/* Manuel Virgüez Card */}
                <div className="col-span-12 md:col-span-3 flex justify-center">
                    <SenatorCard
                        name="Manuel Virgüez Piraquive"
                        image="/manuel-virguez.png"
                        meta={manuelStats.meta}
                        referidos={manuelStats.referidos}
                        className="w-full max-w-[280px]"
                        customColor="#43a047"
                        imageFit="cover"
                        labelPosition="right"
                        milestone={parseInt(milestone)}
                        onClick={() => setSelectedSenator("Manuel Virgüez Piraquive")}
                    />
                </div>

                {/* Map Area */}
                <div className="col-span-12 md:col-span-6 flex flex-col items-center justify-center py-10 rounded-3xl bg-muted/5 border border-muted/10 shadow-inner relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <ColombiaMap />
                </div>

                {/* Right Side Senators */}
                <div className="col-span-12 md:col-span-3 flex flex-col gap-6 items-center">
                    <SenatorCard
                        name="Carlos Eduardo Guevara"
                        image="/carlos-guevara.png"
                        meta={carlosStats.meta}
                        referidos={carlosStats.referidos}
                        className="w-full max-w-[280px]"
                        customColor="#00b0f0"
                        milestone={parseInt(milestone)}
                        onClick={() => setSelectedSenator("Carlos Eduardo Guevara")}
                    />
                    <SenatorCard
                        name="Ana Paola Agudelo"
                        image="/ana-paola.png"
                        meta={anaStats.meta}
                        referidos={anaStats.referidos}
                        className="w-full max-w-[280px]"
                        customColor="#ffc000"
                        milestone={parseInt(milestone)}
                        onClick={() => setSelectedSenator("Ana Paola Agudelo")}
                    />
                </div>
            </div>

            {/* Detail Modal */}
            <Dialog open={!!selectedSenator} onOpenChange={(open) => !open && setSelectedSenator(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-[#020817] text-white border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight text-center">
                            {selectedSenator ? SENATOR_MODAL_TITLES[selectedSenator] : 'Ranking Departamental'}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedSenator && (
                        <div className="flex-1 overflow-auto py-4 px-2">
                            <div className="h-[500px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={(() => {
                                            const m = parseInt(milestone);
                                            const senatorDepts = SENATOR_DEPARTMENTS[selectedSenator] || [];
                                            const normalizedTargets = senatorDepts.map(normalize);

                                            return data.departamentos
                                                .filter(d => {
                                                    const normalizedName = normalize(d.name);
                                                    return normalizedTargets.some(target =>
                                                        normalizedName === target ||
                                                        normalizedName.includes(target) ||
                                                        target.includes(normalizedName)
                                                    );
                                                })
                                                .map(d => {
                                                    const targetMeta = (d.meta || 0) * (m / 100);
                                                    const progress = targetMeta > 0 ? (d.referidos / targetMeta) * 100 : 0;
                                                    return {
                                                        name: d.name.toUpperCase(),
                                                        progress: parseFloat(progress.toFixed(2)),
                                                        referidos: d.referidos,
                                                        municipiosCount: d.children?.filter(c => c.type === 'municipio').length || 0,
                                                        color: getProgressColor(progress, m)
                                                    };
                                                })
                                                .sort((a, b) => {
                                                    if (b.progress !== a.progress) return b.progress - a.progress;
                                                    return b.referidos - a.referidos;
                                                });
                                        })()}
                                        layout="vertical"
                                        margin={{ top: 5, right: 60, left: 100, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ffffff10" />
                                        <XAxis
                                            type="number"
                                            domain={[0, 100]}
                                            hide
                                        />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            width={180}
                                            stroke="#94a3b8"
                                            fontSize={14}
                                            fontWeight="bold"
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#0f172a',
                                                border: '1px solid #1e293b',
                                                borderRadius: '8px',
                                                color: '#fff'
                                            }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-[#0f172a] border border-[#1e293b] p-4 rounded-lg shadow-xl text-white min-w-[200px]">
                                                            <p className="font-bold text-lg mb-2 border-b border-white/10 pb-1">{data.name}</p>
                                                            <div className="space-y-2 text-sm">
                                                                <p className="flex justify-between gap-6">
                                                                    <span className="text-gray-400">Referidos Cargados:</span>
                                                                    <span className="font-mono font-bold text-blue-400">{data.referidos.toLocaleString('es-CO')}</span>
                                                                </p>
                                                                <p className="flex justify-between gap-6">
                                                                    <span className="text-gray-400">Municipios:</span>
                                                                    <span className="font-mono font-bold text-purple-400">{data.municipiosCount}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar
                                            dataKey="progress"
                                            radius={[0, 4, 4, 0]}
                                            barSize={35}
                                            label={{
                                                position: 'right',
                                                fill: '#fff',
                                                fontSize: 14,
                                                fontWeight: 'bold',
                                                formatter: (v: number) => `${v.toLocaleString('es-CO')}%`
                                            }}
                                        >
                                            {(() => {
                                                const m = parseInt(milestone);
                                                const senatorDepts = SENATOR_DEPARTMENTS[selectedSenator] || [];
                                                const normalizedTargets = senatorDepts.map(normalize);

                                                return data.departamentos
                                                    .filter(d => {
                                                        const normalizedName = normalize(d.name);
                                                        return normalizedTargets.some(target =>
                                                            normalizedName === target ||
                                                            normalizedName.includes(target) ||
                                                            target.includes(normalizedName)
                                                        );
                                                    })
                                                    .map(d => {
                                                        const targetMeta = (d.meta || 0) * (m / 100);
                                                        const progress = targetMeta > 0 ? (d.referidos / targetMeta) * 100 : 0;
                                                        return {
                                                            progress: parseFloat(progress.toFixed(2)),
                                                            referidos: d.referidos,
                                                            color: getProgressColor(progress, m)
                                                        };
                                                    })
                                                    .sort((a, b) => {
                                                        if (b.progress !== a.progress) return b.progress - a.progress;
                                                        return b.referidos - a.referidos;
                                                    })
                                                    .map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ));
                                            })()}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
