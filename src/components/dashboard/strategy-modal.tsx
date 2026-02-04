"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Save, X, User, Landmark } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { JuanFelipeData } from '@/lib/types';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    LabelList
} from 'recharts';
import { TrendingDown, Activity } from 'lucide-react';

interface StrategyCardProps {
    name: string;
    subtitle: string;
    image?: string;
    customColor?: string;
    className?: string;
    onClick?: () => void;
}

function StrategyCard({ name, subtitle, image, customColor, className, onClick }: StrategyCardProps) {
    // Use custom color if provided
    const bgColor = customColor ? `bg-[${customColor}]/10` : "bg-emerald-500/10";
    const borderColor = customColor ? `border-[${customColor}]/50` : "border-emerald-500/50";
    const accentBg = customColor || "#43a047";

    return (
        <Card
            className={cn(
                "overflow-hidden border-2 transition-all hover:scale-105",
                borderColor,
                bgColor,
                className,
                onClick && "cursor-pointer hover:shadow-xl hover:border-white/40"
            )}
            onClick={onClick}
        >
            <div className="relative aspect-square w-full bg-muted/20 flex items-center justify-center overflow-hidden p-8">
                {image ? (
                    <img src={image} alt={name} className="object-contain w-full h-full drop-shadow-lg" />
                ) : (
                    <User className="w-20 h-20 text-muted-foreground/30" />
                )}
            </div>
            <div className="py-1.5 px-3 text-sm font-black text-white uppercase text-center" style={{ backgroundColor: accentBg }}>
                {name}
            </div>
            <CardContent className="p-3 flex flex-col items-center justify-center min-h-[80px]">
                <p className="text-sm font-bold text-center text-muted-foreground uppercase leading-tight">
                    {subtitle}
                </p>
            </CardContent>
        </Card>
    );
}

interface StrategyModalProps {
    isOpen: boolean;
    onClose: () => void;
    zeroMunisCount: number;
    juanFelipeData?: JuanFelipeData;
    onUpdateJuanFelipe?: (data: JuanFelipeData) => void;
    carolinaData?: JuanFelipeData;
    onUpdateCarolina?: (data: JuanFelipeData) => void;
}

export function StrategyModal({ isOpen, onClose, zeroMunisCount, juanFelipeData, onUpdateJuanFelipe, carolinaData, onUpdateCarolina }: StrategyModalProps) {
    const [isFlipped, setIsFlipped] = React.useState(false);
    const [isDiegoFlipped, setIsDiegoFlipped] = React.useState(false);
    const [isCarolinaFlipped, setIsCarolinaFlipped] = React.useState(false);
    const [isEditing, setIsEditing] = React.useState(false);
    const [isEditingCarolina, setIsEditingCarolina] = React.useState(false);

    // Default values if none provided
    const currentData = juanFelipeData || {
        total: 4,
        locations: "Magdalena, Córdoba, Puerto Salgar y Villavicencio"
    };

    const currentCarolinaData = carolinaData || {
        total: 4,
        locations: "Cundinamarca, Antioquia, Risaralda y Valle"
    };

    const [editTotal, setEditTotal] = React.useState(currentData.total.toString());
    const [editLocations, setEditLocations] = React.useState(currentData.locations);

    const [editCarolinaTotal, setEditCarolinaTotal] = React.useState(currentCarolinaData.total.toString());
    const [editCarolinaLocations, setEditCarolinaLocations] = React.useState(currentCarolinaData.locations);

    // FIX: Sync form ONLY when the edit dialog opens, not on every re-render
    React.useEffect(() => {
        if (isEditing) {
            setEditTotal(currentData.total.toString());
            setEditLocations(currentData.locations);
        }
    }, [isEditing]); // Only depend on isEditing opening

    React.useEffect(() => {
        if (isEditingCarolina) {
            setEditCarolinaTotal(currentCarolinaData.total.toString());
            setEditCarolinaLocations(currentCarolinaData.locations);
        }
    }, [isEditingCarolina]); // Only depend on isEditingCarolina opening

    const handleSave = () => {
        if (onUpdateJuanFelipe) {
            onUpdateJuanFelipe({
                total: parseInt(editTotal) || 0,
                locations: editLocations
            });
        }
        setIsEditing(false);
    };

    const handleSaveCarolina = () => {
        if (onUpdateCarolina) {
            onUpdateCarolina({
                total: parseInt(editCarolinaTotal) || 0,
                locations: editCarolinaLocations
            });
        }
        setIsEditingCarolina(false);
    };

    const diegoChartData = [
        { date: '29-dic', value: 250 },
        { date: '16 Ene', value: 234 },
        { date: '21 Ene', value: 210 },
        { date: 'Hoy', value: zeroMunisCount },
    ];

    const municipiosActivados = 250 - zeroMunisCount;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onClose();
                setIsFlipped(false);
                setIsDiegoFlipped(false);
                setIsCarolinaFlipped(false);
            }
        }}>
            <DialogContent className="max-w-4xl bg-background/95 backdrop-blur border-muted shadow-2xl p-10">
                <div className="flex flex-col items-center justify-center space-y-8 py-8 w-full">

                    {/* Top - Juan Felipe Gómez with FLIP EFFECT */}
                    <div className="flex justify-center w-full">
                        <div className="w-64 h-[400px] [perspective:1000px] group">
                            <div className={cn(
                                "relative w-full h-full transition-all duration-700 [transform-style:preserve-3d]",
                                isFlipped ? "[transform:rotateY(180deg)]" : ""
                            )}>
                                {/* Front Side */}
                                <div className="absolute inset-0 [backface-visibility:hidden]">
                                    <StrategyCard
                                        name="Juan Felipe"
                                        subtitle="Plan Homólogos y trabajo con MMM"
                                        image="/carolina-novoa.png"
                                        customColor="#43a047"
                                        className="h-full"
                                        onClick={() => setIsFlipped(true)}
                                    />
                                    <div className="absolute bottom-6 w-full flex justify-center pointer-events-none">
                                        <p className="text-[9px] font-black text-emerald-400/50 animate-pulse uppercase">Clic para reverso</p>
                                    </div>
                                </div>

                                {/* Back Side */}
                                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                                    <Card
                                        className="h-full overflow-hidden border-2 border-emerald-500/50 bg-emerald-500/10 flex flex-col cursor-pointer hover:shadow-2xl transition-all"
                                        onClick={() => setIsFlipped(false)}
                                    >
                                        <div className="relative py-2 px-3 bg-emerald-600/30 border-b border-white/10 flex justify-center items-center h-10">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Detalle Plan Homólogos</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-2 h-7 w-7 hover:bg-white/10 text-emerald-400"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsEditing(true);
                                                }}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <CardContent className="flex-1 p-6 flex flex-col items-center justify-center space-y-6">
                                            <div className="flex flex-col items-center text-center">
                                                <div className="p-4 bg-emerald-500/20 rounded-2xl mb-2">
                                                    <Landmark className="h-10 w-10 text-emerald-400" />
                                                </div>
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Total Homólogos</p>
                                                <p className="text-5xl font-black text-emerald-400">{currentData.total}</p>
                                            </div>
                                            <div className="w-full p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Ubicaciones</p>
                                                <p className="text-[13px] font-bold leading-tight">
                                                    {currentData.locations}
                                                </p>
                                            </div>
                                            <p className="text-[9px] font-bold text-emerald-400/50 animate-pulse uppercase">Click para volver</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Row - Diego & Carolina */}
                    <div className="flex justify-between w-full max-w-2xl px-8 gap-8">
                        {/* Left - Diego Fernando Galvis with FLIP EFFECT */}
                        <div className="w-64 h-[400px] [perspective:1000px] group">
                            <div className={cn(
                                "relative w-full h-full transition-all duration-700 [transform-style:preserve-3d]",
                                isDiegoFlipped ? "[transform:rotateY(180deg)]" : ""
                            )}>
                                {/* Front Side */}
                                <div className="absolute inset-0 [backface-visibility:hidden]">
                                    <StrategyCard
                                        name="Diego Fernando"
                                        subtitle={`${zeroMunisCount} apoyos personalizados`}
                                        image="/juan-felipe.png"
                                        customColor="#00b0f0"
                                        className="h-full"
                                        onClick={() => setIsDiegoFlipped(true)}
                                    />
                                    <div className="absolute bottom-6 w-full flex justify-center pointer-events-none">
                                        <p className="text-[9px] font-black text-blue-400/50 animate-pulse uppercase">Clic para reverso</p>
                                    </div>
                                </div>

                                {/* Back Side */}
                                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                                    <Card
                                        className="h-full overflow-hidden border-2 border-blue-500/50 bg-blue-500/10 flex flex-col cursor-pointer hover:shadow-2xl transition-all"
                                        onClick={() => setIsDiegoFlipped(false)}
                                    >
                                        <div className="py-2 px-3 bg-blue-600/30 border-b border-white/10 flex justify-center items-center h-10">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Municipios Activados</span>
                                        </div>
                                        <CardContent className="flex-1 p-4 flex flex-col items-center justify-between space-y-4">
                                            <div className="flex flex-col items-center text-center">
                                                <div className="p-3 bg-blue-500/20 rounded-xl mb-1">
                                                    <Activity className="h-6 w-6 text-blue-400" />
                                                </div>
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Total Activados</p>
                                                <p className="text-4xl font-black text-blue-400">{municipiosActivados}</p>
                                            </div>

                                            <div className="w-full h-32 bg-white/5 rounded-xl border border-white/5 p-2 overflow-hidden">
                                                <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest mb-2 text-center flex items-center justify-center gap-1">
                                                    <TrendingDown className="h-3 w-3" /> Tendencia por Activar
                                                </p>
                                                <div className="h-24 w-full">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={diegoChartData} margin={{ top: 20, right: 30, left: 30, bottom: 0 }}>
                                                            <defs>
                                                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor="#00b0f0" stopOpacity={0.3} />
                                                                    <stop offset="95%" stopColor="#00b0f0" stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <CartesianGrid
                                                                strokeDasharray="3 3"
                                                                vertical={false}
                                                                stroke="rgba(255,255,255,0.05)"
                                                            />
                                                            <XAxis
                                                                dataKey="date"
                                                                tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }}
                                                                axisLine={false}
                                                                tickLine={false}
                                                                interval={0}
                                                            />
                                                            <YAxis
                                                                tick={{ fontSize: 8, fill: '#94a3b8' }}
                                                                axisLine={false}
                                                                tickLine={false}
                                                                domain={['auto', 'auto']}
                                                                hide
                                                            />
                                                            <Area
                                                                type="monotone"
                                                                dataKey="value"
                                                                stroke="#00b0f0"
                                                                strokeWidth={3}
                                                                fillOpacity={1}
                                                                fill="url(#colorValue)"
                                                                dot={{ r: 4, fill: '#00b0f0', stroke: '#fff', strokeWidth: 1 }}
                                                                isAnimationActive={false}
                                                            >
                                                                <LabelList
                                                                    dataKey="value"
                                                                    position="top"
                                                                    offset={10}
                                                                    style={{ fill: '#00b0f0', fontSize: '11px', fontWeight: '900' }}
                                                                />
                                                            </Area>
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>

                                            <p className="text-[9px] font-bold text-blue-400/50 animate-pulse uppercase">Click para volver</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>

                        {/* Right - Carolina Novoa with FLIP EFFECT */}
                        <div className="w-64 h-[400px] [perspective:1000px] group">
                            <div className={cn(
                                "relative w-full h-full transition-all duration-700 [transform-style:preserve-3d]",
                                isCarolinaFlipped ? "[transform:rotateY(180deg)]" : ""
                            )}>
                                {/* Front Side */}
                                <div className="absolute inset-0 [backface-visibility:hidden]">
                                    <StrategyCard
                                        name="Carolina"
                                        subtitle="Cronogramas, asesorías y recategorización departamental y municipal"
                                        image="/diego-galvis.png"
                                        customColor="#ffc000"
                                        className="h-full"
                                        onClick={() => setIsCarolinaFlipped(true)}
                                    />
                                    <div className="absolute bottom-6 w-full flex justify-center pointer-events-none">
                                        <p className="text-[8px] font-bold text-amber-400/50 animate-pulse uppercase mt-1">Clic para reverso</p>
                                    </div>
                                </div>

                                {/* Back Side */}
                                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                                    <Card
                                        className="h-full overflow-hidden border-2 border-amber-500/50 bg-amber-500/10 flex flex-col cursor-pointer hover:shadow-2xl transition-all"
                                        onClick={() => setIsCarolinaFlipped(false)}
                                    >
                                        <div className="relative py-2 px-3 bg-amber-600/30 border-b border-white/10 flex justify-center items-center h-10">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Detalle Cronogramas</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-2 h-7 w-7 hover:bg-white/10 text-amber-400"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsEditingCarolina(true);
                                                }}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <CardContent className="flex-1 p-6 flex flex-col items-center justify-center space-y-6">
                                            <div className="flex flex-col items-center text-center">
                                                <div className="p-4 bg-amber-500/20 rounded-2xl mb-2">
                                                    <Activity className="h-10 w-10 text-amber-400" />
                                                </div>
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Total Cronogramas</p>
                                                <p className="text-5xl font-black text-amber-400">{currentCarolinaData.total}</p>
                                            </div>
                                            <div className="w-full p-4 bg-white/5 rounded-xl border border-white/5 text-center">
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Cronogramas Realizados</p>
                                                <p className="text-[13px] font-bold leading-tight">
                                                    {currentCarolinaData.locations}
                                                </p>
                                            </div>
                                            <p className="text-[9px] font-bold text-amber-400/50 animate-pulse uppercase">Click para volver</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Minimal Edit Dialog */}
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogContent className="max-w-md bg-[#020817] text-white border-white/20 shadow-2xl p-6">
                        <DialogHeader className="mb-4">
                            <DialogTitle className="text-xl font-black uppercase text-emerald-400">Editar Homólogos</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Cantidad Total</label>
                                <Input
                                    type="number"
                                    value={editTotal}
                                    onChange={(e) => setEditTotal(e.target.value)}
                                    className="bg-white/5 border-white/10 focus:ring-emerald-500 font-bold text-lg h-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Ubicaciones</label>
                                <Input
                                    value={editLocations}
                                    onChange={(e) => setEditLocations(e.target.value)}
                                    className="bg-white/5 border-white/10 focus:ring-emerald-500 font-bold text-lg h-12"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-bold" onClick={handleSave}>
                                    <Save className="mr-2 h-4 w-4" /> Guardar
                                </Button>
                                <Button variant="outline" className="flex-1 border-white/10 hover:bg-white/10 font-bold text-white" onClick={() => setIsEditing(false)}>
                                    <X className="mr-2 h-4 w-4" /> Cancelar
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Minimal Edit Dialog Carolina */}
                <Dialog open={isEditingCarolina} onOpenChange={setIsEditingCarolina}>
                    <DialogContent className="max-w-md bg-[#020817] text-white border-white/20 shadow-2xl p-6">
                        <DialogHeader className="mb-4">
                            <DialogTitle className="text-xl font-black uppercase text-amber-400">Editar Cronogramas</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Cantidad Total</label>
                                <Input
                                    type="number"
                                    value={editCarolinaTotal}
                                    onChange={(e) => setEditCarolinaTotal(e.target.value)}
                                    className="bg-white/5 border-white/10 focus:ring-amber-500 font-bold text-lg h-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Departamentos</label>
                                <Input
                                    value={editCarolinaLocations}
                                    onChange={(e) => setEditCarolinaLocations(e.target.value)}
                                    className="bg-white/5 border-white/10 focus:ring-amber-500 font-bold text-lg h-12"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button className="flex-1 bg-amber-600 hover:bg-amber-700 font-bold" onClick={handleSaveCarolina}>
                                    <Save className="mr-2 h-4 w-4" /> Guardar
                                </Button>
                                <Button variant="outline" className="flex-1 border-white/10 hover:bg-white/10 font-bold text-white" onClick={() => setIsEditingCarolina(false)}>
                                    <X className="mr-2 h-4 w-4" /> Cancelar
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </DialogContent>
        </Dialog>
    );
}
