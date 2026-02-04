"use client";

import React from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Map, MapPin, Building2, Brain } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { isRedEnabled } from "@/lib/utils-dates";
import { DashboardData } from "@/lib/types";
import { normalize } from "@/lib/utils";

import { EDILES_DC_LIST, LOCALIDAD_TO_LOCALIDAD_MAYOR } from "@/lib/constants";

interface ReportsButtonProps {
    data: DashboardData;
    title: string;
}

export function ReportsButton({ data, title }: ReportsButtonProps) {
    const formatDateTime = () => {
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yyyy = now.getFullYear();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        return `${dd}/${mm}/${yyyy} ${hours}:${minutes} ${ampm}`;
    };

    const getCellColor = (value: number, columnType: '30' | '65' | '100'): [number, number, number] | null => {
        if (value >= 100) return [67, 160, 71]; // #43a047 (Verde)
        if (value >= 65) return [253, 216, 53]; // #fdd835 (Amarillo)
        if (value >= 30) return [251, 140, 0];  // #fb8c00 (Naranja)

        if (columnType === '100') {
            if (!isRedEnabled()) return null;
        }

        return [229, 57, 53]; // #e53935 (Rojo)
    };

    const generatePdf = (type: 'Departamental' | 'Municipal' | 'Ediles') => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        let mainTitle = "";
        if (type === 'Departamental') {
            mainTitle = "INFORME DE GESTIÓN DEPARTAMENTAL: AVANCEMOS POR LA";
        } else if (type === 'Municipal') {
            mainTitle = "INFORME DE GESTIÓN MUNICIPAL: AVANCEMOS POR LA";
        } else {
            mainTitle = "INFORME DE GESTIÓN EDILES D.C: AVANCEMOS POR LA";
        }
        const subTitle = "LIBERTAD RELIGIOSA";

        doc.setFont("times", "bold");
        doc.setFontSize(14);
        doc.text(mainTitle, pageWidth / 2, 15, { align: 'center' });
        doc.text(subTitle, pageWidth / 2, 22, { align: 'center' });

        let headers: any[][] = [];
        const commonHeaders = ['LOCALIDAD', 'REPORTANDO', 'REFERIDOS\nCARGADOS', 'OBJETIVO', 'AVANCE 30%\n15 Enero', 'AVANCE 65%\n7 Febrero', 'AVANCE 100%\n28 Febrero'];

        if (type === 'Departamental') {
            headers = [['DEPARTAMENTO', 'REPORTANDO', 'REFERIDOS\nCARGADOS', 'OBJETIVO', 'AVANCE 30%\n15 Enero', 'AVANCE 65%\n7 Febrero', 'AVANCE 100%\n28 Febrero']];
        } else if (type === 'Municipal') {
            headers = [['DEPARTAMENTO', 'MUNICIPIO', 'REPORTANDO', 'REFERIDOS\nCARGADOS', 'OBJETIVO', 'AVANCE 30%\n15 Enero', 'AVANCE 65%\n7 Febrero', 'AVANCE 100%\n28 Febrero']];
        } else {
            headers = [commonHeaders];
        }

        const colWidths = type === 'Ediles'
            ? [33, 46, 22, 18, 23, 23, 24]
            : type === 'Municipal'
                ? [24, 26, 39, 22, 18, 21, 20, 20]
                : [36, 25, 25, 20, 28, 28, 28];

        if (type === 'Ediles') {
            const EDILES_REMAINING_LIST = ['USME', 'TUNJUELITO', 'PUENTE ARANDA', 'ANTONIO NARIÑO', 'CIUDAD BOLÍVAR', 'TEUSAQUILLO', 'CHAPINERO'];

            const getEdilData = (filterList: string[]) => {
                const normFilters = filterList.map(f => normalize(f));
                return [...data.templos]
                    .filter(t => {
                        const tLoc = normalize(t.localidad || '');
                        const tMayor = t.localidadMayor ? normalize(t.localidadMayor) : '';

                        // 1. Check direct locality mayor match
                        if (normFilters.includes(tMayor)) return true;

                        // 2. Check manual mapping match
                        return Object.entries(LOCALIDAD_TO_LOCALIDAD_MAYOR).some(([excelLoc, major]) =>
                            normFilters.includes(normalize(major)) && normalize(excelLoc) === tLoc
                        );
                    })
                    .sort((a, b) => {
                        const getMayorForSort = (t: any) => {
                            const tLoc = normalize(t.localidad || '');
                            const tMayor = t.localidadMayor ? normalize(t.localidadMayor) : '';

                            const mapping = Object.entries(LOCALIDAD_TO_LOCALIDAD_MAYOR).find(([ex, maj]) =>
                                normalize(ex) === tLoc && normFilters.includes(normalize(maj))
                            );
                            if (mapping) return mapping[1];

                            const found = filterList.find(off => normalize(off) === tMayor);
                            return found || 'Z-OTROS';
                        };
                        const locCompare = getMayorForSort(a).localeCompare(getMayorForSort(b));
                        if (locCompare !== 0) return locCompare;
                        return a.name.localeCompare(b.name);
                    })
                    .map(t => {
                        const getOfficialName = (t: any) => {
                            const tLoc = normalize(t.localidad || '');
                            const tMayor = t.localidadMayor ? normalize(t.localidadMayor) : '';

                            // PRIORITIZE manual mapping
                            const mapping = Object.entries(LOCALIDAD_TO_LOCALIDAD_MAYOR).find(([ex, maj]) =>
                                normalize(ex) === tLoc && normFilters.includes(normalize(maj))
                            );
                            if (mapping) return mapping[1];

                            const foundOfficial = filterList.find(official => normalize(official) === tMayor);
                            if (foundOfficial) return foundOfficial;

                            return t.localidadMayor || t.localidad || 'BOGOTÁ';
                        };

                        const objective = 23;
                        const referidos = t.referidos || 0;
                        return [
                            getOfficialName(t).toUpperCase(),
                            t.name.toUpperCase(),
                            referidos.toLocaleString('es-CO'),
                            objective,
                            (referidos / (objective * 0.30)) * 100,
                            (referidos / (objective * 0.65)) * 100,
                            (referidos / objective) * 100
                        ];
                    });
            };

            const rowsOfficial = getEdilData(EDILES_DC_LIST);
            const rowsRemaining = getEdilData(EDILES_REMAINING_LIST);

            const tableConfig: any = {
                startY: 40,
                theme: 'grid',
                styles: { fontSize: 7, cellPadding: 2, halign: 'center', valign: 'middle', lineWidth: 0.1, lineColor: [80, 80, 80], textColor: [0, 0, 0] },
                headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.3, fontStyle: 'bold' },
                columnStyles: {
                    0: { halign: 'left', cellWidth: colWidths[0] },
                    1: { halign: 'left', cellWidth: colWidths[1] },
                    2: { halign: 'center', cellWidth: colWidths[2] },
                    3: { cellWidth: colWidths[3] },
                    4: { cellWidth: colWidths[4] },
                    5: { cellWidth: colWidths[5] },
                    6: { cellWidth: colWidths[6] }
                },
                alternateRowStyles: { fillColor: [255, 255, 255] },
                margin: { left: 10, right: 10 }
            };

            const formatRows = (rowsArr: any[]) => rowsArr.map(r => [
                r[0], r[1], r[2], r[3],
                `${Math.min(r[4], 100).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`,
                `${Math.min(r[5], 100).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`,
                `${r[6].toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
            ]);

            const parseCell = (rowsArr: any[]) => (cellData: any) => {
                if (cellData.section === 'head' && cellData.column.index > 2) cellData.cell.styles.halign = 'center';
                if (cellData.section === 'body') {
                    if (cellData.column.index === 3) {
                        cellData.cell.styles.fillColor = [67, 160, 71];
                    }
                    if ([4, 5, 6].includes(cellData.column.index)) {
                        const val = rowsArr[cellData.row.index][cellData.column.index];
                        const colType = cellData.column.index === 4 ? '30' : cellData.column.index === 5 ? '65' : '100';
                        const color = getCellColor(val, colType);
                        if (color) cellData.cell.styles.fillColor = color;
                    }
                }
            };

            autoTable(doc, {
                ...tableConfig,
                head: headers,
                body: formatRows(rowsOfficial),
                didParseCell: parseCell(rowsOfficial)
            });

            let finalY = (doc as any).lastAutoTable.finalY + 15;
            if (finalY > pageHeight - 40) { doc.addPage(); finalY = 20; }
            doc.setFont("times", "bold");
            doc.setFontSize(14);
            doc.text("LOCALIDADES SIN EDILES", pageWidth / 2, finalY, { align: 'center' });

            autoTable(doc, {
                ...tableConfig,
                head: headers,
                body: formatRows(rowsRemaining),
                startY: finalY + 5,
                didParseCell: parseCell(rowsRemaining)
            });

        } else {
            // Municipal & Departamental logic
            let rows: any[] = [];
            if (type === 'Departamental') {
                rows = [...data.departamentos].sort((a, b) => a.name.localeCompare(b.name)).map(d => [
                    d.name.toUpperCase(), (d.templosCount || 0).toLocaleString('es-CO'), d.referidos.toLocaleString('es-CO'), d.meta.toLocaleString('es-CO'), d.avance30, d.avance65, d.avance100
                ]);
            } else {
                rows = [...data.municipios].filter(m => !m.name.toUpperCase().includes('BOGOTA')).sort((a, b) => (a.departamento || '').localeCompare(b.departamento || '') || a.name.localeCompare(b.name)).map(m => [
                    (m.departamento || '').toUpperCase(), m.name.toUpperCase(), m.temploName || "0", m.referidos.toLocaleString('es-CO'), m.meta.toLocaleString('es-CO'), m.avance30, m.avance65, m.avance100
                ]);
            }

            autoTable(doc, {
                head: headers,
                body: rows.map(r => {
                    const offset = type === 'Municipal' ? 1 : 0;
                    return [
                        ...r.slice(0, 4 + offset),
                        `${Math.min(r[4 + offset], 100).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`,
                        `${Math.min(r[5 + offset], 100).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`,
                        `${r[6 + offset].toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
                    ];
                }),
                startY: 40,
                theme: 'grid',
                styles: { fontSize: 7, cellPadding: 2, halign: 'center', valign: 'middle', lineWidth: 0.1, lineColor: [80, 80, 80], textColor: [0, 0, 0] },
                headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.3, fontStyle: 'bold' },
                columnStyles: { 0: { halign: 'left', cellWidth: colWidths[0] }, 1: { halign: 'left', cellWidth: colWidths[1] } },
                didParseCell: (cellData) => {
                    if (cellData.section === 'body') {
                        const objetivoIdx = type === 'Municipal' ? 4 : 3;
                        if (cellData.column.index === objetivoIdx) cellData.cell.styles.fillColor = [67, 160, 71];
                        const progressCols = type === 'Municipal' ? [5, 6, 7] : [4, 5, 6];
                        if (progressCols.includes(cellData.column.index)) {
                            const val = rows[cellData.row.index][cellData.column.index];
                            const colType = cellData.column.index === progressCols[0] ? '30' : cellData.column.index === progressCols[1] ? '65' : '100';
                            const color = getCellColor(val, colType);
                            if (color) cellData.cell.styles.fillColor = color;
                        }
                    }
                },
                margin: { left: 10, right: 10 }
            });
        }

        // Footer & Legend
        let finalY = (doc as any).lastAutoTable.finalY + 10;
        if (finalY > pageHeight - 60) { doc.addPage(); finalY = 20; }
        doc.setFont("times", "italic");
        doc.setFontSize(9);
        const description = "Este informe presenta el estado de avance en el número de referidos registrados en el marco de la estrategia, Avancemos por la Libertad Religiosa. El seguimiento se realiza mediante tres cortes de control programados para el 15 de enero, el 7 de febrero y el 28 de febrero, permitiendo evaluar el cumplimiento progresivo de las metas establecidas.";
        doc.text(doc.splitTextToSize(description, pageWidth - 30), 14, finalY);
        finalY += 15;
        doc.text("Para facilitar la interpretación de los resultados, se utiliza una escala de cuatro colores:", 14, finalY);
        finalY += 8;
        const legend = [
            { color: [67, 160, 71], text: "Verde: Representa un cumplimiento del 100% o superior de la meta fijada para el corte." },
            { color: [253, 216, 53], text: "Amarillo: Indica un avance significativo, situado entre el 65% y el 99% de la meta." },
            { color: [251, 140, 0], text: "Naranja: Señala un progreso intermedio, con un cumplimiento entre el 30% y el 64%." },
            { color: [229, 57, 53], text: "Rojo: Identifica un nivel de ejecución inicial, por debajo del 30%." }
        ];
        legend.forEach(item => {
            doc.setFillColor(item.color[0], item.color[1], item.color[2]);
            doc.rect(14, finalY - 4, 4, 4, 'F');
            doc.text(item.text, 22, finalY);
            finalY += 6;
        });
        finalY += 4;
        const note = "Nota importante: Es necesario destacar que el color rojo solo se aplica para los cortes del 15 de enero y 7 de febrero. En el último corte, los registros que se sitúen por debajo del 30% no se marcarán con ese color; esto se debe a que, en esa etapa, dichas cifras no representan una alerta, sino el avance gradual y acumulativo hacia los objetivos finales de la estrategia.";
        doc.text(doc.splitTextToSize(note, pageWidth - 30), 14, finalY);

        window.open(doc.output('bloburl'), '_blank');
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 font-bold gap-2 px-6 text-white border-none shadow-lg">
                    <Brain className="w-5 h-5" />
                    Crear Informe
                    <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-background border-muted shadow-2xl">
                <DropdownMenuItem onClick={() => generatePdf('Departamental')} className="cursor-pointer gap-2 py-2.5">
                    <Map className="w-4 h-4 text-emerald-500" />
                    <span>Departamental</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => generatePdf('Municipal')} className="cursor-pointer gap-2 py-2.5">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span>Municipal</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => generatePdf('Ediles')} className="cursor-pointer gap-2 py-2.5">
                    <Building2 className="w-4 h-4 text-emerald-500" />
                    <span>Ediles D.C</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
