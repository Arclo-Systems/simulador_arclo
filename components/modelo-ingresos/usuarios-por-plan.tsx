"use client";

import { Fragment, useCallback, useMemo } from "react";
import type {
  TierInput,
  PlanSlug,
  PeriodSlug,
  ModuleCount,
} from "@/types";
import {
  PLAN_LABELS,
  PERIOD_LABELS,
  COSTO_IA_POR_USUARIO_MES_USD,
} from "@/lib/constants";
import { formatUSD, formatCRC } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UsuariosPorPlanProps {
  tierInputs: TierInput[];
  onChange: (tiers: TierInput[]) => void;
  usuariosFree: number;
  onUsuariosFreeChange: (n: number) => void;
  ingresosPatrocinadores: number;
  onIngresosPatrocinadoresChange: (n: number) => void;
  tipoCambio: number;
}

const PLANS: PlanSlug[] = ["basico", "plus", "pro"];
const PERIODS: PeriodSlug[] = ["mensual", "trimestral", "anual"];
const MODULE_COUNTS: ModuleCount[] = [1, 2, 3, 4];

function findTier(
  tiers: TierInput[],
  plan: PlanSlug,
  period: PeriodSlug,
  moduleCount: ModuleCount
): TierInput | undefined {
  return tiers.find(
    (t) =>
      t.plan === plan &&
      t.period === period &&
      t.moduleCount === moduleCount
  );
}

function moduleLabel(count: ModuleCount): string {
  return count === 1 ? "1 Mod" : `Pack ${count}`;
}

export function UsuariosPorPlan({
  tierInputs,
  onChange,
  usuariosFree,
  onUsuariosFreeChange,
  ingresosPatrocinadores,
  onIngresosPatrocinadoresChange,
  tipoCambio,
}: UsuariosPorPlanProps) {
  const handleUsuariosChange = useCallback(
    (plan: PlanSlug, period: PeriodSlug, moduleCount: ModuleCount, value: number) => {
      const next = tierInputs.map((t) =>
        t.plan === plan && t.period === period && t.moduleCount === moduleCount
          ? { ...t, usuarios: value }
          : t
      );
      onChange(next);
    },
    [tierInputs, onChange]
  );

  const rowRevenue = useCallback(
    (plan: PlanSlug, period: PeriodSlug): number => {
      return MODULE_COUNTS.reduce((sum, mc) => {
        const tier = findTier(tierInputs, plan, period, mc);
        if (!tier) return sum;
        return sum + tier.usuarios * tier.priceCRC;
      }, 0);
    },
    [tierInputs]
  );

  const columnTotals = useMemo(() => {
    return MODULE_COUNTS.map((mc) => {
      let users = 0;
      let revenue = 0;
      for (const plan of PLANS) {
        for (const period of PERIODS) {
          const tier = findTier(tierInputs, plan, period, mc);
          if (tier) {
            users += tier.usuarios;
            revenue += tier.usuarios * tier.priceCRC;
          }
        }
      }
      return { users, revenue };
    });
  }, [tierInputs]);

  const grandTotal = useMemo(() => {
    const users = columnTotals.reduce((s, c) => s + c.users, 0);
    const revenueCRC = columnTotals.reduce((s, c) => s + c.revenue, 0);
    return {
      users,
      revenueCRC,
      revenueUSD: revenueCRC / tipoCambio,
      arpu: users > 0 ? revenueCRC / users : 0,
    };
  }, [columnTotals, tipoCambio]);

  const totalProUsers = useMemo(() => {
    return tierInputs.reduce((sum, t) => t.plan === "pro" ? sum + t.usuarios : sum, 0);
  }, [tierInputs]);

  const costoIA = totalProUsers * COSTO_IA_POR_USUARIO_MES_USD;

  const renderPlanSection = (plan: PlanSlug) => (
    <Fragment key={plan}>
      <TableRow>
        <TableCell
          colSpan={6}
          className="bg-muted/50 font-semibold text-xs uppercase tracking-wider"
        >
          {PLAN_LABELS[plan]}
        </TableCell>
      </TableRow>
      {PERIODS.map((period) => {
        const rev = rowRevenue(plan, period);
        return (
          <TableRow key={`${plan}-${period}`}>
            <TableCell className="font-medium text-xs">
              {PERIOD_LABELS[period]}
            </TableCell>
            {MODULE_COUNTS.map((mc) => {
              const tier = findTier(tierInputs, plan, period, mc);
              if (!tier) return <TableCell key={mc} />;
              return (
                <TableCell
                  key={mc}
                  className="bg-blue-50 dark:bg-blue-950/20"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-muted-foreground">
                      {formatCRC(tier.priceCRC)}
                    </span>
                    <Input
                      type="number"
                      min={0}
                      value={tier.usuarios}
                      onChange={(e) =>
                        handleUsuariosChange(
                          plan,
                          period,
                          mc,
                          Math.max(0, parseInt(e.target.value, 10) || 0)
                        )
                      }
                      className="h-7 w-20 text-xs px-1.5"
                      aria-label={`Usuarios ${PLAN_LABELS[plan]} ${PERIOD_LABELS[period]} ${moduleLabel(mc)}`}
                    />
                  </div>
                </TableCell>
              );
            })}
            <TableCell className="bg-green-50 dark:bg-green-950/20 text-right font-mono text-xs">
              {formatCRC(rev)}
            </TableCell>
          </TableRow>
        );
      })}
    </Fragment>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuarios por Plan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28">Plan / Período</TableHead>
              {MODULE_COUNTS.map((mc) => (
                <TableHead key={mc} className="text-center">
                  {moduleLabel(mc)}
                </TableHead>
              ))}
              <TableHead className="text-right">Ingreso</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PLANS.map((plan) => renderPlanSection(plan))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell className="font-semibold text-xs">
                Total Usuarios
              </TableCell>
              {columnTotals.map((col, i) => (
                <TableCell key={i} className="text-center font-mono text-xs tabular-nums">
                  {col.users}
                </TableCell>
              ))}
              <TableCell className="text-right font-mono text-xs font-semibold">
                {grandTotal.users}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold text-xs">
                Total Ingreso
              </TableCell>
              {columnTotals.map((col, i) => (
                <TableCell
                  key={i}
                  className="bg-green-50 dark:bg-green-950/20 text-center font-mono text-xs"
                >
                  {formatCRC(col.revenue)}
                </TableCell>
              ))}
              <TableCell className="bg-green-50 dark:bg-green-950/20 text-right font-mono text-xs font-semibold">
                {formatCRC(grandTotal.revenueCRC)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold text-xs">
                Total USD
              </TableCell>
              <TableCell
                colSpan={4}
              />
              <TableCell className="bg-green-50 dark:bg-green-950/20 text-right font-mono text-xs font-semibold">
                {formatUSD(grandTotal.revenueUSD)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold text-xs">
                ARPU (₡)
              </TableCell>
              <TableCell
                colSpan={4}
              />
              <TableCell className="text-right font-mono text-xs font-semibold">
                {formatCRC(grandTotal.arpu)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="usuarios-free">
              Usuarios Free (solo videos)
            </Label>
            <Input
              id="usuarios-free"
              type="number"
              min={0}
              value={usuariosFree}
              onChange={(e) =>
                onUsuariosFreeChange(Math.max(0, parseInt(e.target.value, 10) || 0))
              }
              className="h-8 bg-blue-50 dark:bg-blue-950/20"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ingresos-patrocinadores">
              Ingresos Patrocinadores (USD/mes)
            </Label>
            <Input
              id="ingresos-patrocinadores"
              type="number"
              min={0}
              step={0.01}
              value={ingresosPatrocinadores}
              onChange={(e) =>
                onIngresosPatrocinadoresChange(
                  Math.max(0, parseFloat(e.target.value) || 0)
                )
              }
              className="h-8 bg-blue-50 dark:bg-blue-950/20"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Costo IA (calculado)</Label>
            <div className="flex h-8 items-center rounded-md border bg-muted px-3 text-sm font-mono">
              {formatUSD(costoIA)}
              <span className="ml-1 text-xs text-muted-foreground">
                ({totalProUsers} Pro x ${COSTO_IA_POR_USUARIO_MES_USD}/mes)
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
