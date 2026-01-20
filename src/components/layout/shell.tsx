"use client";

import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {children}
            <footer className="mt-auto border-t py-6 px-8 text-center text-xs text-muted-foreground uppercase tracking-widest bg-card/30">
                © 2026 Partido MIRA - Avancemos por la Libertad Religiosa. Todos los derechos reservados.
            </footer>
        </div>
    );
}

export function Header({
    breadcrumbs,
    onBack,
    children
}: {
    breadcrumbs: string[],
    onBack?: () => void,
    children?: React.ReactNode
}) {
    const currentPath = breadcrumbs[breadcrumbs.length - 1] || 'Nacional';

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/60">
            <div className="container flex h-20 items-center justify-between px-4 md:px-8 max-w-[1400px] mx-auto">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <Button
                            variant="ghost"
                            onClick={onBack}
                            size="icon"
                            className="mr-2 text-muted-foreground hover:text-foreground hover:bg-muted/20"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                    )}
                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="h-12 w-auto cursor-pointer"
                        onClick={() => window.location.reload()}
                    />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-none mb-1">
                            {currentPath}
                        </span>
                        <h1 className="text-xl font-bold tracking-tight text-foreground leading-none">
                            Avancemos por la Libertad Religiosa
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {children}
                </div>
            </div>
        </header>
    );
}
