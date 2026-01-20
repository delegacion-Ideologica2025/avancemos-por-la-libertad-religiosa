"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { DashboardData } from "@/lib/types";

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

        // Red logic: Only for 30% and 65% columns
        if (columnType !== '100') return [229, 57, 53]; // #e53935 (Rojo)

        return null; // White for <30 in 100% column
    };

    const generatePdf = (type: 'Departamental' | 'Municipal') => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // 1. Centered Title
        const mainTitle = type === 'Departamental'
            ? "INFORME DE GESTIÓN DEPARTAMENTAL: AVANCEMOS POR LA"
            : "INFORME DE GESTIÓN MUNICIPAL: AVANCEMOS POR LA";
        const subTitle = "LIBERTAD RELIGIOSA";

        doc.setFont("times", "bold");
        doc.setFontSize(14);
        doc.text(mainTitle, pageWidth / 2, 15, { align: 'center' });
        doc.text(subTitle, pageWidth / 2, 22, { align: 'center' });

        // 2. Prepare Data
        let rows: any[] = [];
        if (type === 'Departamental') {
            rows = [...data.departamentos]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(d => [
                    d.name.toUpperCase(),
                    d.referidos.toLocaleString('es-CO'),
                    (d.templosCount || 0).toLocaleString('es-CO'), // Reporting count of municipios with refs
                    d.meta.toLocaleString('es-CO'),
                    d.avance30,
                    d.avance65,
                    d.avance100
                ]);
        } else {
            rows = [...data.municipios]
                .filter(m => !m.name.toUpperCase().includes('BOGOTA') && !m.name.toUpperCase().includes('BOGOTÁ'))
                .sort((a, b) => {
                    const deptCompare = (a.departamento || '').localeCompare(b.departamento || '');
                    if (deptCompare !== 0) return deptCompare;
                    return a.name.localeCompare(b.name);
                })
                .map(m => [
                    (m.departamento || '').toUpperCase(),
                    m.name.toUpperCase(),
                    m.temploName || "0", // Reportando moved here
                    m.referidos.toLocaleString('es-CO'),
                    m.meta.toLocaleString('es-CO'),
                    m.avance30,
                    m.avance65,
                    m.avance100
                ]);
        }

        // 3. Table
        autoTable(doc, {
            startY: 30,
            head: [[
                type === 'Departamental' ? 'DEPARTAMENTO' : 'DEPARTAMENTO',
                type === 'Departamental' ? 'REFERIDOS CARGADOS' : 'MUNICIPIO',
                type === 'Departamental' ? 'REPORTANDO' : 'REPORTANDO',
                type === 'Departamental' ? 'META' : 'REFERIDOS\nCARGADOS',
                type === 'Departamental' ? 'AVANCE 30%\n15 Enero' : 'META',
                type === 'Departamental' ? 'AVANCE 65%\n7 Febrero' : 'AVANCE 30%\n15 Enero',
                type === 'Departamental' ? 'AVANCE 100%\n28 Febrero' : 'AVANCE 65%\n7 Febrero',
                type === 'Departamental' ? '' : 'AVANCE 100%\n28 Febrero'
            ]].map(row => type === 'Departamental' ? row.slice(0, 7) : row),
            body: rows.map(r => {
                if (type === 'Departamental') {
                    return [
                        r[0], r[1], r[2], r[3],
                        `${Math.min(r[4], 100).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`,
                        `${Math.min(r[5], 100).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`,
                        `${r[6].toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
                    ];
                } else {
                    return [
                        r[0], r[1], r[2], r[3], r[4],
                        `${Math.min(r[5], 100).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`,
                        `${Math.min(r[6], 100).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`,
                        `${r[7].toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
                    ];
                }
            }),
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                lineColor: [0, 0, 0],
                lineWidth: 0.1,
                halign: 'center',
                valign: 'middle',
                fontSize: 8,
                font: 'times',
                fontStyle: 'bold'
            },
            styles: {
                lineColor: [0, 0, 0],
                lineWidth: 0.1,
                fontSize: 9,
                textColor: [0, 0, 0],
                halign: 'center',
                font: 'times'
            },
            columnStyles: {
                0: { halign: 'left' },
                // For Municipal: Dept (0) is left, Muni (1) is left, Reportando (2) is left (content only logic below), others center
                1: { halign: type === 'Municipal' ? 'left' : 'center' },
                2: { halign: type === 'Municipal' ? 'left' : 'center' }
            },
            alternateRowStyles: { fillColor: [255, 255, 255] },
            didParseCell: (data) => {
                // Adjust header alignment for Reportando in Municipal report
                if (type === 'Municipal' && data.section === 'head' && data.column.index === 2) {
                    data.cell.styles.halign = 'center'; // Force header to center
                }

                const valueIndexBase = type === 'Departamental' ? 4 : 5;
                if (data.section === 'body' && data.column.index >= valueIndexBase) {
                    const val = rows[data.row.index][data.column.index];
                    const colType = data.column.index === valueIndexBase ? '30' : data.column.index === valueIndexBase + 1 ? '65' : '100';
                    const color = getCellColor(val, colType);
                    if (color) {
                        data.cell.styles.fillColor = color;
                        // For colored cells, user says "los numeros de las tablas del pdf todos deben ser negros"
                        data.cell.styles.textColor = [0, 0, 0];
                    }
                } else if (data.section === 'body') {
                    data.cell.styles.textColor = [0, 0, 0];
                }
            },
            margin: { left: 10, right: 10 }
        });

        // 4. Footer (Explanatory Text & Legend)
        let finalY = (doc as any).lastAutoTable.finalY + 10;

        // Prevent overlap with page end
        if (finalY > pageHeight - 60) {
            doc.addPage();
            finalY = 20;
        }

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

        const fileName = `Referidos SR, ${type} ${formatDateTime()}.pdf`.replace(/\//g, '-');
        doc.save(fileName);
    };

    const handleGenerateReport = () => {
        generatePdf('Departamental');
        setTimeout(() => generatePdf('Municipal'), 500);
    };

    return (
        <Button
            onClick={handleGenerateReport}
            className="bg-emerald-600 hover:bg-emerald-700 font-bold gap-2 px-6 text-white border-none shadow-lg"
        >
            <Brain className="w-5 h-5" />
            Crear Informe
        </Button>
    );
}
