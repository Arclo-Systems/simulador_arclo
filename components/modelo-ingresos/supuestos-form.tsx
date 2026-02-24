"use client";

import type { Supuestos, TramoISR, DistribucionLinea } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCRC } from "@/lib/format";

interface SupuestosFormProps {
  supuestos: Supuestos;
  onChange: (supuestos: Supuestos) => void;
}

function parseNum(value: string): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

export function SupuestosForm({ supuestos, onChange }: SupuestosFormProps) {
  function updateField<K extends keyof Supuestos>(key: K, value: Supuestos[K]) {
    onChange({ ...supuestos, [key]: value });
  }

  function updatePercentField(key: keyof Supuestos, displayValue: string) {
    updateField(key, parseNum(displayValue) / 100);
  }

  function updateTramo(index: number, field: keyof TramoISR, raw: string) {
    const updated = supuestos.tramosISR.map((tramo, i) => {
      if (i !== index) return tramo;
      if (field === "nota") return { ...tramo, nota: raw };
      if (field === "tasa") return { ...tramo, tasa: parseNum(raw) / 100 };
      return { ...tramo, [field]: parseNum(raw) };
    });
    updateField("tramosISR", updated);
  }

  function updateGasto(index: number, monto: string) {
    const updated = supuestos.gastosOperativos.map((g, i) =>
      i === index ? { ...g, montoMensualCRC: parseNum(monto) } : g
    );
    updateField("gastosOperativos", updated);
  }

  function updateDistribucion(index: number, field: keyof DistribucionLinea, raw: string) {
    const updated = supuestos.distribucionLineas.map((d, i) => {
      if (i !== index) return d;
      if (field === "porcentaje") return { ...d, porcentaje: parseNum(raw) / 100 };
      if (field === "comisionPlataforma") return { ...d, comisionPlataforma: parseNum(raw) / 100 };
      return { ...d, [field]: raw };
    });
    updateField("distribucionLineas", updated);
  }

  const totalGastos = supuestos.gastosOperativos.reduce(
    (sum, g) => sum + g.montoMensualCRC,
    0
  );

  const totalDistribucion = supuestos.distribucionLineas.reduce(
    (sum, d) => sum + d.porcentaje,
    0
  );
  const distribucionSuma100 = Math.abs(totalDistribucion - 1) < 0.001;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Card 1: Tipo de Cambio */}
      <Card>
        <CardHeader>
          <CardTitle>Tipo de Cambio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="tipoCambio">CRC por 1 USD</Label>
            <Input
              id="tipoCambio"
              type="number"
              value={supuestos.tipoCambio}
              onChange={(e) => updateField("tipoCambio", parseNum(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Card 2: IVA */}
      <Card>
        <CardHeader>
          <CardTitle>IVA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tasaIVA">Tasa IVA (%)</Label>
            <Input
              id="tasaIVA"
              type="number"
              step="0.1"
              value={+(supuestos.tasaIVA * 100).toFixed(4)}
              onChange={(e) => updatePercentField("tasaIVA", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="creditoFiscalIVA">Cr&eacute;dito Fiscal IVA (%)</Label>
            <Input
              id="creditoFiscalIVA"
              type="number"
              step="0.1"
              value={+(supuestos.creditoFiscalIVA * 100).toFixed(4)}
              onChange={(e) => updatePercentField("creditoFiscalIVA", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Tramos ISR PYME */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Tramos ISR PYME</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tramo</TableHead>
                <TableHead>Hasta (&#8353;)</TableHead>
                <TableHead>Tasa (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supuestos.tramosISR.map((tramo, i) => (
                <TableRow key={i}>
                  <TableCell className="text-muted-foreground text-sm">
                    {tramo.nota}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={tramo.hasta}
                      onChange={(e) => updateTramo(i, "hasta", e.target.value)}
                      aria-label={`Límite superior tramo ${tramo.nota}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.1"
                      value={+(tramo.tasa * 100).toFixed(4)}
                      onChange={(e) => updateTramo(i, "tasa", e.target.value)}
                      aria-label={`Tasa ISR tramo ${tramo.nota}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="umbralTarifaPlena">Umbral Tarifa Plena (&#8353;)</Label>
              <Input
                id="umbralTarifaPlena"
                type="number"
                value={supuestos.umbralTarifaPlena}
                onChange={(e) =>
                  updateField("umbralTarifaPlena", parseNum(e.target.value))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tasaPlena">Tasa Plena (%)</Label>
              <Input
                id="tasaPlena"
                type="number"
                step="0.1"
                value={+(supuestos.tasaPlena * 100).toFixed(4)}
                onChange={(e) => updatePercentField("tasaPlena", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Otros Impuestos y Cargas */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Otros Impuestos y Cargas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="tasaDividendos">Dividendos (%)</Label>
              <Input
                id="tasaDividendos"
                type="number"
                step="0.1"
                value={+(supuestos.tasaDividendos * 100).toFixed(4)}
                onChange={(e) => updatePercentField("tasaDividendos", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comisionInApp">Comisi&oacute;n In-App (%)</Label>
              <Input
                id="comisionInApp"
                type="number"
                step="0.01"
                value={+(supuestos.comisionInApp * 100).toFixed(4)}
                onChange={(e) => updatePercentField("comisionInApp", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comisionSINPE">Comisi&oacute;n SINPE (%)</Label>
              <Input
                id="comisionSINPE"
                type="number"
                step="0.01"
                value={+(supuestos.comisionSINPE * 100).toFixed(4)}
                onChange={(e) => updatePercentField("comisionSINPE", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comisionPasarela">Comisi&oacute;n Pasarela (%)</Label>
              <Input
                id="comisionPasarela"
                type="number"
                step="0.01"
                value={+(supuestos.comisionPasarela * 100).toFixed(4)}
                onChange={(e) => updatePercentField("comisionPasarela", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patenteMunicipal">Patente Municipal (%)</Label>
              <Input
                id="patenteMunicipal"
                type="number"
                step="0.01"
                value={+(supuestos.patenteMunicipal * 100).toFixed(4)}
                onChange={(e) => updatePercentField("patenteMunicipal", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timbresEducacion">Timbres Educaci&oacute;n (%)</Label>
              <Input
                id="timbresEducacion"
                type="number"
                step="0.01"
                value={+(supuestos.timbresEducacion * 100).toFixed(4)}
                onChange={(e) => updatePercentField("timbresEducacion", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numSocios">N&uacute;mero de Socios</Label>
              <Input
                id="numSocios"
                type="number"
                step="1"
                min="1"
                value={supuestos.numSocios}
                onChange={(e) =>
                  updateField("numSocios", Math.max(1, Math.round(parseNum(e.target.value))))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 5: Gastos Operativos Mensuales */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Gastos Operativos Mensuales</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concepto</TableHead>
                <TableHead>Monto (&#8353;)</TableHead>
                <TableHead>Detalle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supuestos.gastosOperativos.map((gasto, i) => (
                <TableRow key={i}>
                  <TableCell className="text-sm">{gasto.concepto}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={gasto.montoMensualCRC}
                      onChange={(e) => updateGasto(i, e.target.value)}
                      aria-label={`Monto mensual ${gasto.concepto}`}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {gasto.detalle}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold">
                <TableCell>Total</TableCell>
                <TableCell>{formatCRC(totalGastos)}</TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Card 6: Distribucion por Linea de Negocio */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Distribuci&oacute;n por L&iacute;nea de Negocio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>L&iacute;nea</TableHead>
                <TableHead>Porcentaje (%)</TableHead>
                <TableHead>Comisi&oacute;n Plataforma (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supuestos.distribucionLineas.map((linea, i) => (
                <TableRow key={i}>
                  <TableCell className="text-sm">{linea.nombre}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="1"
                      value={+(linea.porcentaje * 100).toFixed(4)}
                      onChange={(e) =>
                        updateDistribucion(i, "porcentaje", e.target.value)
                      }
                      aria-label={`Porcentaje ${linea.nombre}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      value={+(linea.comisionPlataforma * 100).toFixed(4)}
                      onChange={(e) =>
                        updateDistribucion(i, "comisionPlataforma", e.target.value)
                      }
                      aria-label={`Comisión plataforma ${linea.nombre}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center gap-3 text-sm">
            <span className="font-medium">
              Total: {(totalDistribucion * 100).toFixed(1)}%
            </span>
            {!distribucionSuma100 && (
              <span className="text-destructive font-medium">
                La suma debe ser 100%
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
