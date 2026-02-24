import type {
  TierInput,
  TramoISR,
  DistribucionLinea,
  GastoOperativo,
} from "@/types";

export function calcularIngresoPorTier(
  usuarios: number,
  precioUSD: number,
  tipoCambio: number
): { usd: number; crc: number } {
  const usd = usuarios * precioUSD;
  return { usd, crc: usd * tipoCambio };
}

const PERIOD_DIVISOR: Record<string, number> = {
  mensual: 1,
  trimestral: 3,
  anual: 12,
};

export function calcularIngresoMensualNormalizado(
  tiers: TierInput[],
  tipoCambio: number
): { usd: number; crc: number } {
  let totalUSD = 0;
  for (const tier of tiers) {
    const ingresoTotal = tier.usuarios * tier.priceUSD;
    totalUSD += ingresoTotal / PERIOD_DIVISOR[tier.period];
  }
  return { usd: totalUSD, crc: totalUSD * tipoCambio };
}

export function calcularComisiones(
  ingresoBruto: number,
  distribucion: DistribucionLinea[]
): number {
  let total = 0;
  for (const linea of distribucion) {
    total += ingresoBruto * linea.porcentaje * linea.comisionPlataforma;
  }
  return total;
}

export function calcularIVA(
  ingresoNeto: number,
  tasaIVA: number,
  creditoFiscal: number,
  gastosMensuales: number
): { ivaCobrado: number; ivaCredito: number; ivaNeto: number } {
  const ivaCobrado = ingresoNeto * tasaIVA;
  const ivaCredito = gastosMensuales * creditoFiscal;
  return { ivaCobrado, ivaCredito, ivaNeto: ivaCobrado - ivaCredito };
}

export function calcularISRPorTramos(
  utilidadGravable: number,
  tramos: TramoISR[]
): number {
  let isr = 0;
  let restante = utilidadGravable;
  let limiteAnterior = 0;

  for (const tramo of tramos) {
    const baseGravable = Math.min(restante, tramo.hasta - limiteAnterior);
    if (baseGravable <= 0) break;
    isr += baseGravable * tramo.tasa;
    restante -= baseGravable;
    limiteAnterior = tramo.hasta;
  }

  return isr;
}

export function calcularISR(
  utilidadGravable: number,
  ingresoBrutoAnual: number,
  tramos: TramoISR[],
  umbralTarifaPlena: number,
  tasaPlena: number
): number {
  if (utilidadGravable <= 0) return 0;
  if (ingresoBrutoAnual > umbralTarifaPlena) {
    return utilidadGravable * tasaPlena;
  }
  return calcularISRPorTramos(utilidadGravable, tramos);
}

export function calcularDividendos(
  utilidadNeta: number,
  tasaDividendos: number,
  numSocios: number
): { impuesto: number; totalDividendos: number; porSocio: number } {
  if (utilidadNeta <= 0) return { impuesto: 0, totalDividendos: 0, porSocio: 0 };
  const impuesto = utilidadNeta * tasaDividendos;
  const totalDividendos = utilidadNeta - impuesto;
  return { impuesto, totalDividendos, porSocio: totalDividendos / numSocios };
}

export function calcularCostoIA(
  usuariosPro: number,
  costoPorUsuarioUSD: number,
  tipoCambio: number
): { usd: number; crc: number } {
  const usd = usuariosPro * costoPorUsuarioUSD;
  return { usd, crc: usd * tipoCambio };
}

export function calcularTotalGastosOperativos(
  gastos: GastoOperativo[]
): number {
  return gastos.reduce((sum, g) => sum + g.montoMensualCRC, 0);
}
