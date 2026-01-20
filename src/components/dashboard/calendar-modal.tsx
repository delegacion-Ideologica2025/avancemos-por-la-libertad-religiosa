import React from 'react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Image from 'next/image';

interface CalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CalendarModal({ isOpen, onClose }: CalendarModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl bg-background border-muted shadow-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="relative w-full h-auto aspect-[16/9] shrink-0">
                    <Image
                        src="/cronograma.png"
                        alt="Cronograma de Ejecución"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
                <div className="p-6 overflow-y-auto space-y-6 bg-muted/5">
                    <h3 className="text-xl font-bold mb-4">Detalle de Fases</h3>

                    <div className="grid md:grid-cols-2 gap-6 text-sm">
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-bold text-[#f59e0b] mb-1">Fase 1: Equipo Delegación Ideologica</h4>
                                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                    <li>Socialización Herramientas 32 Dptos</li>
                                    <li>Lectura de Indicadores DI Departamentales.</li>
                                    <li>Reuniones con enlaces de LR.</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold text-[#1e3a8a] mb-1">Fase 2: Gestión Política</h4>
                                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                    <li>Capacitación Candidatos Cámara</li>
                                    <li>Socialización Diputados</li>
                                    <li>Llamadas Diputados y Concejales - Departamentos y Municipios por debajo del 60% de cada corte.</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold text-[#2563eb] mb-1">Fase 3: Estrategia Electoral</h4>
                                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                    <li>Socialización Pedagogos y Testigos.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="font-bold text-[#e879f9] mb-1">Fase 4: Plan de Choque</h4>
                                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                    <li>Reuniones con municipios 0%.</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold text-[#fecdd3] mb-1">Fase 5: Día D y Cierre</h4>
                                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                    <li>Logística y Acreditación Pedagogos</li>
                                    <li>Operación Día D (8 de marzo)</li>
                                    <li>Estrategia de gratitud y balance</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
