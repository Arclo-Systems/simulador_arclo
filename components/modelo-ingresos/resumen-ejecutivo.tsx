"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCRC, formatUSD, formatPercent, formatNumber } from "@/lib/format";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ResumenEjecutivoProps {
  resultadoAnual: {
    ingresoBrutoAnual: number;
    comisionesAnuales: number;
    ivaNeto: number;
    gastosOperativosAnuales: number;
    utilidadGravable: number;
    isr: number;
    utilidadPostISR: number;
    reinversion: number;
    impuestoDividendos: number;
    utilidadNeta: number;
    dividendoPorSocio: number;
    dividendoMensualPorSocio: number;
    cargaTributariaTotal: number;
  };
  resumenUsuarios: {
    totalUsuarios: number;
    usuariosPorPlan: Record<string, number>;
    usuariosFree: number;
    arpu: number;
    ingresoMensualNormalizadoUSD: number;
    ingresoMensualNormalizadoCRC: number;
    costoIATotal: number;
  };
  datosMensuales: Array<{
    mes: string;
    ingresos: number;
    gastos: number;
  }>;
  tipoCambio: number;
}

const METRIC_CARDS = [
  { key: "ingresoBruto", label: "Ingreso Bruto Anual" },
  { key: "utilidadNeta", label: "Utilidad Neta Anual" },
  { key: "cargaTributaria", label: "Carga Tributaria" },
  { key: "reinversion", label: "Reinversión (20%)" },
  { key: "dividendo", label: "Dividendo Mensual/Socio" },
  { key: "usuarios", label: "Usuarios Totales" },
  { key: "arpu", label: "ARPU" },
] as const;

export function ResumenEjecutivo({
  resultadoAnual,
  resumenUsuarios,
  datosMensuales,
  tipoCambio,
}: ResumenEjecutivoProps) {
  const pieDataRaw = [
    { name: "Comisiones", value: resultadoAnual.comisionesAnuales, color: "#f59e0b" },
    { name: "IVA Neto", value: resultadoAnual.ivaNeto, color: "#eab308" },
    { name: "Gastos Op.", value: resultadoAnual.gastosOperativosAnuales, color: "#3b82f6" },
    { name: "ISR", value: resultadoAnual.isr, color: "#f43f5e" },
    { name: "Imp. Dividendos", value: resultadoAnual.impuestoDividendos, color: "#a855f7" },
    { name: "Reinversión", value: resultadoAnual.reinversion, color: "#6366f1" },
    { name: "Dividendos Netos", value: resultadoAnual.utilidadNeta, color: "#14b8a6" },
  ];

  const pieData = pieDataRaw.filter((d) => d.value > 0);
  const hasPieData = pieData.length > 0;

  const cargaPorcentaje =
    resultadoAnual.ingresoBrutoAnual > 0
      ? resultadoAnual.cargaTributariaTotal / resultadoAnual.ingresoBrutoAnual
      : 0;

  function renderMetricCard(key: (typeof METRIC_CARDS)[number]["key"], label: string, index: number) {
    let primary: string;
    let secondary: string;

    switch (key) {
      case "ingresoBruto":
        primary = formatCRC(resultadoAnual.ingresoBrutoAnual);
        secondary = formatUSD(resultadoAnual.ingresoBrutoAnual / tipoCambio);
        break;
      case "utilidadNeta":
        primary = formatCRC(resultadoAnual.utilidadNeta);
        secondary = formatUSD(resultadoAnual.utilidadNeta / tipoCambio);
        break;
      case "cargaTributaria":
        primary = formatCRC(resultadoAnual.cargaTributariaTotal);
        secondary = `${formatPercent(cargaPorcentaje)} del ingreso bruto`;
        break;
      case "reinversion":
        primary = formatCRC(resultadoAnual.reinversion);
        secondary = formatUSD(resultadoAnual.reinversion / tipoCambio);
        break;
      case "dividendo":
        primary = formatCRC(resultadoAnual.dividendoMensualPorSocio);
        secondary = formatUSD(resultadoAnual.dividendoMensualPorSocio / tipoCambio);
        break;
      case "usuarios":
        primary = formatNumber(resumenUsuarios.totalUsuarios);
        secondary = Object.entries(resumenUsuarios.usuariosPorPlan)
          .map(([plan, cantidad]) => `${plan}: ${formatNumber(cantidad)}`)
          .join(" · ") +
          (resumenUsuarios.usuariosFree > 0
            ? ` · Free: ${formatNumber(resumenUsuarios.usuariosFree)}`
            : "");
        break;
      case "arpu":
        primary = formatUSD(resumenUsuarios.arpu);
        secondary = "Ingreso promedio por usuario";
        break;
    }

    return (
      <Card key={key} className={`animate-fade-in-up stagger-${index + 1}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
            {label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold tabular-nums">{primary}</p>
          <p className="mt-0.5 text-sm text-muted-foreground truncate">{secondary}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {METRIC_CARDS.map((card, i) => renderMetricCard(card.key, card.label, i))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle>Distribución del Ingreso Bruto</CardTitle>
          </CardHeader>
          <CardContent>
            {hasPieData ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }: { name?: string; percent?: number }) =>
                      `${name ?? ""} ${((percent ?? 0) * 100).toFixed(1)}%`
                    }
                    style={{ fontSize: 12 }}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value?: number | string) =>
                      formatCRC(
                        typeof value === "string"
                          ? parseFloat(value)
                          : (value ?? 0)
                      )
                    }
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                Ingrese usuarios para ver la distribución
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="animate-scale-in stagger-1">
          <CardHeader>
            <CardTitle>Ingresos vs Gastos Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosMensuales}>
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value?: number | string) =>
                    formatCRC(
                      typeof value === "string"
                        ? parseFloat(value)
                        : (value ?? 0)
                    )
                  }
                />
                <Legend />
                <Bar dataKey="ingresos" name="Ingresos" fill="#14b8a6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="gastos" name="Gastos" fill="#f43f5e" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
