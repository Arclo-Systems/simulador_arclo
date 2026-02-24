"use client";

import { useMemo, useState } from "react";
import type { Supuestos, ResultadoMensual } from "@/types";
import { MESES } from "@/lib/constants";
import {
  calcularComisiones,
  calcularIVA,
  calcularTotalGastosOperativos,
} from "@/lib/calculos-ingresos";
import { formatCRC, formatUSD } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ModeloMensualProps {
  supuestos: Supuestos;
  ingresoMensualBaseCRC: number;
  costoIAMensualCRC: number;
  onOverride: (mes: number, valor: number) => void;
  overrides: Record<number, number>;
}

interface ComisionLinea {
  nombre: string;
  montos: number[];
  total: number;
}

interface ResultadosMensualesComputados {
  resultados: ResultadoMensual[];
  distribucionMontos: { nombre: string; montos: number[]; total: number }[];
  comisionesLineas: ComisionLinea[];
  totalComisionesPorMes: number[];
  ivaPorMes: { ivaCobrado: number; ivaCredito: number; ivaNeto: number }[];
  gastosMensuales: number;
}

function SectionHeader({ children, colSpan }: { children: React.ReactNode; colSpan: number }) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className="bg-muted/50 font-bold text-xs uppercase tracking-wider"
      >
        {children}
      </TableCell>
    </TableRow>
  );
}

export function ModeloMensual({
  supuestos,
  ingresoMensualBaseCRC,
  costoIAMensualCRC,
  onOverride,
  overrides,
}: ModeloMensualProps) {
  const [editingCell, setEditingCell] = useState<number | null>(null);

  const computed = useMemo<ResultadosMensualesComputados>(() => {
    const gastosFijos = calcularTotalGastosOperativos(supuestos.gastosOperativos);
    const gastosMensuales = gastosFijos + costoIAMensualCRC;

    const resultados: ResultadoMensual[] = [];
    const distribucionMontos: { nombre: string; montos: number[]; total: number }[] =
      supuestos.distribucionLineas.map((l) => ({ nombre: l.nombre, montos: [], total: 0 }));
    const comisionesLineas: ComisionLinea[] = supuestos.distribucionLineas
      .filter((l) => l.comisionPlataforma > 0)
      .map((l) => ({ nombre: l.nombre, montos: [], total: 0 }));
    const totalComisionesPorMes: number[] = [];
    const ivaPorMes: { ivaCobrado: number; ivaCredito: number; ivaNeto: number }[] = [];

    for (let i = 0; i < 12; i++) {
      const ingresoBruto = overrides[i] !== undefined ? overrides[i] : ingresoMensualBaseCRC;

      supuestos.distribucionLineas.forEach((linea, li) => {
        const monto = ingresoBruto * linea.porcentaje;
        distribucionMontos[li].montos.push(monto);
        distribucionMontos[li].total += monto;
      });

      const comisionesTotal = calcularComisiones(ingresoBruto, supuestos.distribucionLineas);
      totalComisionesPorMes.push(comisionesTotal);

      let comisionIdx = 0;
      for (const linea of supuestos.distribucionLineas) {
        if (linea.comisionPlataforma > 0) {
          const monto = ingresoBruto * linea.porcentaje * linea.comisionPlataforma;
          comisionesLineas[comisionIdx].montos.push(monto);
          comisionesLineas[comisionIdx].total += monto;
          comisionIdx++;
        }
      }

      const ingresoNetoComisiones = ingresoBruto - comisionesTotal;
      const iva = calcularIVA(
        ingresoNetoComisiones,
        supuestos.tasaIVA,
        supuestos.creditoFiscalIVA,
        gastosMensuales
      );
      ivaPorMes.push(iva);

      const ingresoPostIVA = ingresoNetoComisiones - iva.ivaNeto;
      const utilidadBruta = ingresoPostIVA - gastosMensuales;

      resultados.push({
        mes: MESES[i],
        ingresoBruto,
        comisiones: comisionesTotal,
        ingresoNetoComisiones,
        ivaCobrado: iva.ivaCobrado,
        ivaCredito: iva.ivaCredito,
        ivaNeto: iva.ivaNeto,
        ingresoPostIVA,
        gastosOperativos: gastosMensuales,
        utilidadBruta,
      });
    }

    return {
      resultados,
      distribucionMontos,
      comisionesLineas,
      totalComisionesPorMes,
      ivaPorMes,
      gastosMensuales,
    };
  }, [supuestos, ingresoMensualBaseCRC, costoIAMensualCRC, overrides]);

  const { resultados, distribucionMontos, comisionesLineas, totalComisionesPorMes, ivaPorMes, gastosMensuales } = computed;

  const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
  const totalCol = 15; // Concepto + 12 meses + Total Anual + Total USD

  function renderMonthValues(
    values: number[],
    className?: string,
    formatter: (v: number) => string = formatCRC
  ) {
    const anual = sum(values);
    return (
      <>
        {values.map((v, i) => (
          <TableCell key={i} className={`text-right font-mono text-xs ${className ?? ""}`}>
            {formatter(v)}
          </TableCell>
        ))}
        <TableCell className={`text-right font-mono text-xs font-bold border-l ${className ?? ""}`}>
          {formatter(anual)}
        </TableCell>
        <TableCell className={`text-right font-mono text-xs font-bold border-l ${className ?? ""}`}>
          {formatUSD(anual / supuestos.tipoCambio)}
        </TableCell>
      </>
    );
  }

  function handleCellClick(mes: number) {
    setEditingCell(mes);
  }

  function handleInputBlur(mes: number, value: string) {
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed >= 0) {
      onOverride(mes, parsed);
    }
    setEditingCell(null);
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>, mes: number) {
    if (e.key === "Enter") {
      handleInputBlur(mes, (e.target as HTMLInputElement).value);
    } else if (e.key === "Escape") {
      setEditingCell(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Modelo Mensual (Proyecci&oacute;n 12 Meses)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 z-10 bg-background min-w-[200px]">
                  Concepto
                </TableHead>
                {MESES.map((mes) => (
                  <TableHead key={mes} className="text-right min-w-[100px]">
                    {mes}
                  </TableHead>
                ))}
                <TableHead className="text-right min-w-[120px] border-l">
                  Total Anual
                </TableHead>
                <TableHead className="text-right min-w-[110px] border-l">
                  Total USD
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* INGRESOS BRUTOS */}
              <SectionHeader colSpan={totalCol}>Ingresos Brutos</SectionHeader>

              {/* Ingreso Bruto Total (editable) */}
              <TableRow>
                <TableCell className="sticky left-0 z-10 bg-background font-medium text-xs text-green-700 dark:text-green-400">
                  Ingreso Bruto Total
                </TableCell>
                {resultados.map((r, i) => {
                  const isEditing = editingCell === i;
                  return (
                    <TableCell
                      key={i}
                      className="text-right bg-blue-50 dark:bg-blue-950/20 cursor-pointer"
                      onClick={() => handleCellClick(i)}
                    >
                      {isEditing ? (
                        <Input
                          type="number"
                          min={0}
                          defaultValue={r.ingresoBruto}
                          autoFocus
                          onBlur={(e) => handleInputBlur(i, e.target.value)}
                          onKeyDown={(e) => handleInputKeyDown(e, i)}
                          className="h-7 w-24 text-xs text-right font-mono px-1.5"
                        />
                      ) : (
                        <span className="font-mono text-xs text-green-700 dark:text-green-400">
                          {formatCRC(r.ingresoBruto)}
                        </span>
                      )}
                    </TableCell>
                  );
                })}
                <TableCell className="text-right font-mono text-xs font-bold text-green-700 dark:text-green-400 border-l">
                  {formatCRC(sum(resultados.map((r) => r.ingresoBruto)))}
                </TableCell>
                <TableCell className="text-right font-mono text-xs font-bold text-green-700 dark:text-green-400 border-l">
                  {formatUSD(sum(resultados.map((r) => r.ingresoBruto)) / supuestos.tipoCambio)}
                </TableCell>
              </TableRow>

              {/* Distribucion lineas */}
              {distribucionMontos.map((dist) => (
                <TableRow key={dist.nombre}>
                  <TableCell className="sticky left-0 z-10 bg-background text-xs pl-6 text-muted-foreground">
                    {dist.nombre}
                  </TableCell>
                  {renderMonthValues(dist.montos, "text-green-600 dark:text-green-500")}
                </TableRow>
              ))}

              {/* COMISIONES DE PLATAFORMAS */}
              <SectionHeader colSpan={totalCol}>Comisiones de Plataformas</SectionHeader>

              {comisionesLineas.map((cl) => (
                <TableRow key={cl.nombre}>
                  <TableCell className="sticky left-0 z-10 bg-background text-xs pl-6 text-red-600 dark:text-red-400">
                    {cl.nombre}
                  </TableCell>
                  {renderMonthValues(cl.montos, "text-red-600 dark:text-red-400")}
                </TableRow>
              ))}

              <TableRow className="border-t-2">
                <TableCell className="sticky left-0 z-10 bg-background font-bold text-xs text-red-700 dark:text-red-400">
                  Total Comisiones
                </TableCell>
                {renderMonthValues(totalComisionesPorMes, "text-red-700 dark:text-red-400")}
              </TableRow>

              {/* Ingreso Neto despues de Comisiones */}
              <TableRow className="border-t-2">
                <TableCell className="sticky left-0 z-10 bg-background font-bold text-xs">
                  Ingreso Neto despu&eacute;s de Comisiones
                </TableCell>
                {renderMonthValues(resultados.map((r) => r.ingresoNetoComisiones), "font-semibold")}
              </TableRow>

              {/* IVA */}
              <SectionHeader colSpan={totalCol}>IVA</SectionHeader>

              <TableRow>
                <TableCell className="sticky left-0 z-10 bg-background text-xs pl-6 text-orange-600 dark:text-orange-400">
                  IVA Cobrado (13%)
                </TableCell>
                {renderMonthValues(ivaPorMes.map((iva) => iva.ivaCobrado), "text-orange-600 dark:text-orange-400")}
              </TableRow>

              <TableRow>
                <TableCell className="sticky left-0 z-10 bg-background text-xs pl-6 text-green-600 dark:text-green-400">
                  IVA Cr&eacute;dito Fiscal
                </TableCell>
                {renderMonthValues(ivaPorMes.map((iva) => iva.ivaCredito), "text-green-600 dark:text-green-400")}
              </TableRow>

              <TableRow className="border-t">
                <TableCell className="sticky left-0 z-10 bg-background font-bold text-xs text-orange-700 dark:text-orange-400">
                  IVA Neto por Pagar
                </TableCell>
                {renderMonthValues(ivaPorMes.map((iva) => iva.ivaNeto), "text-orange-700 dark:text-orange-400")}
              </TableRow>

              {/* Ingreso despues de IVA */}
              <TableRow className="border-t-2">
                <TableCell className="sticky left-0 z-10 bg-background font-bold text-xs">
                  Ingreso despu&eacute;s de IVA
                </TableCell>
                {renderMonthValues(resultados.map((r) => r.ingresoPostIVA), "font-semibold")}
              </TableRow>

              {/* GASTOS OPERATIVOS */}
              <SectionHeader colSpan={totalCol}>Gastos Operativos</SectionHeader>

              <TableRow>
                <TableCell className="sticky left-0 z-10 bg-background text-xs pl-6 text-red-600 dark:text-red-400">
                  Total Gastos Operativos
                </TableCell>
                {renderMonthValues(
                  Array.from({ length: 12 }, () => gastosMensuales),
                  "text-red-600 dark:text-red-400"
                )}
              </TableRow>

              {/* Utilidad Bruta */}
              <TableRow className="border-t-2 bg-muted/30">
                <TableCell className="sticky left-0 z-10 bg-muted/30 font-bold text-xs">
                  Utilidad Bruta
                </TableCell>
                {renderMonthValues(
                  resultados.map((r) => r.utilidadBruta),
                  "font-bold"
                )}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
