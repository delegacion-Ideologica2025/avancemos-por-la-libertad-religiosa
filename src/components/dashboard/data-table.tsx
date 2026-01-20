"use client";

import React, { useState, useMemo } from 'react';
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
    SortingState,
} from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronRight, Search, FileDown, ArrowUpDown } from 'lucide-react';
import { cn } from "@/lib/utils";
import * as XLSX from 'xlsx';

// Heatmap Cell Component
const HeatmapCell = ({ value, max }: { value: number, max?: number }) => {
    let bgClass = "bg-red-950/30 text-red-400"; // default red < 30
    if (value >= 100) bgClass = "bg-emerald-950/30 text-emerald-400"; // green >= 100
    else if (value >= 65) bgClass = "bg-yellow-900/30 text-yellow-400"; // yellow 65-99
    else if (value >= 30) bgClass = "bg-orange-950/30 text-orange-400"; // orange 30-64

    const displayValue = max !== undefined ? Math.min(value, max) : value;

    return (
        <div className={cn("inline-flex items-center justify-center w-16 py-1 rounded font-mono text-xs font-bold", bgClass)}>
            {displayValue.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
        </div>
    );
};

interface DataTableProps {
    data: any[];
    onRowClick: (row: any) => void;
    levelName: string; // 'Departamento' | 'Municipio' ...
}

export function DataTable({ data, onRowClick, levelName }: DataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([{ id: 'avance100', desc: true }]);
    // const [globalFilter, setGlobalFilter] = useState(''); // Removed globalFilter state

    const columns = useMemo<ColumnDef<any>[]>(() => [
        {
            accessorKey: 'name',
            header: ({ column }: any) => {
                return (
                    <div className="flex justify-start">
                        <Button
                            variant="ghost"
                            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                            className="p-0 hover:bg-transparent"
                        >
                            {levelName}
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                )
            },
            cell: ({ row }: any) => (
                <div className="font-medium flex items-center gap-2">
                    {row.getValue('name')}
                    {levelName === 'Departamento' && <ChevronRight className="h-4 w-4 text-muted-foreground/50" />}
                </div>
            ),
        },
        {
            accessorKey: 'meta',
            header: ({ column }: any) => (
                <div className="text-center">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="p-0 hover:bg-transparent"
                    >
                        Objetivo
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ),
            cell: ({ row }: any) => <div className="text-center text-muted-foreground font-mono">{Number(row.getValue('meta')).toLocaleString('es-CO')}</div>,
        },
        {
            accessorKey: 'referidos',
            header: ({ column }: any) => (
                <div className="text-center">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="p-0 hover:bg-transparent"
                    >
                        Cargados
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ),
            cell: ({ row }: any) => <div className="text-center font-mono">{Number(row.getValue('referidos')).toLocaleString('es-CO')}</div>,
        },
        {
            accessorKey: 'avance30',
            header: ({ column }: any) => (
                <div className="flex justify-center min-w-[80px]">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="p-0 hover:bg-transparent"
                    >
                        Ene 15
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ),
            cell: ({ row }: any) => (
                <div className="flex justify-center">
                    <HeatmapCell value={row.getValue('avance30')} max={100} />
                </div>
            ),
        },
        {
            accessorKey: 'avance65',
            header: ({ column }: any) => (
                <div className="flex justify-center min-w-[80px]">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="p-0 hover:bg-transparent"
                    >
                        Feb 07
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ),
            cell: ({ row }: any) => (
                <div className="flex justify-center">
                    <HeatmapCell value={row.getValue('avance65')} max={100} />
                </div>
            ),
        },
        {
            accessorKey: 'avance100',
            header: ({ column }: any) => (
                <div className="flex justify-center min-w-[80px]">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="p-0 hover:bg-transparent"
                    >
                        Feb 28
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ),
            cell: ({ row }: any) => (
                <div className="flex justify-center">
                    <HeatmapCell value={row.getValue('avance100')} />
                </div>
            ),
        },
    ], [levelName]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(), // Keep getFilteredRowModel for column filters
        getPaginationRowModel: getPaginationRowModel(),
        state: {
            sorting,
            // globalFilter, // Removed globalFilter from state
        },
        onSortingChange: setSorting,
        // onGlobalFilterChange: setGlobalFilter, // Removed onGlobalFilterChange
        // globalFilterFn: (row, columnId, filterValue) => { // Removed globalFilterFn
        //     const value = row.getValue(columnId);
        //     return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
        // }
    });

    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data");
        XLSX.writeFile(wb, `Export_${levelName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center px-4 py-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={`Buscar ${levelName}...`}
                        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("name")?.setFilterValue(event.target.value)
                        }
                        className="pl-10 bg-muted/20 border-muted/50 focus-visible:ring-ring focus-visible:ring-offset-0 transition-all"
                    />
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    onClick={() => levelName === 'Departamento' && onRowClick && onRowClick(row.original)}
                                    className={cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", levelName === 'Departamento' ? "cursor-pointer" : "")}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No se encontraron resultados para la búsqueda.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4 px-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Anterior
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Siguiente
                </Button>
            </div>
        </div>
    );
}
