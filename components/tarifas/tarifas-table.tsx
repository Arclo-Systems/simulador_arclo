"use client";

import { useMemo } from "react";
import type { PlanPublicitario } from "@/types";
import {
  VOLUMENES_TIEMPO,
  VOLUMENES_CPM,
  VOLUMENES_CPC,
  AUDIENCIA_LABELS,
} from "@/lib/constants";
import {
  calcularPrecioTiempo,
  calcularPrecioCPM,
  calcularPrecioCPC,
} from "@/lib/calculos-tarifas";
import { formatUSD } from "@/lib/format";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface TarifasTableProps {
  tarifasTiempo: Record<string, { audiencia: string; precioBase: number }>;
  tarifasCPM: Record<string, { audiencia: string; precioBase: number }>;
  tarifasCPC: Record<string, { audiencia: string; precioBase: number }>;
  onTarifaChange: (
    tipo: PlanPublicitario,
    audiencia: string,
    nuevoPrecio: number
  ) => void;
  descuento: number;
}

const AUDIENCIA_KEYS = ["manejo", "bachillerato", "universidades"] as const;

function formatVolume(vol: number): string {
  if (vol >= 1_000) return `${vol / 1_000}K`;
  return String(vol);
}

interface TarifaRowProps {
  audienciaKey: string;
  precioBase: number;
  descuento: number;
  volumenes: number[];
  calcFn: (base: number, cantidad: number, desc: number) => number;
  onPrecioChange: (nuevoPrecio: number) => void;
}

function TarifaRow({
  audienciaKey,
  precioBase,
  descuento,
  volumenes,
  calcFn,
  onPrecioChange,
}: TarifaRowProps) {
  const precioConDescuento = precioBase * (1 - descuento);

  const volumenPrices = useMemo(
    () => volumenes.map((vol) => calcFn(precioBase, vol, descuento)),
    [precioBase, descuento, volumenes, calcFn]
  );

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const parsed = parseFloat(e.target.value);
    if (!isNaN(parsed) && parsed >= 0) {
      onPrecioChange(parsed);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  }

  return (
    <TableRow>
      <TableCell className="font-medium text-xs">
        {AUDIENCIA_LABELS[audienciaKey] ?? audienciaKey}
      </TableCell>
      <TableCell className="bg-blue-50 dark:bg-blue-950/30">
        <Input
          type="number"
          min={0}
          step={0.01}
          defaultValue={precioBase}
          key={precioBase}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="h-7 w-24 text-xs text-right font-mono px-1.5"
        />
      </TableCell>
      <TableCell className="text-right font-mono text-xs text-green-700 dark:text-green-400">
        {formatUSD(precioConDescuento)}
      </TableCell>
      {volumenPrices.map((price, i) => (
        <TableCell
          key={i}
          className="text-right font-mono text-xs text-green-700 dark:text-green-400"
        >
          {formatUSD(price)}
        </TableCell>
      ))}
    </TableRow>
  );
}

interface PricingTableProps {
  tarifas: Record<string, { audiencia: string; precioBase: number }>;
  tipo: PlanPublicitario;
  baseLabel: string;
  volumenes: number[];
  volLabels: string[];
  calcFn: (base: number, cantidad: number, desc: number) => number;
  descuento: number;
  onTarifaChange: (
    tipo: PlanPublicitario,
    audiencia: string,
    nuevoPrecio: number
  ) => void;
}

function PricingTable({
  tarifas,
  tipo,
  baseLabel,
  volumenes,
  volLabels,
  calcFn,
  descuento,
  onTarifaChange,
}: PricingTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[160px]">Audiencia</TableHead>
            <TableHead className="min-w-[110px]">{baseLabel}</TableHead>
            <TableHead className="text-right min-w-[100px]">
              Con desc.
            </TableHead>
            {volLabels.map((label) => (
              <TableHead key={label} className="text-right min-w-[90px]">
                {label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {AUDIENCIA_KEYS.map((key) => {
            const tarifa = tarifas[key];
            if (!tarifa) return null;
            return (
              <TarifaRow
                key={key}
                audienciaKey={key}
                precioBase={tarifa.precioBase}
                descuento={descuento}
                volumenes={volumenes}
                calcFn={calcFn}
                onPrecioChange={(nuevoPrecio) =>
                  onTarifaChange(tipo, key, nuevoPrecio)
                }
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export function TarifasTable({
  tarifasTiempo,
  tarifasCPM,
  tarifasCPC,
  onTarifaChange,
  descuento,
}: TarifasTableProps) {
  const volLabelsTiempo = VOLUMENES_TIEMPO.map((v) => `${v}d`);
  const volLabelsCPM = VOLUMENES_CPM.map((v) => formatVolume(v));
  const volLabelsCPC = VOLUMENES_CPC.map((v) => formatVolume(v));

  return (
    <Card>
      <CardContent>
        <Tabs defaultValue="tiempo">
          <TabsList>
            <TabsTrigger value="tiempo">Tiempo de Exposición</TabsTrigger>
            <TabsTrigger value="cpm">Impresiones (CPM)</TabsTrigger>
            <TabsTrigger value="cpc">Clics (CPC)</TabsTrigger>
          </TabsList>

          <TabsContent value="tiempo" className="mt-4">
            <PricingTable
              tarifas={tarifasTiempo}
              tipo="tiempo"
              baseLabel="Precio Base/Día"
              volumenes={VOLUMENES_TIEMPO}
              volLabels={volLabelsTiempo}
              calcFn={calcularPrecioTiempo}
              descuento={descuento}
              onTarifaChange={onTarifaChange}
            />
          </TabsContent>

          <TabsContent value="cpm" className="mt-4">
            <PricingTable
              tarifas={tarifasCPM}
              tipo="cpm"
              baseLabel="CPM Base"
              volumenes={VOLUMENES_CPM}
              volLabels={volLabelsCPM}
              calcFn={calcularPrecioCPM}
              descuento={descuento}
              onTarifaChange={onTarifaChange}
            />
          </TabsContent>

          <TabsContent value="cpc" className="mt-4">
            <PricingTable
              tarifas={tarifasCPC}
              tipo="cpc"
              baseLabel="CPC Base"
              volumenes={VOLUMENES_CPC}
              volLabels={volLabelsCPC}
              calcFn={calcularPrecioCPC}
              descuento={descuento}
              onTarifaChange={onTarifaChange}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
