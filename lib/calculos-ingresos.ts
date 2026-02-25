import type {
  TierInput,
  TramoISR,
  DistribucionLinea,
  GastoOperativo,
} from "@/types";

export function calcularIngresoPorTier(
  usuarios: number,
  precioCRC: number,
  tipoCambio: number
): { usd: number; crc: number } {
  const crc = usuarios * precioCRC;
  return { crc, usd: crc / tipoCambio };
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
  let totalCRC = 0;
  for (const tier of tiers) {
    const ingresoTotal = tier.usuarios * tier.priceCRC;
    totalCRC += ingresoTotal / PERIOD_DIVISOR[tier.period];
  }
  return { crc: totalCRC, usd: totalCRC / tipoCambio };
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
  numSocios: number,
  tasaReinversion: number
): { reinversion: number; distributable: number; impuesto: number; totalDividendos: number; porSocio: number } {
  if (utilidadNeta <= 0) return { reinversion: 0, distributable: 0, impuesto: 0, totalDividendos: 0, porSocio: 0 };
  const reinversion = utilidadNeta * tasaReinversion;
  const distributable = utilidadNeta - reinversion;
  const brutoPorSocio = distributable / numSocios;
  const impuesto = brutoPorSocio * tasaDividendos * numSocios;
  const totalDividendos = distributable - impuesto;
  return { reinversion, distributable, impuesto, totalDividendos, porSocio: totalDividendos / numSocios };
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
