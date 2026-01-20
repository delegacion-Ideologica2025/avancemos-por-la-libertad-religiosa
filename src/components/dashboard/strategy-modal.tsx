"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { User } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface StrategyCardProps {
    name: string;
    subtitle: string;
    image?: string;
    customColor?: string;
    className?: string;
}

function StrategyCard({ name, subtitle, image, customColor, className }: StrategyCardProps) {
    // Use custom color if provided
    const bgColor = customColor ? `bg-[${customColor}]/10` : "bg-emerald-500/10";
    const borderColor = customColor ? `border-[${customColor}]/50` : "border-emerald-500/50";
    const accentBg = customColor || "#43a047";

    return (
        <Card className={cn("overflow-hidden border-2 transition-all hover:scale-105", borderColor, bgColor, className)}>
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
}

export function StrategyModal({ isOpen, onClose, zeroMunisCount }: StrategyModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl bg-background/95 backdrop-blur border-muted shadow-2xl p-10">
                <div className="flex flex-col items-center justify-center space-y-8 py-8 w-full">

                    {/* Top - Juan Felipe Gómez */}
                    <div className="flex justify-center w-full">
                        <StrategyCard
                            name="Juan Felipe"
                            subtitle="Plan Homólogos y trabajo con MMM"
                            image="/carolina-novoa.png" // Network icon
                            customColor="#43a047" // Green
                            className="w-64"
                        />
                    </div>

                    {/* Bottom Row - Diego & Carolina */}
                    <div className="flex justify-between w-full max-w-2xl px-8 gap-8">
                        {/* Left - Diego Fernando Galvis */}
                        <StrategyCard
                            name="Diego Fernando"
                            subtitle={`${zeroMunisCount} apoyos personalizados`}
                            image="/juan-felipe.png" // Phone icon
                            customColor="#00b0f0" // Blue
                            className="w-64"
                        />

                        {/* Right - Carolina Novoa */}
                        <StrategyCard
                            name="Carolina"
                            subtitle="Cronogramas de trabajo departamentales"
                            image="/diego-galvis.png" // Calendar icon
                            customColor="#ffc000" // Yellow
                            className="w-64"
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
