export type PlanSlug = "basico" | "plus" | "pro";
export type PeriodSlug = "mensual" | "trimestral" | "anual";
export type ModuleCount = 1 | 2 | 3 | 4;

export interface PricingTier {
  plan: PlanSlug;
  period: PeriodSlug;
  moduleCount: ModuleCount;
  priceCRC: number;
}

export interface TierInput extends PricingTier {
  usuarios: number;
}

export interface TramoISR {
  hasta: number;
  tasa: number;
  nota: string;
}

export interface GastoOperativo {
  concepto: string;
  montoMensualCRC: number;
  detalle: string;
}

export interface DistribucionLinea {
  nombre: string;
  porcentaje: number;
  comisionPlataforma: number;
}

export interface Supuestos {
  tipoCambio: number;
  tasaIVA: number;
  creditoFiscalIVA: number;
  tramosISR: TramoISR[];
  umbralTarifaPlena: number;
  tasaPlena: number;
  tasaDividendos: number;
  tasaReinversion: number;
  comisionInApp: number;
  comisionSINPE: number;
  comisionPasarela: number;
  patenteMunicipal: number;
  timbresEducacion: number;
  numSocios: number;
  gastosOperativos: GastoOperativo[];
  distribucionLineas: DistribucionLinea[];
}

export interface IngresoMensual {
  mes: string;
  ingresoBrutoCRC: number;
  override: boolean;
}

export interface ResultadoMensual {
  mes: string;
  ingresoBruto: number;
  comisiones: number;
  ingresoNetoComisiones: number;
  ivaCobrado: number;
  ivaCredito: number;
  ivaNeto: number;
  ingresoPostIVA: number;
  gastosOperativos: number;
  utilidadBruta: number;
}

export interface ResultadoAnual {
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
}

export interface ResumenUsuarios {
  totalUsuarios: number;
  usuariosPorPlan: Record<PlanSlug, number>;
  usuariosFree: number;
  arpu: number;
  ingresoMensualNormalizadoUSD: number;
  ingresoMensualNormalizadoCRC: number;
  costoIATotal: number;
}

export type AudienciaSlug = "manejo" | "bachillerato" | "universidades";
export type PlanPublicitario = "tiempo" | "cpm" | "cpc";

export interface TarifaBase {
  audiencia: AudienciaSlug;
  precioBase: number;
}

export interface CalculadoraInput {
  audiencia: AudienciaSlug;
  plan: PlanPublicitario;
  cantidad: number;
  todosLosEspacios: boolean;
}

export interface CalculadoraResult {
  tarifaBasePorUnidad: number;
  descuentoAplicado: number;
  precioTotalUSD: number;
  precioTotalCRC: number;
}
