"use client";

import React from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';
import { Landmark } from 'lucide-react';
import { GenericEvolutionModal } from './generic-evolution-modal';

interface CouncilEvolutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeCouncils: number;
    zeroCouncils: number;
    chartSubtitle?: React.ReactNode;
}

export function CouncilEvolutionModal({ isOpen, onClose, activeCouncils, zeroCouncils, chartSubtitle }: CouncilEvolutionModalProps) {
    const timeline = [
        { date: '29-dic', value: 25 },
        { date: '13-ene', value: 23 },
        { date: '16-ene', value: 20 },
        { date: 'Hoy', value: zeroCouncils },
    ];

    return (
        <GenericEvolutionModal
            isOpen={isOpen}
            onClose={onClose}
            title="Territorios activados"
            activeLabel="Municipios con Concejales activos"
            activeCount={activeCouncils}
            timeline={timeline}
            maxChartValue={30}
            chartSubtitle={chartSubtitle}
        />
    );
}
