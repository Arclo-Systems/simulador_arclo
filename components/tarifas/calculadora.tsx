"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calcularTarifa } from "@/lib/calculos-tarifas";
import { formatUSD, formatCRC, formatPercent } from "@/lib/format";
import { AUDIENCIA_LABELS } from "@/lib/constants";
import type { AudienciaSlug, PlanPublicitario } from "@/types";

interface CalculadoraProps {
  tipoCambio: number;
  onTipoCambioChange: (value: number) => void;
}

const PLAN_OPTIONS: { value: PlanPublicitario; label: string }[] = [
  { value: "tiempo", label: "Tiempo de Exposición" },
  { value: "cpm", label: "Impresiones CPM" },
  { value: "cpc", label: "Clics CPC" },
];

const CANTIDAD_LABELS: Record<PlanPublicitario, string> = {
  tiempo: "Días",
  cpm: "Impresiones",
  cpc: "Clics",
};

function parseNum(value: string): number {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

export function Calculadora({ tipoCambio, onTipoCambioChange }: CalculadoraProps) {
  const [audiencia, setAudiencia] = useState<AudienciaSlug>("manejo");
  const [plan, setPlan] = useState<PlanPublicitario>("tiempo");
  const [cantidad, setCantidad] = useState(30);
  const [todosLosEspacios, setTodosLosEspacios] = useState(true);

  const result = useMemo(
    () => calcularTarifa(audiencia, plan, cantidad, todosLosEspacios, tipoCambio),
    [audiencia, plan, cantidad, todosLosEspacios, tipoCambio]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculadora de Pauta Publicitaria</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Audiencia</Label>
            <Select
              value={audiencia}
              onValueChange={(v) => setAudiencia(v as AudienciaSlug)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(AUDIENCIA_LABELS) as [AudienciaSlug, string][]).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Plan</Label>
            <Select
              value={plan}
              onValueChange={(v) => setPlan(v as PlanPublicitario)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLAN_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{CANTIDAD_LABELS[plan]}</Label>
            <Input
              type="number"
              min={0}
              value={cantidad}
              onChange={(e) => setCantidad(parseNum(e.target.value))}
            />
          </div>

          <div className="flex items-center gap-3 self-end pb-2">
            <Switch
              checked={todosLosEspacios}
              onCheckedChange={setTodosLosEspacios}
            />
            <Label>Descuento 25% (todos los espacios)</Label>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Cambio (CRC por USD)</Label>
            <Input
              type="number"
              min={0}
              value={tipoCambio}
              onChange={(e) => onTipoCambioChange(parseNum(e.target.value))}
            />
          </div>
        </div>

        <Card>
          <CardContent className="space-y-3 pt-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tarifa base por unidad</span>
              <span>{formatUSD(result.tarifaBasePorUnidad)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Descuento aplicado</span>
              <span>{formatPercent(result.descuentoAplicado)}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="font-semibold">Precio Total USD</span>
                <span className="text-2xl font-bold">
                  {formatUSD(result.precioTotalUSD)}
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-muted-foreground">Precio Total CRC</span>
                <span className="text-muted-foreground text-lg">
                  {formatCRC(result.precioTotalCRC)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
