"use client";

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

interface LoginScreenProps {
    onAuthenticate: () => void;
}

export function LoginScreen({ onAuthenticate }: LoginScreenProps) {
    const [password, setPassword] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('remembered_password') || '';
        }
        return '';
    });
    const [rememberMe, setRememberMe] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('remember_me') === 'true';
        }
        return false;
    });
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(false);

        // Simple delay for "realistic" feel
        setTimeout(async () => {
            if (password === 'dniavancemos2025') {
                try {
                    await fetch('/api/auth/unlock', { method: 'POST' });
                } catch (e) {
                    console.error("Unlock failed", e);
                }

                if (rememberMe) {
                    localStorage.setItem('remembered_password', password);
                    localStorage.setItem('remember_me', 'true');
                } else {
                    localStorage.removeItem('remembered_password');
                    localStorage.setItem('remember_me', 'false');
                }

                localStorage.setItem('dashboard_auth', 'true');
                onAuthenticate();
            } else {
                setError(true);
                setIsLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden">
            {/* Animated Background Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

            <Card className="w-full max-w-[400px] border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl relative z-10 mx-4">
                <CardContent className="pt-8 pb-10 px-8 flex flex-col items-center">
                    <div className="mb-10 flex justify-center">
                        <img
                            src="/avancemos-logo.png"
                            alt="Avancemos por la Libertad Religiosa"
                            className="w-full max-w-[280px] h-auto drop-shadow-2xl"
                        />
                    </div>

                    <form onSubmit={handleSubmit} className="w-full space-y-4">
                        <div className="relative">
                            <Input
                                type="password"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={cn(
                                    "bg-white/5 border-white/10 text-white placeholder:text-slate-500 h-12 focus:ring-blue-500/50 transition-all",
                                    error && "border-red-500/50 focus:ring-red-500/50"
                                )}
                                autoFocus
                            />
                            {error && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                                    <ShieldAlert className="w-5 h-5" />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-2 px-1">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-500/50 transition-all cursor-pointer"
                            />
                            <label htmlFor="remember" className="text-xs text-slate-400 cursor-pointer hover:text-slate-300 transition-colors">
                                Recordar contraseña
                            </label>
                        </div>

                        {error && (
                            <p className="text-red-400 text-xs text-center animate-bounce">
                                Contraseña incorrecta. Por favor intenta de nuevo.
                            </p>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading || !password}
                            className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Ingresar"
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 flex items-center gap-2 text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em]">
                        <CheckCircle2 className="w-3 h-3 text-blue-500/50" />
                        Delegación Nacional Ideológica
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
