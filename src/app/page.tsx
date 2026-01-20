"use client";

import React, { useState, useEffect } from 'react';
import { Header, DashboardShell } from '@/components/layout/shell';
import { UploadDialog } from '@/components/upload-dialog';
import { KPIGrid } from '@/components/dashboard/kpi-grid';
import { Scoreboard } from '@/components/dashboard/scoreboard';
import { RankingChart } from '@/components/dashboard/ranking-chart';
import { DataTable } from '@/components/dashboard/data-table';
import { ReportsButton } from '@/components/dashboard/reports-button';
import { SenadoresView } from '@/components/dashboard/senadores-view';
import { StrategyModal } from '@/components/dashboard/strategy-modal';
import { TrendModal } from '@/components/dashboard/trend-modal';
import { CalendarModal } from '@/components/dashboard/calendar-modal';
import { DiputadosView } from '@/components/dashboard/diputados-view';
import { ConcejalesView } from '@/components/dashboard/concejales-view';
import { processFiles, generateMockData } from '@/lib/data';
import { DashboardData, BaseEntity, Departamento, Municipio, Templo, NationalStats } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { RefreshCw, Upload, FileDown, Brain, Calendar, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export default function Home() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);

    // Navigation State
    const [viewStack, setViewStack] = useState<BaseEntity[]>([]);
    const [isZeroView, setIsZeroView] = useState(false);
    const [isSenadoresView, setIsSenadoresView] = useState(false);
    const [isDiputadosView, setIsDiputadosView] = useState(false);
    const [isConcejalesView, setIsConcejalesView] = useState(false);
    const [isStrategyOpen, setIsStrategyOpen] = useState(false);
    const [isTrendOpen, setIsTrendOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const syncToCloud = async (state: DashboardData) => {
        try {
            await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(state)
            });
            console.log("Cloud sync successful");
        } catch (e) {
            console.error("Auto-sync to cloud failed", e);
        }
    };

    const healData = (result: DashboardData) => {
        // Healing: Ensure national coverage is always 485
        if (result.national) result.national.templosCount = 485;

        // Healing: Fix Bogota if it's 0 or inconsistent
        const bogota = result.departamentos.find(d => d.name.toUpperCase().includes('BOGOT'));
        if (bogota) {
            const hasChildren = bogota.children && bogota.children.length > 0;

            if (hasChildren) {
                const totalRef = bogota.children!.reduce((acc, c) => acc + (c.referidos || 0), 0);
                const totalMeta = bogota.children!.reduce((acc, c) => acc + (c.meta || 0), 0);

                // If row in Excel 1 was empty or significantly lower than children sum, sync it
                if (!bogota.referidos || bogota.referidos < totalRef) {
                    bogota.referidos = totalRef;
                }
                if (!bogota.meta || (bogota.meta === 23 && totalMeta > 23)) {
                    bogota.meta = totalMeta;
                }

                // Recalculate progress
                if (bogota.meta > 0) {
                    bogota.avance100 = (bogota.referidos / bogota.meta) * 100;
                    bogota.avance65 = Math.min((bogota.referidos / (bogota.meta * 0.65)) * 100, 100);
                    bogota.avance30 = Math.min((bogota.referidos / (bogota.meta * 0.3)) * 100, 100);
                }

                if (!bogota.templosCount || bogota.templosCount === 0) {
                    bogota.templosCount = bogota.children!.length;
                }
            }
        }
        return result;
    };

    const loadData = async () => {
        setSyncing(true);
        let cloudData: DashboardData | null = null;
        let localData: DashboardData | null = null;

        // 1. Try Fetching from Cloud
        try {
            const response = await fetch('/api/data');
            if (response.ok) {
                cloudData = await response.json();
            }
        } catch (e) {
            console.warn("Cloud fetch failed", e);
        }

        // 2. Load from Local Storage
        const saved = localStorage.getItem('dashboard_data');
        if (saved) {
            try {
                localData = JSON.parse(saved);
            } catch (e) {
                console.error("Local data parse failed", e);
            }
        }

        // 3. Conflict Resolution (Newest date wins)
        if (cloudData && localData) {
            // Heal both just in case
            healData(cloudData);
            healData(localData);

            const cloudDate = new Date(cloudData.lastUpdated || 0).getTime();
            const localDate = new Date(localData.lastUpdated || 0).getTime();

            if (cloudDate > localDate) {
                // Cloud is newer: Update local
                setData(cloudData);
                localStorage.setItem('dashboard_data', JSON.stringify(cloudData));
            } else if (localDate > cloudDate) {
                // Local is newer: Sync to cloud
                setData(localData);
                await syncToCloud(localData);
            } else {
                // They are equal
                setData(cloudData);
            }
        } else if (cloudData) {
            // Only cloud has data
            healData(cloudData);
            setData(cloudData);
            localStorage.setItem('dashboard_data', JSON.stringify(cloudData));
        } else if (localData) {
            // Only local has data (Colleague's case): Sync to cloud!
            healData(localData);
            setData(localData);
            await syncToCloud(localData);
        }

        setSyncing(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const emptyNational: NationalStats = { name: "Nacional", type: 'nacional', meta: 0, referidos: 0, avance30: 0, avance65: 0, avance100: 0, templosCount: 484 };
    const currentEntity = viewStack.length > 0 ? viewStack[viewStack.length - 1] : (data?.national || emptyNational);

    const handleProcess = async (files: File[]) => {
        setLoading(true);
        try {
            const [f1, f2, f3] = files;
            const result = await processFiles(f1, f2, f3);

            // Healing: Ensure national and Bogota metrics are correct
            healData(result);

            // Save to State
            setData(result);

            // Save to Local Storage (Fast fallback)
            localStorage.setItem('dashboard_data', JSON.stringify(result));

            // Save to Cloud Sync (Shared)
            await syncToCloud(result);

        } catch (e) {
            console.error(e);
            alert("Error procesando archivos.");
        }
        setLoading(false);
    };



    const handleBack = () => {
        if (viewStack.length > 0) {
            const newStack = [...viewStack];
            newStack.pop();
            setViewStack(newStack);
        }
    };

    const handleDrillDown = (item: any) => {
        setIsZeroView(false); // Reset if navigating from zero view
        if (!item || item.type === 'templo' || item.type === 'municipio') return;
        setViewStack([...viewStack, item]);
    };

    // Determine what list to show in the table
    let tableData: any[] = [];
    let levelName = "";

    if (data) {
        if (viewStack.length === 0) {
            tableData = data.departamentos;
            levelName = "Departamento";
        } else {
            const current = viewStack[viewStack.length - 1];
            if (current.type === 'departamento') {
                const dept = data.departamentos.find((d: Departamento) => d.name === current.name);
                if (dept) {
                    if (dept.name.toUpperCase().includes('BOGOT')) {
                        levelName = "Localidad/Templo";
                        // Special handling for Bogotá: Use Localidades (children) if present, otherwise List all Templos directly
                        if (dept.children && dept.children.length > 0) {
                            tableData = dept.children;
                        } else {
                            // Fallback: Show all templos in Bogotá directly if no sub-localities found
                            tableData = data.templos;
                        }
                    } else {
                        levelName = "Municipio";
                        tableData = dept.children || [];
                    }
                }
            } else if (current.type === 'municipio') {
                const muni = data.municipios.find((m: Municipio) => m.name === current.name);
                if (muni) {
                    tableData = muni.children || data.templos.filter((t: Templo) => t.localidad === muni.name);
                    levelName = "Templo";
                }
            }
        }
    } else {
        // Empty state table? Or hidden?
        levelName = "Departamento"; // Default header
    }

    // Breadcrumbs
    const breadcrumbs = isZeroView
        ? ["Nacional", "Cero Referidos"]
        : isSenadoresView
            ? ["Senadores"]
            : isDiputadosView
                ? ["Diputados"]
                : isConcejalesView
                    ? ["Concejales"]
                    : ["Nacional", ...viewStack.map(v => v.name)];

    // Determine ranking chart title
    const rankingChartTitle = viewStack.length === 0
        ? "Ranking Departamental"
        : (levelName === 'Localidad/Templo' ? "Ranking Localidad/Templo" : `Ranking ${levelName}s`);

    // Zero Stats
    const totalReferidos = (data?.departamentos || []).reduce((acc: number, d: Departamento) => acc + (d.referidos || 0), 0);
    const depsZero = data?.departamentos.filter((d: Departamento) => (d.referidos || 0) === 0) || [];
    const munisZero = data?.municipios.filter((m: Municipio) => (m.referidos || 0) === 0) || [];
    const templosZero = data?.templos?.filter((t: Templo) => (t.referidos || 0) === 0) || [];


    return (
        <DashboardShell>
            <Header
                breadcrumbs={breadcrumbs}
                onBack={(viewStack.length > 0 || isZeroView || isSenadoresView || isDiputadosView || isConcejalesView) ? () => {
                    if (isZeroView) setIsZeroView(false);
                    else if (isSenadoresView) setIsSenadoresView(false);
                    else if (isDiputadosView) setIsDiputadosView(false);
                    else if (isConcejalesView) setIsConcejalesView(false);
                    else handleBack();
                } : undefined}
            >
                <div className="flex gap-3 items-center">
                    {syncing && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={loadData}
                        disabled={syncing}
                        title="Actualizar datos desde la nube"
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsCalendarOpen(true)}
                        title="Ver Cronograma"
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <Calendar className="h-5 w-5" />
                    </Button>

                    {data && <ReportsButton data={data} title={currentEntity.name || 'Nacional'} />}

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="gap-2 font-bold px-6 bg-[#f59e0b] hover:bg-[#d97706] text-white border-none shadow-lg">
                                <Upload className="w-4 h-4" />
                                Cargar Datos
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl bg-background border-muted shadow-2xl">
                            <UploadDialog onProcess={(files) => {
                                handleProcess(files);
                            }} />
                        </DialogContent>
                    </Dialog>
                </div>
            </Header>

            <main className="container py-6 space-y-8 animate-in fade-in duration-500">

                {/* KPI Section */}
                {!isZeroView && !isSenadoresView && !isDiputadosView && !isConcejalesView && (
                    <section>
                        <KPIGrid stats={currentEntity} />
                    </section>
                )}

                {/* Visualizations Section */}
                {viewStack.length === 0 && !isZeroView && !isSenadoresView && !isDiputadosView && !isConcejalesView && (
                    <section className="grid gap-6 lg:grid-cols-2">
                        <Scoreboard
                            main={{
                                name: "Nacional",
                                score30: currentEntity.avance30,
                                score65: currentEntity.avance65,
                                score100: currentEntity.avance100,
                                missing30: Math.max(0, Math.ceil(currentEntity.meta * 0.3) - currentEntity.referidos),
                                missing65: Math.max(0, Math.ceil(currentEntity.meta * 0.65) - currentEntity.referidos),
                                missing100: Math.max(0, currentEntity.meta - currentEntity.referidos),
                                target30: Math.ceil(currentEntity.meta * 0.3),
                                target65: Math.ceil(currentEntity.meta * 0.65),
                                target100: currentEntity.meta
                            }}
                            zeroStats={{
                                deps: depsZero.length,
                                munis: munisZero.length,
                                metaDeps: depsZero.reduce((acc: number, d: Departamento) => acc + (d.meta || 0), 0),
                                metaMunis: munisZero.reduce((acc: number, m: Municipio) => acc + (m.meta || 0), 0)
                            }}
                            onViewZero={() => setIsZeroView(true)}
                            onViewSenadores={() => setIsSenadoresView(true)}
                            senadoresActionElement={
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 gap-1"
                                        >
                                            Senadores <ChevronDown className="h-3 w-3" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                        <DropdownMenuItem onClick={() => { setIsSenadoresView(true); setIsDiputadosView(false); setIsConcejalesView(false); }}>
                                            Senadores
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => { setIsDiputadosView(true); setIsSenadoresView(false); setIsConcejalesView(false); }}>
                                            Diputados
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => { setIsConcejalesView(true); setIsSenadoresView(false); setIsDiputadosView(false); }}>
                                            Concejales
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            }
                            onViewStrategy={() => setIsStrategyOpen(true)}
                            onViewTrend={() => setIsTrendOpen(true)}
                        />
                        <RankingChart data={data?.departamentos || []} title={rankingChartTitle} />
                    </section>
                )}

                {isZeroView && (
                    <section className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
                        <KPIGrid
                            isZeroView={true}
                            stats={{
                                name: "Cero Referidos",
                                meta: munisZero.reduce((acc: number, m: Municipio) => acc + (m.meta || 0), 0),
                                referidos: 0,
                                avance100: 0,
                                zeroMuniCount: munisZero.length,
                                totalNationalMeta: (data?.departamentos || []).reduce((acc: number, d: Departamento) => acc + (d.meta || 0), 0)
                            }}
                        />
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold tracking-tight text-red-500 flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                Departamentos con Cero Referidos
                            </h2>
                            <DataTable
                                key="zero-deps"
                                data={depsZero}
                                levelName="Departamento"
                                onRowClick={handleDrillDown}
                            />
                        </div>

                        <div className="space-y-4 pt-8 border-t border-muted/20">
                            <h2 className="text-2xl font-bold tracking-tight text-red-500 flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                Municipios con Cero Referidos
                            </h2>
                            <DataTable
                                key="zero-munis"
                                data={munisZero}
                                levelName="Municipio"
                                onRowClick={handleDrillDown}
                            />
                        </div>
                    </section>
                )}

                {viewStack.length > 0 && currentEntity && !isZeroView && !isSenadoresView && !isDiputadosView && !isConcejalesView && (
                    <section className="grid gap-6 lg:grid-cols-1">
                        <RankingChart
                            data={tableData}
                            title={rankingChartTitle}
                        />
                    </section>
                )}

                {/* Data Table Section */}
                {isSenadoresView && data && (
                    <SenadoresView data={data} />
                )}
                {isDiputadosView && data && (
                    <DiputadosView data={data.departamentos} />
                )}

                {isConcejalesView && data && (
                    <ConcejalesView data={data} />
                )}

                {!isZeroView && !isSenadoresView && !isDiputadosView && !isConcejalesView && data && (<section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold tracking-tight">Detalle por {levelName}</h2>
                    </div>
                    {data ? (
                        <DataTable
                            key={levelName}
                            data={tableData}
                            levelName={levelName}
                            onRowClick={handleDrillDown}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 border rounded-lg border-dashed bg-muted/5">
                            <p className="text-muted-foreground mb-4">No hay datos cargados</p>
                        </div>
                    )}
                </section>
                )}

            </main>

            <StrategyModal
                isOpen={isStrategyOpen}
                onClose={() => setIsStrategyOpen(false)}
                zeroMunisCount={munisZero.length}
            />

            <TrendModal
                isOpen={isTrendOpen}
                onClose={() => setIsTrendOpen(false)}
                metaTotal={data?.departamentos.reduce((acc, dep) => acc + (dep.meta || 0), 0) || 0}
            />

            <CalendarModal
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
            />
        </DashboardShell>
    );
}
