"use client";

import { useReducer, useMemo } from "react";
import dynamic from "next/dynamic";
import type { Supuestos, TierInput, PlanSlug } from "@/types";
import {
  DEFAULT_SUPUESTOS,
  PRICING_TIERS,
  COSTO_IA_POR_USUARIO_MES_USD,
  MESES,
} from "@/lib/constants";
import {
  calcularIngresoMensualNormalizado,
  calcularCostoIA,
  calcularTotalGastosOperativos,
  calcularComisiones,
  calcularIVA,
  calcularISR,
  calcularDividendos,
} from "@/lib/calculos-ingresos";
import { SupuestosForm } from "@/components/modelo-ingresos/supuestos-form";
import { UsuariosPorPlan } from "@/components/modelo-ingresos/usuarios-por-plan";
import { ModeloMensual } from "@/components/modelo-ingresos/modelo-mensual";

const ResumenEjecutivo = dynamic(
  () => import("@/components/modelo-ingresos/resumen-ejecutivo").then((m) => m.ResumenEjecutivo),
  { ssr: false, loading: () => <div className="h-96 animate-pulse rounded-xl bg-muted" /> }
);

interface State {
  supuestos: Supuestos;
  tierInputs: TierInput[];
  usuariosFree: number;
  ingresosPatrocinadores: number;
  overrides: Record<number, number>;
}

type Action =
  | { type: "SET_SUPUESTOS"; payload: Supuestos }
  | { type: "SET_TIER_INPUTS"; payload: TierInput[] }
  | { type: "SET_USUARIOS_FREE"; payload: number }
  | { type: "SET_INGRESOS_PATROCINADORES"; payload: number }
  | { type: "SET_OVERRIDE"; payload: { mes: number; valor: number } };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_SUPUESTOS":
      return { ...state, supuestos: action.payload };
    case "SET_TIER_INPUTS":
      return { ...state, tierInputs: action.payload };
    case "SET_USUARIOS_FREE":
      return { ...state, usuariosFree: action.payload };
    case "SET_INGRESOS_PATROCINADORES":
      return { ...state, ingresosPatrocinadores: action.payload };
    case "SET_OVERRIDE":
      return {
        ...state,
        overrides: {
          ...state.overrides,
          [action.payload.mes]: action.payload.valor,
        },
      };
  }
}

const initialState: State = {
  supuestos: DEFAULT_SUPUESTOS,
  tierInputs: PRICING_TIERS.map((tier) => ({ ...tier, usuarios: 0 })),
  usuariosFree: 0,
  ingresosPatrocinadores: 0,
  overrides: {},
};

export default function ModeloIngresosPage() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const ingresoMensualNormalizado = useMemo(
    () => calcularIngresoMensualNormalizado(state.tierInputs, state.supuestos.tipoCambio),
    [state.tierInputs, state.supuestos.tipoCambio]
  );

  const totalProUsers = useMemo(
    () =>
      state.tierInputs.reduce((sum, t) => t.plan === "pro" ? sum + t.usuarios : sum, 0),
    [state.tierInputs]
  );

  const costoIA = useMemo(
    () =>
      calcularCostoIA(
        totalProUsers,
        COSTO_IA_POR_USUARIO_MES_USD,
        state.supuestos.tipoCambio
      ),
    [totalProUsers, state.supuestos.tipoCambio]
  );

  const totalGastosOp = useMemo(
    () =>
      calcularTotalGastosOperativos(state.supuestos.gastosOperativos) +
      costoIA.crc,
    [state.supuestos.gastosOperativos, costoIA.crc]
  );

  const ingresoPatrocinadoresCRC = state.ingresosPatrocinadores * state.supuestos.tipoCambio;

  const monthlyResults = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const ingresoBruto =
        state.overrides[i] !== undefined
          ? state.overrides[i]
          : ingresoMensualNormalizado.crc + ingresoPatrocinadoresCRC;
      const comisiones = calcularComisiones(
        ingresoBruto,
        state.supuestos.distribucionLineas
      );
      const ingresoNetoComisiones = ingresoBruto - comisiones;
      const iva = calcularIVA(
        ingresoNetoComisiones,
        state.supuestos.tasaIVA,
        state.supuestos.creditoFiscalIVA,
        totalGastosOp
      );
      const ingresoPostIVA = ingresoNetoComisiones - iva.ivaNeto;
      const utilidadBruta = ingresoPostIVA - totalGastosOp;

      return {
        ingresoBruto,
        comisiones,
        ingresoNetoComisiones,
        iva,
        ingresoPostIVA,
        utilidadBruta,
      };
    });
  }, [
    state.overrides,
    ingresoMensualNormalizado.crc,
    ingresoPatrocinadoresCRC,
    state.supuestos.distribucionLineas,
    state.supuestos.tasaIVA,
    state.supuestos.creditoFiscalIVA,
    totalGastosOp,
  ]);

  const resultadoAnual = useMemo(() => {
    let ingresoBrutoAnual = 0;
    let comisionesAnuales = 0;
    let ivaNetoAnual = 0;
    let utilidadGravable = 0;
    for (const r of monthlyResults) {
      ingresoBrutoAnual += r.ingresoBruto;
      comisionesAnuales += r.comisiones;
      ivaNetoAnual += r.iva.ivaNeto;
      utilidadGravable += r.utilidadBruta;
    }
    const gastosOpAnuales = totalGastosOp * 12;

    const isr = calcularISR(
      utilidadGravable,
      ingresoBrutoAnual,
      state.supuestos.tramosISR,
      state.supuestos.umbralTarifaPlena,
      state.supuestos.tasaPlena
    );
    const utilidadPostISR = utilidadGravable - isr;
    const dividendos = calcularDividendos(
      utilidadPostISR,
      state.supuestos.tasaDividendos,
      state.supuestos.numSocios,
      state.supuestos.tasaReinversion
    );
    const utilidadNeta = dividendos.totalDividendos;
    const cargaTributariaTotal =
      comisionesAnuales + ivaNetoAnual + gastosOpAnuales + isr + dividendos.impuesto;

    return {
      ingresoBrutoAnual,
      comisionesAnuales,
      ivaNeto: ivaNetoAnual,
      gastosOperativosAnuales: gastosOpAnuales,
      utilidadGravable,
      isr,
      utilidadPostISR,
      reinversion: dividendos.reinversion,
      impuestoDividendos: dividendos.impuesto,
      utilidadNeta,
      dividendoPorSocio: dividendos.porSocio,
      dividendoMensualPorSocio: dividendos.porSocio / 12,
      cargaTributariaTotal,
    };
  }, [
    monthlyResults,
    totalGastosOp,
    state.supuestos.tramosISR,
    state.supuestos.umbralTarifaPlena,
    state.supuestos.tasaPlena,
    state.supuestos.tasaDividendos,
    state.supuestos.tasaReinversion,
    state.supuestos.numSocios,
  ]);

  const resumenUsuarios = useMemo(() => {
    const plans: PlanSlug[] = ["basico", "plus", "pro"];
    const usuariosPorPlan = {} as Record<PlanSlug, number>;
    for (const plan of plans) {
      usuariosPorPlan[plan] = state.tierInputs
        .filter((t) => t.plan === plan)
        .reduce((sum, t) => sum + t.usuarios, 0);
    }
    const totalPagos = plans.reduce((s, p) => s + usuariosPorPlan[p], 0);
    const totalUsuarios = totalPagos + state.usuariosFree;
    const arpu =
      totalPagos > 0 ? ingresoMensualNormalizado.usd / totalPagos : 0;

    return {
      totalUsuarios,
      usuariosPorPlan,
      usuariosFree: state.usuariosFree,
      arpu,
      ingresoMensualNormalizadoUSD: ingresoMensualNormalizado.usd,
      ingresoMensualNormalizadoCRC: ingresoMensualNormalizado.crc,
      costoIATotal: costoIA.crc,
    };
  }, [
    state.tierInputs,
    state.usuariosFree,
    ingresoMensualNormalizado,
    costoIA.crc,
  ]);

  const datosMensuales = useMemo(
    () =>
      MESES.map((mes, i) => ({
        mes,
        ingresos: monthlyResults[i].ingresoBruto,
        gastos: totalGastosOp,
      })),
    [monthlyResults, totalGastosOp]
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Modelo de Ingresos</h1>
        <p className="text-muted-foreground">
          Proyecci&oacute;n financiera &mdash; Startup Tecnol&oacute;gica | S.A. PYME Costa Rica
        </p>
      </div>

      <details className="group">
        <summary className="cursor-pointer text-lg font-semibold">
          Supuestos
        </summary>
        <div className="mt-4">
          <SupuestosForm
            supuestos={state.supuestos}
            onChange={(s) => dispatch({ type: "SET_SUPUESTOS", payload: s })}
          />
        </div>
      </details>

      <UsuariosPorPlan
        tierInputs={state.tierInputs}
        onChange={(tiers) =>
          dispatch({ type: "SET_TIER_INPUTS", payload: tiers })
        }
        usuariosFree={state.usuariosFree}
        onUsuariosFreeChange={(n) =>
          dispatch({ type: "SET_USUARIOS_FREE", payload: n })
        }
        ingresosPatrocinadores={state.ingresosPatrocinadores}
        onIngresosPatrocinadoresChange={(n) =>
          dispatch({ type: "SET_INGRESOS_PATROCINADORES", payload: n })
        }
        tipoCambio={state.supuestos.tipoCambio}
      />

      <ModeloMensual
        supuestos={state.supuestos}
        ingresoMensualBaseCRC={ingresoMensualNormalizado.crc}
        costoIAMensualCRC={costoIA.crc}
        onOverride={(mes, valor) =>
          dispatch({ type: "SET_OVERRIDE", payload: { mes, valor } })
        }
        overrides={state.overrides}
      />

      <ResumenEjecutivo
        resultadoAnual={resultadoAnual}
        resumenUsuarios={resumenUsuarios}
        datosMensuales={datosMensuales}
        tipoCambio={state.supuestos.tipoCambio}
      />
    </div>
  );
}
