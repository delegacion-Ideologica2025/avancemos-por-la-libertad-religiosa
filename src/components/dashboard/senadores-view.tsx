"use client";

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { User } from 'lucide-react';
import { DashboardData } from '@/lib/types';
import { getDefaultMilestone } from '@/lib/utils-dates';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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
}

function SenatorCard({ name, image, meta, referidos, className, customColor, imageFit = 'cover', imagePosition = 'center', labelPosition = 'left', milestone }: SenatorCardProps) {
    // Progress based on selected milestone
    const targetMeta = meta * (milestone / 100);
    const progress = targetMeta > 0 ? (referidos / targetMeta) * 100 : 0;

    // Use custom color if provided
    const borderColor = customColor ? `border-[${customColor}]/50` : "border-emerald-500/50";
    const bgColor = customColor ? `bg-[${customColor}]/10` : "bg-emerald-500/10";
    const accentBg = customColor || "#43a047";

    return (
        <Card className={cn("overflow-hidden border-2 transition-all hover:scale-105", borderColor, bgColor, className)}>
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
                </div>
                <div className="mt-1.5 text-3xl font-black font-mono" style={{ color: customColor || "#43a047" }}>
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

export function SenadoresView({ data }: { data: DashboardData }) {
    const [milestone, setMilestone] = useState<string>(getDefaultMilestone());

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
                    />
                    <SenatorCard
                        name="Ana Paola Agudelo"
                        image="/ana-paola.png"
                        meta={anaStats.meta}
                        referidos={anaStats.referidos}
                        className="w-full max-w-[280px]"
                        customColor="#ffc000"
                        milestone={parseInt(milestone)}
                    />
                </div>
            </div>
        </div>
    );
}
