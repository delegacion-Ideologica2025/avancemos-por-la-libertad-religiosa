"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileUp, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadDialogProps {
    onProcess: (files: File[]) => void;
}

export function UploadDialog({ onProcess }: UploadDialogProps) {
    const [files, setFiles] = useState<(File | null)[]>([null, null, null]);
    const labels = ["Excel 1: Departamental", "Excel 2: Municipal", "Excel 3: Bogotá"];

    const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        const newFiles = [...files];
        newFiles[index] = file;
        setFiles(newFiles);
    };

    const isReady = files[0] && files[1] && files[2];

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
            <Card className="w-full max-w-2xl p-8 border-dashed border-2 bg-card/30">
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="p-4 bg-emerald-500/10 rounded-full">
                        <Upload className="w-12 h-12 text-emerald-500" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tighter uppercase italic">Cargar Datos de Metas</h2>
                        <p className="text-muted-foreground mt-2">Sube los tres archivos Excel requeridos para generar el informe nacional.</p>
                    </div>

                    <div className="grid w-full gap-4 mt-8">
                        {labels.map((label, idx) => (
                            <div key={idx} className="relative group">
                                <label className={cn(
                                    "flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer bg-muted/10",
                                    files[idx] ? "border-emerald-500/50 bg-emerald-500/5" : "border-muted group-hover:border-muted-foreground/30"
                                )}>
                                    <div className="flex items-center gap-3">
                                        <FileUp className={cn("w-5 h-5", files[idx] ? "text-emerald-500" : "text-muted-foreground")} />
                                        <span className="text-sm font-bold uppercase tracking-widest">{label}</span>
                                    </div>
                                    <span className="text-xs font-mono max-w-[200px] truncate opacity-60">
                                        {files[idx]?.name || "Seleccionar archivo..."}
                                    </span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".xlsx,.xls"
                                        onChange={(e) => handleFileChange(idx, e)}
                                    />
                                </label>
                                {files[idx] && (
                                    <button
                                        className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                                        onClick={() => {
                                            const nf = [...files];
                                            nf[idx] = null;
                                            setFiles(nf);
                                        }}
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <Button
                        size="lg"
                        disabled={!isReady}
                        className="w-full h-14 text-lg font-black tracking-widest uppercase italic bg-emerald-500 hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20"
                        onClick={() => onProcess(files as File[])}
                    >
                        Procesar Informe
                    </Button>
                </div>
            </Card>
        </div>
    );
}
