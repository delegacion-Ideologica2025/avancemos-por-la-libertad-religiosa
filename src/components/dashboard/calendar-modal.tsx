import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from 'next/image';

interface CalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CalendarModal({ isOpen, onClose }: CalendarModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl bg-slate-950 border-slate-800 shadow-2xl p-0 overflow-hidden flex flex-col max-h-[95vh] ring-1 ring-slate-800">
                <DialogHeader className="bg-slate-900 p-6 border-b border-slate-800 shrink-0">
                    <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic text-slate-100">Cronograma de Ejecución Estratégica</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto bg-slate-950 p-4">
                    <div className="flex flex-col items-center space-y-8">
                        {/* Image Container */}
                        <div className="relative w-full max-w-5xl bg-slate-950 rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/5 p-1">
                            <Image
                                src="/cronograma.png"
                                alt="Cronograma de ejecución"
                                width={1200}
                                height={675}
                                className="w-full h-auto object-cover"
                                priority
                                unoptimized
                                quality={100}
                            />
                        </div>

                        {/* Phase Details */}
                        <div className="w-full max-w-5xl px-4 pb-12">
                            <div className="grid md:grid-cols-2 gap-10 text-sm">
                                {/* Column 1 */}
                                <div className="space-y-8">
                                    <div className="group">
                                        <h4 className="font-bold text-[#fbc02d] mb-3 uppercase flex items-center gap-2 text-base tracking-tight">
                                            <span className="w-3 h-3 rounded-full bg-[#fbc02d] shadow-[0_0_10px_rgba(251,192,45,0.5)]" />
                                            Fase 1: Equipo Delegación Ideológica
                                        </h4>
                                        <ul className="list-disc pl-6 space-y-2 text-slate-400 font-medium leading-relaxed">
                                            <li>Socialización Herramientas 32 Dptos.</li>
                                            <li>Lectura de Indicadores DI Departamentales.</li>
                                            <li>Reuniones con enlaces de LR.</li>
                                        </ul>
                                    </div>
                                    <div className="group">
                                        <h4 className="font-bold text-[#1e40af] mb-3 uppercase flex items-center gap-2 text-base tracking-tight">
                                            <span className="w-3 h-3 rounded-full bg-[#1e40af] shadow-[0_0_10px_rgba(30,64,175,0.5)]" />
                                            Fase 2: Gestión Política
                                        </h4>
                                        <ul className="list-disc pl-6 space-y-2 text-slate-400 font-medium leading-relaxed">
                                            <li>Capacitación Candidatos Cámara.</li>
                                            <li>Socialización Diputados.</li>
                                            <li>Llamadas Diputados y Concejales - Departamentos y Municipios por debajo del 60% de cada corte.</li>
                                        </ul>
                                    </div>
                                    <div className="group">
                                        <h4 className="font-bold text-[#3b82f6] mb-3 uppercase flex items-center gap-2 text-base tracking-tight">
                                            <span className="w-3 h-3 rounded-full bg-[#3b82f6] shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                            Fase 4: Plan de Choque
                                        </h4>
                                        <ul className="list-disc pl-6 space-y-2 text-slate-400 font-medium leading-relaxed">
                                            <li>Plan Homologos. y MMM</li>
                                            <li>Llamadas 0% Referidos</li>
                                            <li>Cronogramas de Trabajo DP y Mpio.</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Column 2 */}
                                <div className="space-y-8">
                                    <div className="group">
                                        <h4 className="font-bold text-[#d946ef] mb-3 uppercase flex items-center gap-2 text-base tracking-tight">
                                            <span className="w-3 h-3 rounded-full bg-[#d946ef] shadow-[0_0_10px_rgba(217,70,239,0.5)]" />
                                            Fase 3: Estrategia Electoral
                                        </h4>
                                        <ul className="list-disc pl-6 space-y-2 text-slate-400 font-medium leading-relaxed">
                                            <li>Socialización Pedagogos y Testigos.</li>
                                            <li>Plan de movilización regional.</li>
                                        </ul>
                                    </div>
                                    <div className="group">
                                        <h4 className="font-bold text-[#f43f5e] mb-3 uppercase flex items-center gap-2 text-base tracking-tight">
                                            <span className="w-3 h-3 rounded-full bg-[#f43f5e] shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                                            Fase 5: Día D y Cierre
                                        </h4>
                                        <ul className="list-disc pl-6 space-y-2 text-slate-400 font-medium leading-relaxed">
                                            <li>Logística y Acreditación Pedagogos</li>
                                            <li>Operación Día D (8 de marzo).</li>
                                            <li>Estrategia de gratitud y balance final.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
