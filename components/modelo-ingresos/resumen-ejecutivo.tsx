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

export function ResumenEjecutivo({
  resultadoAnual,
  resumenUsuarios,
  datosMensuales,
  tipoCambio,
}: ResumenEjecutivoProps) {
  const pieData = [
    { name: "Comisiones", value: resultadoAnual.comisionesAnuales, color: "#f97316" },
    { name: "IVA Neto", value: resultadoAnual.ivaNeto, color: "#eab308" },
    { name: "Gastos Op.", value: resultadoAnual.gastosOperativosAnuales, color: "#3b82f6" },
    { name: "ISR", value: resultadoAnual.isr, color: "#ef4444" },
    { name: "Imp. Dividendos", value: resultadoAnual.impuestoDividendos, color: "#a855f7" },
    { name: "Utilidad Neta", value: resultadoAnual.utilidadNeta, color: "#22c55e" },
  ];

  const cargaPorcentaje =
    resultadoAnual.ingresoBrutoAnual > 0
      ? resultadoAnual.cargaTributariaTotal / resultadoAnual.ingresoBrutoAnual
      : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ingreso Bruto Anual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCRC(resultadoAnual.ingresoBrutoAnual)}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatUSD(resultadoAnual.ingresoBrutoAnual / tipoCambio)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Utilidad Neta Anual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCRC(resultadoAnual.utilidadNeta)}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatUSD(resultadoAnual.utilidadNeta / tipoCambio)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Carga Tributaria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCRC(resultadoAnual.cargaTributariaTotal)}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatPercent(cargaPorcentaje)} del ingreso bruto
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Dividendo Mensual/Socio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatCRC(resultadoAnual.dividendoMensualPorSocio)}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatUSD(resultadoAnual.dividendoMensualPorSocio / tipoCambio)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Usuarios Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatNumber(resumenUsuarios.totalUsuarios)}
            </p>
            <p className="text-sm text-muted-foreground">
              {Object.entries(resumenUsuarios.usuariosPorPlan)
                .map(([plan, cantidad]) => `${plan}: ${formatNumber(cantidad)}`)
                .join(" · ")}
              {resumenUsuarios.usuariosFree > 0 &&
                ` · Free: ${formatNumber(resumenUsuarios.usuariosFree)}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              ARPU
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {formatUSD(resumenUsuarios.arpu)}
            </p>
            <p className="text-sm text-muted-foreground">
              Ingreso promedio por usuario
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribución del Ingreso Bruto</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name ?? ""} ${((percent ?? 0) * 100).toFixed(1)}%`
                  }
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ingresos vs Gastos Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosMensuales}>
                <XAxis dataKey="mes" />
                <YAxis />
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
                <Bar dataKey="ingresos" name="Ingresos" fill="#22c55e" />
                <Bar dataKey="gastos" name="Gastos" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
