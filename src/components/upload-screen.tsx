"use client";

import React, { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
    label: string;
    description: string;
    file: File | null;
    onFileSelect: (f: File) => void;
}

function FileZone({ label, description, file, onFileSelect }: FileUploaderProps) {
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    }, [onFileSelect]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div
            className={cn(
                "relative flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed transition-colors",
                dragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-primary/50",
                file ? "border-green-500/50 bg-green-500/5" : ""
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleChange}
                accept=".xlsx, .xls"
            />

            {file ? (
                <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle className="w-6 h-6" />
                    <div className="flex flex-col text-sm">
                        <span className="font-semibold">{file.name}</span>
                        <span className="text-xs opacity-70">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center text-center text-muted-foreground pointer-events-none">
                    <FileSpreadsheet className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs opacity-70">{description}</p>
                </div>
            )}
        </div>
    );
}

export function UploadScreen({ onProcess, onLoadMock, isDialog = false }: { onProcess: (files: File[]) => void, onLoadMock: () => void, isDialog?: boolean }) {
    const [files, setFiles] = useState<[File | null, File | null, File | null]>([null, null, null]);

    const canProcess = files.some(f => f !== null);

    const Container = isDialog ? 'div' : 'div';
    const containerClass = isDialog ? '' : 'flex items-center justify-center min-h-[80vh] container';
    const cardClass = isDialog ? 'border-0 shadow-none bg-transparent' : 'w-full max-w-4xl border-muted/50 shadow-2xl bg-card/50 backdrop-blur-3xl';

    return (
        <div className={containerClass}>
            <Card className={cardClass}>
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                        Cargar Datos
                    </CardTitle>
                    <CardDescription className="text-lg">
                        Arrastra los archivos Excel correspondientes para generar el dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-3">
                    <FileZone
                        label="1. Departamental"
                        description="Nivel Macro (Departamentos)"
                        file={files[0]}
                        onFileSelect={(f) => setFiles([f, files[1], files[2]])}
                    />
                    <FileZone
                        label="2. Municipal"
                        description="Nivel Intermedio (Municipios)"
                        file={files[1]}
                        onFileSelect={(f) => setFiles([files[0], f, files[2]])}
                    />
                    <FileZone
                        label="3. Bogotá"
                        description="Detalle Localidades/Templos"
                        file={files[2]}
                        onFileSelect={(f) => setFiles([files[0], files[1], f])}
                    />
                </CardContent>
                <CardFooter className="flex justify-end items-center bg-muted/20 p-6">
                    <Button
                        size="lg"
                        onClick={() => onProcess(files.filter(Boolean) as File[])}
                        className={cn("gap-2 transition-all", canProcess ? "animate-pulse shadow-[0_0_20px_rgba(var(--primary),0.5)]" : "opacity-50")}
                        disabled={!canProcess}
                    >
                        Procesar Archivos <ArrowRight className="w-4 h-4" />
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
