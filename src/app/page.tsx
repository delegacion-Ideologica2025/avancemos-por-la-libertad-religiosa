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
import { TerritoriesModal } from '@/components/dashboard/territories-modal';
import { CalendarModal } from '@/components/dashboard/calendar-modal';
import { DiputadosView } from '@/components/dashboard/diputados-view';
import { ConcejalesView } from '@/components/dashboard/concejales-view';
import { EnlacesView } from '@/components/dashboard/enlaces-view';
import { EdilesView } from '@/components/dashboard/ediles-view';
import { EdilesJacView } from '@/components/dashboard/ediles-jac-view';
import { CmjDcView } from '@/components/dashboard/cmj-dc-view';
import { ReferidosEvolutionModal } from '@/components/dashboard/referidos-evolution-modal';
import { TemplosEvolutionModal } from '@/components/dashboard/templos-evolution-modal';
import { LoginScreen } from '@/components/auth/login-screen';
import { processFiles, generateMockData, aggregateNodes } from '@/lib/data';
import { DashboardData, BaseEntity, Departamento, Municipio, Templo, NationalStats } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { RefreshCw, Upload, FileDown, Brain, Calendar, ChevronDown, ShieldAlert } from 'lucide-react';
import { cn, normalize } from '@/lib/utils';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export default function Home() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(false);
    const [syncing, setSyncing] = useState(false);

    // Check auth on mount and periodically
    useEffect(() => {
        const checkAuth = async () => {
            const auth = localStorage.getItem('dashboard_auth');
            if (auth !== 'true') {
                setIsAuthenticated(false);
                return;
            }

            // Immediately set to true if 'true' is in localStorage to show the UI
            if (isAuthenticated === null) setIsAuthenticated(true);

            try {
                // 1. Check Session Validity
                const res = await fetch('/api/auth/validate');
                if (!res.ok) {
                    localStorage.removeItem('dashboard_auth');
                    setIsAuthenticated(false);
                } else {
                    setIsAuthenticated(true);
                }

                // 2. Check for App Updates (Version Heartbeat)
                const vRes = await fetch('/api/version');
                if (vRes.ok) {
                    const { version: serverVersion } = await vRes.json();
                    const localVersion = localStorage.getItem('app_version');

                    if (!localVersion) {
                        localStorage.setItem('app_version', serverVersion);
                    } else if (localVersion !== serverVersion) {
                        console.log("New version detected! Reloading...");
                        localStorage.setItem('app_version', serverVersion);
                        window.location.reload();
                    }
                }
            } catch (e) {
                // On error (offline), allow access if they have the local flag
                setIsAuthenticated(true);
            }
        };

        checkAuth();

        // HEARTBEAT + INTERCEPTOR
        const interval = setInterval(checkAuth, 10000); // 10s silent check

        // Also check IMMEDIATELY if the user clicks ANYTHING (aggressive lockout)
        const handleGlobalInteraction = () => {
            checkAuth();
        };

        window.addEventListener('click', handleGlobalInteraction);

        return () => {
            clearInterval(interval);
            window.removeEventListener('click', handleGlobalInteraction);
        };
    }, []);

    // Navigation State
    const [viewStack, setViewStack] = useState<BaseEntity[]>([]);
    const [isZeroView, setIsZeroView] = useState(false);
    const [isSenadoresView, setIsSenadoresView] = useState(false);
    const [isDiputadosView, setIsDiputadosView] = useState(false);
    const [isConcejalesView, setIsConcejalesView] = useState(false);
    const [isEnlacesView, setIsEnlacesView] = useState(false);
    const [isEdilesView, setIsEdilesView] = useState(false);
    const [isEdilesJalView, setIsEdilesJalView] = useState(false);
    const [isCmjDcView, setIsCmjDcView] = useState(false);
    const [isStrategyOpen, setIsStrategyOpen] = useState(false);
    const [isTrendOpen, setIsTrendOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isTerritoriesOpen, setIsTerritoriesOpen] = useState(false);
    const [isReferidosEvolutionOpen, setIsReferidosEvolutionOpen] = useState(false);
    const [isTemplosEvolutionOpen, setIsTemplosEvolutionOpen] = useState(false);
    const [panoramaScope, setPanoramaScope] = useState<'total' | 'nacional' | 'bogota'>('total');

    // Scroll reset on navigation
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [viewStack, isZeroView, isSenadoresView, isDiputadosView, isConcejalesView, isEnlacesView, isEdilesView, isCmjDcView, panoramaScope]);



    const syncToCloud = async (state: DashboardData) => {
        try {
            const res = await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(state)
            });
            if (res.status === 401) {
                localStorage.removeItem('dashboard_auth');
                setIsAuthenticated(false);
                return;
            }
            console.log("Cloud sync successful");
        } catch (e) {
            console.error("Auto-sync to cloud failed", e);
        }
    };

    const handleUpdateJuanFelipe = (jfData: any) => {
        if (!data) return;
        const updatedData = { ...data, juanFelipeData: jfData };
        setData(updatedData);
        localStorage.setItem('dashboard_data', JSON.stringify(updatedData));
        syncToCloud(updatedData);
    };

    const handleUpdateCarolina = (cData: any) => {
        if (!data) return;
        const updatedData = { ...data, carolinaData: cData };
        setData(updatedData);
        localStorage.setItem('dashboard_data', JSON.stringify(updatedData));
        syncToCloud(updatedData);
    };

    const healData = (result: DashboardData) => {
        // 1. Process each department individually
        result.departamentos.forEach(d => {
            const isBogotaDept = d.name.toUpperCase().includes('BOGOT');

            // Recalculate active templos count from children
            if (d.children && d.children.length > 0) {
                d.templosCount = d.children.reduce((acc, c: any) => acc + (c.templosCount || 0), 0);
            } else if (result.municipios && (normalize(d.name) === 'VALLE DEL CAUCA' || normalize(d.name) === 'VALLE')) {
                // HEAL: If Valle has no children but we have municipios, re-link them
                const valleChildren = result.municipios.filter(m => {
                    const normalizedMDept = normalize(m.departamento);
                    return normalizedMDept === 'VALLE' || normalizedMDept === 'VALLE DEL CAUCA' || normalizedMDept === 'VALLE DEL CAU';
                });
                if (valleChildren.length > 0) {
                    d.children = valleChildren;
                    d.templosCount = valleChildren.reduce((acc, c: any) => acc + (c.templosCount || 0), 0);
                }
            }

            // RECOVERY: If templosTarget is missing, infer it from meta
            if (!d.templosTarget || d.templosTarget === 0) {
                if (isBogotaDept) {
                    d.templosTarget = 30;
                } else {
                    d.templosTarget = Math.round((d.meta || 0) / 23);
                }
            }

            // Fix Bogota Meta
            if (isBogotaDept && (!d.meta || d.meta < 690)) {
                d.meta = 690;
            }

            // Fix Bogota Progress Count
            if (isBogotaDept) {
                const actualBogotaActive = (result.templos || []).filter(t => t.referidos > 0).length;
                d.templosCount = actualBogotaActive;
            }

            // Recalculate advances
            if (d.meta > 0) {
                d.avance100 = (d.referidos / d.meta) * 100;
                d.avance65 = Math.min((d.referidos / (d.meta * 0.65)) * 100, 100);
                d.avance30 = Math.min((d.referidos / (d.meta * 0.3)) * 100, 100);
            }
        });

        // 2. Heavy Recovery: Ensure National Stats are the literal sum of all parts
        if (result.departamentos && result.departamentos.length > 0) {
            const totalMeta = result.departamentos.reduce((acc, d) => acc + (d.meta || 0), 0);
            const totalRef = result.departamentos.reduce((acc, d) => acc + (d.referidos || 0), 0);
            const totalTargetTemplos = result.departamentos.reduce((acc, d) => acc + (d.templosTarget || 0), 0);

            // CRITICAL: Sum ALL municipalities directly. 
            // EXCLUDE Bogota D.C. row from this sum because it's a summary and would double count.
            const totalActiveTemplos = (result.municipios || []).reduce((acc, m) => {
                const isBogotaSummary = m.name.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("BOGOTA");
                return acc + ((m.referidos > 0 && !isBogotaSummary) ? 1 : 0);
            }, 0) + (result.templos || []).filter(t => t.referidos > 0).length;

            result.national = {
                ...result.national,
                meta: totalMeta,
                referidos: totalRef,
                templosCount: totalActiveTemplos,
                templosTarget: totalTargetTemplos,
                avance100: totalMeta > 0 ? (totalRef / totalMeta) * 100 : 0,
                avance65: totalMeta > 0 ? Math.min((totalRef / (totalMeta * 0.65)) * 100, 100) : 0,
                avance30: totalMeta > 0 ? Math.min((totalRef / (totalMeta * 0.3)) * 100, 100) : 0
            };
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
            if (response.status === 401) {
                localStorage.removeItem('dashboard_auth');
                setIsAuthenticated(false);
                return;
            }
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

    const emptyNational: NationalStats = { name: "Nacional", type: 'nacional', meta: 0, referidos: 0, avance30: 0, avance65: 0, avance100: 0, templosCount: 479 };

    // Calculate stats for each panorama scope
    const scopeStats = React.useMemo(() => {
        if (!data) return null;

        // 1. Total: All data including Bogotá
        const total = data.national;

        // 2. Nacional: Everything except Bogotá
        const nonBogotaDeps = data.departamentos.filter(d => !d.name.toUpperCase().includes('BOGOT'));
        const nacionalStats = {
            meta: nonBogotaDeps.reduce((acc, d) => acc + (d.meta || 0), 0),
            referidos: nonBogotaDeps.reduce((acc, d) => acc + (d.referidos || 0), 0),
            templosCount: (data.municipios || []).filter(m => m.referidos > 0 && !m.name.toUpperCase().includes('BOGOTA')).length,
            templosTarget: nonBogotaDeps.reduce((acc, d) => acc + (d.templosTarget || 0), 0),
        };
        const nacAvance100 = nacionalStats.meta > 0 ? (nacionalStats.referidos / nacionalStats.meta) * 100 : 0;
        const nacional = {
            ...nacionalStats,
            name: 'Nacional (sin Bogotá)',
            type: 'nacional' as const,
            avance100: nacAvance100,
            avance65: nacionalStats.meta > 0 ? Math.min((nacionalStats.referidos / (nacionalStats.meta * 0.65)) * 100, 100) : 0,
            avance30: nacionalStats.meta > 0 ? Math.min((nacionalStats.referidos / (nacionalStats.meta * 0.3)) * 100, 100) : 0,
        };

        // 3. Bogotá: Only Bogotá department
        const bogotaDept = data.departamentos.find(d => d.name.toUpperCase().includes('BOGOT'));
        const bogotaStats = {
            meta: bogotaDept?.meta || 690,
            referidos: bogotaDept?.referidos || 0,
            templosCount: bogotaDept?.templosCount || 0,
            templosTarget: 30,
        };
        const bogAvance100 = bogotaStats.meta > 0 ? (bogotaStats.referidos / bogotaStats.meta) * 100 : 0;
        const bogota = {
            ...bogotaStats,
            name: 'BOGOTÁ',
            type: 'nacional' as const,
            avance100: bogAvance100,
            avance65: bogotaStats.meta > 0 ? Math.min((bogotaStats.referidos / (bogotaStats.meta * 0.65)) * 100, 100) : 0,
            avance30: bogotaStats.meta > 0 ? Math.min((bogotaStats.referidos / (bogotaStats.meta * 0.3)) * 100, 100) : 0,
        };

        // Debug logging
        console.log('=== SCOPE STATS DEBUG ===');
        console.log('Total departments:', data.departamentos.length);
        console.log('Non-Bogotá departments:', nonBogotaDeps.length);
        console.log('Total stats:', { meta: total.meta, referidos: total.referidos, templos: total.templosCount });
        console.log('Nacional stats:', { meta: nacional.meta, referidos: nacional.referidos, templos: nacional.templosCount });
        console.log('Bogotá stats:', { meta: bogota.meta, referidos: bogota.referidos, templos: bogota.templosCount });
        console.log('Sum check (Nacional + Bogotá):', {
            meta: nacional.meta + bogota.meta,
            referidos: nacional.referidos + bogota.referidos,
            templos: (nacional.templosCount || 0) + (bogota.templosCount || 0)
        });

        return { total, nacional, bogota };
    }, [data]);

    const activePanoramaStats = React.useMemo(() => {
        if (!scopeStats) return emptyNational;
        return scopeStats[panoramaScope];
    }, [scopeStats, panoramaScope]);

    const currentEntity = viewStack.length > 0 ? viewStack[viewStack.length - 1] : activePanoramaStats;

    const handleProcess = async (files: File[]) => {
        setLoading(true);
        try {
            const [f1, f2, f3] = files;
            const result = await processFiles(f1, f2, f3);

            // Healing: Ensure national and Bogota metrics are correct
            healData(result);

            // Save to Cloud Sync (Shared)
            const updatedResult = { ...result, lastUpdated: new Date().toISOString() };
            setData(updatedResult);
            localStorage.setItem('dashboard_data', JSON.stringify(updatedResult));
            await syncToCloud(updatedResult);

            // Auto-close modal
            setIsUploadOpen(false);

        } catch (e) {
            console.error(e);
            alert("Error procesando archivos.");
        }
        setLoading(false);
    };



    const handleBack = () => {
        if (isZeroView || isSenadoresView || isDiputadosView || isConcejalesView || isEnlacesView || isEdilesView || isEdilesJalView || isCmjDcView) {
            setIsZeroView(false);
            setIsSenadoresView(false);
            setIsDiputadosView(false);
            setIsConcejalesView(false);
            setIsEnlacesView(false);
            setIsEdilesView(false);
            setIsEdilesJalView(false);
            setIsCmjDcView(false);
            return;
        }
        if (viewStack.length > 0) {
            const newStack = [...viewStack];
            newStack.pop();
            setViewStack(newStack);
        }
    };

    const handleDrillDown = (item: any) => {
        setIsZeroView(false); // Reset if navigating from zero view
        setIsSenadoresView(false);
        setIsDiputadosView(false);
        setIsConcejalesView(false);
        setIsEnlacesView(false);
        setIsEdilesView(false);
        setIsEdilesJalView(false);
        setIsCmjDcView(false);
        if (!item || item.type === 'templo' || item.type === 'municipio') return;
        setViewStack([...viewStack, item]);
    };

    // Determine what list to show in the table
    let tableData: any[] = [];
    let levelName = "";

    if (data) {
        if (viewStack.length === 0) {
            // Apply panorama scope filter to table data
            if (panoramaScope === 'nacional') {
                tableData = data.departamentos.filter(d => !d.name.toUpperCase().includes('BOGOT'));
            } else if (panoramaScope === 'bogota') {
                tableData = data.departamentos.filter(d => d.name.toUpperCase().includes('BOGOT'));
            } else {
                tableData = data.departamentos;
            }
            levelName = "Departamento";
        } else {
            const current = viewStack[viewStack.length - 1];
            if (current.type === 'departamento') {
                const dept = data.departamentos.find((d: Departamento) => normalize(d.name) === normalize(current.name));
                if (dept) {
                    if (dept.name.toUpperCase().includes('BOGOT')) {
                        levelName = "Localidad/Templo";
                        // For Bogotá, we want to show all 30 localities (templos) directly
                        tableData = data.templos || [];
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
                    : isEnlacesView
                        ? ["Enlaces"]
                        : isEdilesView
                            ? ["Ediles D.C"]
                            : isCmjDcView
                                ? ["CMJ D.C"]
                                : isEdilesJalView
                                    ? ["Ediles JAL"]
                                    : ["Nacional", ...viewStack.map(v => v.name)];

    // Determine ranking chart title and data based on panorama scope
    const rankingChartTitle = React.useMemo(() => {
        if (viewStack.length === 0) {
            if (panoramaScope === 'bogota') {
                return "Ranking Localidades";
            }
            return "Ranking Departamental";
        }
        return levelName === 'Localidad/Templo' ? "Ranking Localidad/Templo" : `Ranking ${levelName}s`;
    }, [viewStack.length, panoramaScope, levelName]);

    // Get ranking chart data based on panorama scope
    const rankingChartData = React.useMemo(() => {
        if (viewStack.length === 0 && panoramaScope === 'bogota' && data) {
            // Group Bogotá templos by locality for a proper "Ranking Localidades"
            const groups = new Map<string, any>();
            data.templos.forEach(t => {
                const loc = t.localidad || 'DESCONOCIDO';
                if (!groups.has(loc)) {
                    groups.set(loc, {
                        name: loc,
                        referidos: 0,
                        meta: 0,
                        type: 'templo' // treat it as aggregate templo
                    });
                }
                const g = groups.get(loc);
                g.referidos += (t.referidos || 0);
                g.meta += (t.meta || 0);
            });

            return Array.from(groups.values()).map(g => {
                const avance100 = g.meta > 0 ? (g.referidos / g.meta) * 100 : 0;
                return {
                    ...g,
                    avance100,
                    avance65: g.meta > 0 ? Math.min((g.referidos / (g.meta * 0.65)) * 100, 100) : 0,
                    avance30: g.meta > 0 ? Math.min((g.referidos / (g.meta * 0.3)) * 100, 100) : 0,
                };
            });
        }
        return tableData;
    }, [viewStack.length, panoramaScope, data, tableData]);

    // Zero Stats - filtered by panorama scope
    const scopedDepartamentos = React.useMemo(() => {
        if (!data) return [];
        if (panoramaScope === 'nacional') {
            return data.departamentos.filter(d => !d.name.toUpperCase().includes('BOGOT'));
        } else if (panoramaScope === 'bogota') {
            return data.departamentos.filter(d => d.name.toUpperCase().includes('BOGOT'));
        }
        return data.departamentos;
    }, [data, panoramaScope]);

    const totalReferidos = scopedDepartamentos.reduce((acc: number, d: Departamento) => acc + (d.referidos || 0), 0);
    const depsZero = scopedDepartamentos.filter((d: Departamento) => (d.referidos || 0) === 0);
    const munisZero = React.useMemo(() => {
        if (!data) return [];
        if (panoramaScope === 'bogota') {
            // In Bogotá scope, "munisZero" are actually the templos (localities) with 0 referidos
            return data.templos?.filter((t: Templo) => (t.referidos || 0) === 0) || [];
        }
        if (panoramaScope === 'nacional') {
            // Simple arithmetic fix as requested: Total zeros minus Bogota zeros
            const totalZeros = data.municipios.filter((m: Municipio) => (m.referidos || 0) === 0);
            const bogotaZerosCount = data.templos?.filter((t: Templo) => (t.referidos || 0) === 0).length || 0;

            // To keep DataTable working, we filter the list
            return totalZeros.filter((m: Municipio) => !m.departamento?.toUpperCase().includes('BOGOT')).slice(0, Math.max(0, totalZeros.length - bogotaZerosCount));
        }
        return data.municipios.filter((m: Municipio) => (m.referidos || 0) === 0) || [];
    }, [data, panoramaScope]);

    const templosZero = data?.templos?.filter((t: Templo) => (t.referidos || 0) === 0) || [];


    if (isAuthenticated === null) return null; // Wait for initial check

    if (!isAuthenticated) {
        return <LoginScreen onAuthenticate={() => setIsAuthenticated(true)} />;
    }

    return (
        <DashboardShell>
            <Header
                breadcrumbs={breadcrumbs}
                onBack={(viewStack.length > 0 || isZeroView || isSenadoresView || isDiputadosView || isConcejalesView || isEnlacesView || isEdilesView || isEdilesJalView || isCmjDcView) ? () => {
                    if (isZeroView) setIsZeroView(false);
                    else if (isSenadoresView) setIsSenadoresView(false);
                    else if (isDiputadosView) setIsDiputadosView(false);
                    else if (isConcejalesView) setIsConcejalesView(false);
                    else if (isEnlacesView) setIsEnlacesView(false);
                    else if (isEdilesView) setIsEdilesView(false);
                    else if (isEdilesJalView) setIsEdilesJalView(false);
                    else if (isCmjDcView) setIsCmjDcView(false);
                    else handleBack();
                } : undefined}
            >
                <div className="flex gap-3 items-center">
                    {data?.lastUpdated && (
                        <div className="flex items-center gap-2">
                            <div className="text-[10px] font-medium text-muted-foreground text-right leading-tight hidden lg:block">
                                <div>Información actualizada el</div>
                                <div className="font-bold text-foreground text-xs">
                                    {new Date(data.lastUpdated).toLocaleString('es-CO', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                    }).replace(',', '')}
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400">
                                        <ShieldAlert className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuItem
                                        onClick={() => {
                                            localStorage.removeItem('dashboard_auth');
                                            setIsAuthenticated(false);
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <RefreshCw className="mr-2 h-4 w-4" /> Cerrar mi sesión
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={async () => {
                                            if (confirm("¿Estás seguro? Esto cerrará la sesión en TODOS los ordenadores de forma inmediata.")) {
                                                await fetch('/api/auth/lock', { method: 'POST' });
                                                localStorage.removeItem('dashboard_auth');
                                                setIsAuthenticated(false);
                                            }
                                        }}
                                        className="text-red-500 hover:text-red-600 focus:text-red-600 cursor-pointer"
                                    >
                                        <ShieldAlert className="mr-2 h-4 w-4" /> Cerrar TODO el acceso
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
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


                    <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
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
                {!isZeroView && !isSenadoresView && !isDiputadosView && !isConcejalesView && !isEnlacesView && !isEdilesView && !isEdilesJalView && !isCmjDcView && (
                    <section>
                        {/* Panorama Scope Toggle - ONLY on main screen */}
                        {viewStack.length === 0 && (
                            <div className="flex justify-center gap-2 mb-6">
                                <Button
                                    variant={panoramaScope === 'total' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setPanoramaScope('total')}
                                    className={cn(
                                        "font-bold uppercase tracking-wider transition-all",
                                        panoramaScope === 'total'
                                            ? "bg-blue-500 text-white hover:bg-blue-600"
                                            : "bg-muted/20 hover:bg-muted/30"
                                    )}
                                >
                                    Total
                                </Button>
                                <Button
                                    variant={panoramaScope === 'nacional' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setPanoramaScope('nacional')}
                                    className={cn(
                                        "font-bold uppercase tracking-wider transition-all",
                                        panoramaScope === 'nacional'
                                            ? "bg-blue-500 text-white hover:bg-blue-600"
                                            : "bg-muted/20 hover:bg-muted/30"
                                    )}
                                >
                                    Nacional
                                </Button>
                                <Button
                                    variant={panoramaScope === 'bogota' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setPanoramaScope('bogota')}
                                    className={cn(
                                        "font-bold uppercase tracking-wider transition-all",
                                        panoramaScope === 'bogota'
                                            ? "bg-blue-500 text-white hover:bg-blue-600"
                                            : "bg-muted/20 hover:bg-muted/30"
                                    )}
                                >
                                    Bogotá
                                </Button>
                            </div>
                        )}
                        <KPIGrid
                            stats={currentEntity}
                            onViewReferidosEvolution={viewStack.length === 0 ? () => setIsReferidosEvolutionOpen(true) : undefined}
                            onViewTemplosEvolution={viewStack.length === 0 ? () => setIsTemplosEvolutionOpen(true) : undefined}
                            panoramaScope={panoramaScope}
                        />
                    </section>
                )}

                {/* Visualizations Section */}
                {viewStack.length === 0 && !isZeroView && !isSenadoresView && !isDiputadosView && !isConcejalesView && !isEnlacesView && !isEdilesView && !isEdilesJalView && !isCmjDcView && (
                    <section className="grid gap-6 lg:grid-cols-2">
                        <Scoreboard
                            dynamicTitle={panoramaScope === 'bogota' ? "PANORAMA BOGOTÁ" : panoramaScope === 'total' ? "PANORAMA TOTAL" : "PANORAMA NACIONAL"}
                            dynamicZeroTitle="PANORAMA CERO REFERIDOS"
                            main={{
                                name: panoramaScope === 'bogota' ? "Bogotá" : "Nacional",
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
                                deps: panoramaScope === 'bogota' ? 0 : depsZero.length, // Don't show deps for Bogota scope
                                munis: munisZero.length,
                                metaDeps: panoramaScope === 'bogota' ? 0 : depsZero.reduce((acc: number, d: Departamento) => acc + (d.meta || 0), 0),
                                metaMunis: munisZero.reduce((acc: number, m: any) => acc + (m.meta || 0), 0)
                            }}
                            onViewZero={() => setIsZeroView(true)}
                            onViewSenadores={() => setIsSenadoresView(true)}
                            senadoresActionElement={
                                panoramaScope === 'bogota' ? (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 gap-1"
                                            >
                                                Ediles D.C <ChevronDown className="h-3 w-3" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40">
                                            <DropdownMenuItem onClick={() => { setIsEdilesView(true); setIsSenadoresView(false); setIsDiputadosView(false); setIsConcejalesView(false); setIsEnlacesView(false); setIsCmjDcView(false); }}>
                                                Ediles D.C
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => { setIsCmjDcView(true); setIsEdilesView(false); setIsSenadoresView(false); setIsDiputadosView(false); setIsConcejalesView(false); setIsEnlacesView(false); }}>
                                                CMJ D.C
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
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
                                            <DropdownMenuItem onClick={() => { setIsSenadoresView(true); setIsDiputadosView(false); setIsConcejalesView(false); setIsEnlacesView(false); }}>
                                                Senadores
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => { setIsDiputadosView(true); setIsSenadoresView(false); setIsConcejalesView(false); setIsEnlacesView(false); }}>
                                                Diputados
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => { setIsConcejalesView(true); setIsSenadoresView(false); setIsDiputadosView(false); setIsEnlacesView(false); }}>
                                                Concejales
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => { setIsEnlacesView(true); setIsSenadoresView(false); setIsDiputadosView(false); setIsConcejalesView(false); setIsEdilesView(false); setIsEdilesJalView(false); setIsCmjDcView(false); }}>
                                                Enlaces
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => { setIsEdilesJalView(true); setIsSenadoresView(false); setIsDiputadosView(false); setIsConcejalesView(false); setIsEdilesView(false); setIsEnlacesView(false); setIsCmjDcView(false); }}>
                                                Ediles JAL
                                            </DropdownMenuItem>
                                            {panoramaScope !== 'nacional' && (
                                                <>
                                                    <DropdownMenuItem onClick={() => { setIsEdilesView(true); setIsSenadoresView(false); setIsDiputadosView(false); setIsConcejalesView(false); setIsEnlacesView(false); setIsCmjDcView(false); }}>
                                                        Ediles D.C
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => { setIsCmjDcView(true); setIsEdilesView(false); setIsSenadoresView(false); setIsDiputadosView(false); setIsConcejalesView(false); setIsEnlacesView(false); }}>
                                                        CMJ D.C
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )
                            }
                            onViewStrategy={panoramaScope === 'total' ? () => setIsStrategyOpen(true) : undefined}
                            onViewTrend={() => setIsTrendOpen(true)}
                        />
                        <RankingChart data={rankingChartData} title={rankingChartTitle} />
                    </section>
                )}

                {isZeroView && (
                    <section className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
                        <KPIGrid
                            isZeroView={true}
                            onViewEvolucion={() => setIsTerritoriesOpen(true)}
                            panoramaScope={panoramaScope}
                            stats={{
                                name: panoramaScope === 'bogota' ? "Cero Referidos (Bogotá)" : "Cero Referidos",
                                meta: munisZero.reduce((acc: number, m: any) => acc + (m.meta || 0), 0),
                                referidos: 0,
                                avance100: 0,
                                zeroMuniCount: munisZero.length,
                                totalNationalMeta: activePanoramaStats.meta
                            }}
                        />
                        {panoramaScope !== 'bogota' && (
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
                        )}

                        <div className="space-y-4 pt-8 border-t border-muted/20">
                            <h2 className="text-2xl font-bold tracking-tight text-red-500 flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                {panoramaScope === 'bogota' ? "Localidades con Cero Referidos" : "Municipios con Cero Referidos"}
                            </h2>
                            <DataTable
                                key="zero-munis"
                                data={munisZero}
                                levelName={panoramaScope === 'bogota' ? "Localidad" : "Municipio"}
                                onRowClick={handleDrillDown}
                                showDepartamento={panoramaScope !== 'bogota'}
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
                    <DiputadosView data={data} panoramaScope={panoramaScope} />
                )}

                {isConcejalesView && data && (
                    <ConcejalesView data={data} panoramaScope={panoramaScope} />
                )}
                {isEnlacesView && data && (
                    <EnlacesView data={data} />
                )}
                {isEdilesView && data && (
                    <EdilesView data={data} />
                )}

                {!isZeroView && !isSenadoresView && !isDiputadosView && !isConcejalesView && !isEnlacesView && !isEdilesView && !isEdilesJalView && !isCmjDcView && data && (<section className="space-y-4">
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

                {isEdilesJalView && data && (
                    <section className="animate-in slide-in-from-bottom-4 duration-500">
                        <EdilesJacView data={data} />
                    </section>
                )}

                {isCmjDcView && data && (
                    <section className="animate-in slide-in-from-bottom-4 duration-500">
                        <CmjDcView data={data} />
                    </section>
                )}
            </main>

            <StrategyModal
                isOpen={isStrategyOpen}
                onClose={() => setIsStrategyOpen(false)}
                zeroMunisCount={munisZero.length}
                juanFelipeData={data?.juanFelipeData}
                onUpdateJuanFelipe={handleUpdateJuanFelipe}
                carolinaData={data?.carolinaData}
                onUpdateCarolina={handleUpdateCarolina}
            />

            <TrendModal
                isOpen={isTrendOpen}
                onClose={() => setIsTrendOpen(false)}
                metaTotal={activePanoramaStats.meta}
                currentReferidos={activePanoramaStats.referidos}
                isBogota={panoramaScope === 'bogota'}
            />

            <CalendarModal
                isOpen={isCalendarOpen}
                onClose={() => setIsCalendarOpen(false)}
            />

            <TerritoriesModal
                isOpen={isTerritoriesOpen}
                onClose={() => setIsTerritoriesOpen(false)}
                munisZeroCount={munisZero.length}
                panoramaScope={panoramaScope}
            />

            <ReferidosEvolutionModal
                isOpen={isReferidosEvolutionOpen}
                onClose={() => setIsReferidosEvolutionOpen(false)}
                currentReferidos={activePanoramaStats.referidos}
                panoramaScope={panoramaScope}
            />

            <TemplosEvolutionModal
                isOpen={isTemplosEvolutionOpen}
                onClose={() => setIsTemplosEvolutionOpen(false)}
                currentTemplos={Number(activePanoramaStats.templosCount) || 0}
                panoramaScope={panoramaScope}
            />
        </DashboardShell>
    );
}
