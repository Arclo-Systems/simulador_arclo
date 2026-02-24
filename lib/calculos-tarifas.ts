import type { AudienciaSlug, PlanPublicitario, CalculadoraResult } from "@/types";
import {
  TARIFAS_TIEMPO,
  TARIFAS_CPM,
  TARIFAS_CPC,
  DESCUENTO_TODOS_ESPACIOS,
} from "./constants";

export function calcularPrecioTiempo(
  precioBaseDia: number,
  dias: number,
  descuento: number
): number {
  return precioBaseDia * dias * (1 - descuento);
}

export function calcularPrecioCPM(
  cpmBase: number,
  impresiones: number,
  descuento: number
): number {
  return cpmBase * (impresiones / 1000) * (1 - descuento);
}

export function calcularPrecioCPC(
  cpcBase: number,
  clics: number,
  descuento: number
): number {
  return cpcBase * clics * (1 - descuento);
}

const TARIFA_MAP = {
  tiempo: TARIFAS_TIEMPO,
  cpm: TARIFAS_CPM,
  cpc: TARIFAS_CPC,
};

const CALC_MAP = {
  tiempo: calcularPrecioTiempo,
  cpm: calcularPrecioCPM,
  cpc: calcularPrecioCPC,
};

export function calcularTarifa(
  audiencia: AudienciaSlug,
  plan: PlanPublicitario,
  cantidad: number,
  todosLosEspacios: boolean,
  tipoCambio: number
): CalculadoraResult {
  const tarifa = TARIFA_MAP[plan][audiencia];
  const descuento = todosLosEspacios ? DESCUENTO_TODOS_ESPACIOS : 0;
  const precioTotalUSD = CALC_MAP[plan](tarifa.precioBase, cantidad, descuento);

  return {
    tarifaBasePorUnidad: tarifa.precioBase,
    descuentoAplicado: descuento,
    precioTotalUSD,
    precioTotalCRC: precioTotalUSD * tipoCambio,
  };
}
