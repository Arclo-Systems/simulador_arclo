import type {
  PricingTier,
  TramoISR,
  GastoOperativo,
  DistribucionLinea,
  Supuestos,
  TarifaBase,
} from "@/types";

const buildTiers = (): PricingTier[] => {
  const prices: Record<string, number[]> = {
    "basico-mensual": [2_500, 4_000, 5_000, 6_000],
    "basico-trimestral": [6_000, 9_600, 12_000, 13_500],
    "basico-anual": [18_000, 28_800, 36_000, 40_000],
    "plus-mensual": [4_500, 7_200, 9_000, 10_800],
    "plus-trimestral": [10_800, 17_280, 21_600, 24_300],
    "plus-anual": [32_400, 51_840, 64_800, 72_000],
    "pro-mensual": [7_000, 11_200, 14_000, 16_800],
    "pro-trimestral": [16_800, 26_880, 33_600, 37_800],
    "pro-anual": [50_400, 80_640, 100_800, 112_000],
  };

  const tiers: PricingTier[] = [];
  for (const [key, values] of Object.entries(prices)) {
    const [plan, period] = key.split("-") as [PricingTier["plan"], PricingTier["period"]];
    values.forEach((price, i) => {
      tiers.push({
        plan,
        period,
        moduleCount: (i + 1) as PricingTier["moduleCount"],
        priceCRC: price,
      });
    });
  }
  return tiers;
};

export const PRICING_TIERS: PricingTier[] = buildTiers();

export const DEFAULT_TRAMOS_ISR: TramoISR[] = [
  { hasta: 5_761_000, tasa: 0.05, nota: "Hasta ₡5.761.000" },
  { hasta: 8_643_000, tasa: 0.1, nota: "De ₡5.761.001 a ₡8.643.000" },
  { hasta: 17_286_000, tasa: 0.15, nota: "De ₡8.643.001 a ₡17.286.000" },
  { hasta: 999_999_999, tasa: 0.2, nota: "Exceso sobre ₡17.286.000" },
];

export const DEFAULT_GASTOS: GastoOperativo[] = [
  { concepto: "Hosting / Servidores (AWS, GCP, Azure)", montoMensualCRC: 0, detalle: "Modifique según su caso" },
  { concepto: "Dominio y certificados SSL", montoMensualCRC: 0, detalle: "Modifique según su caso" },
  { concepto: "Licencias de software / APIs / herramientas", montoMensualCRC: 70_000, detalle: "Modifique según su caso" },
  { concepto: "Internet y telecomunicaciones", montoMensualCRC: 0, detalle: "Modifique según su caso" },
  { concepto: "Contabilidad y asesoría legal", montoMensualCRC: 30_000, detalle: "Modifique según su caso" },
  { concepto: "Publicidad y marketing digital", montoMensualCRC: 0, detalle: "Modifique según su caso" },
  { concepto: "Cuenta de desarrollador Apple ($99/año)", montoMensualCRC: 4_001, detalle: "~$99/12 mensualizado" },
  { concepto: "Cuenta de desarrollador Google ($25 único)", montoMensualCRC: 1_010, detalle: "Pago único prorrateado" },
  { concepto: "Otros gastos deducibles", montoMensualCRC: 5_833, detalle: "Modifique según su caso" },
];

export const DEFAULT_DISTRIBUCION: DistribucionLinea[] = [
  { nombre: "Apps (In-App via Google/Apple)", porcentaje: 1, comisionPlataforma: 0.15 },
  { nombre: "Apps (In-App via SINPE Móvil)", porcentaje: 0, comisionPlataforma: 0 },
  { nombre: "SaaS (Suscripciones)", porcentaje: 0, comisionPlataforma: 0.035 },
  { nombre: "Productos a la medida (Web/IA)", porcentaje: 0, comisionPlataforma: 0.035 },
];

export const DEFAULT_SUPUESTOS: Supuestos = {
  tipoCambio: 485,
  tasaIVA: 0.13,
  creditoFiscalIVA: 0.13,
  tramosISR: DEFAULT_TRAMOS_ISR,
  umbralTarifaPlena: 112_170_000,
  tasaPlena: 0.3,
  tasaDividendos: 0.15,
  comisionInApp: 0.15,
  comisionSINPE: 0,
  comisionPasarela: 0,
  patenteMunicipal: 0,
  timbresEducacion: 0,
  numSocios: 4,
  gastosOperativos: DEFAULT_GASTOS,
  distribucionLineas: DEFAULT_DISTRIBUCION,
};

export const MESES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
] as const;

export const TARIFAS_TIEMPO: Record<string, TarifaBase> = {
  manejo: { audiencia: "manejo", precioBase: 13.5 },
  bachillerato: { audiencia: "bachillerato", precioBase: 10.5 },
  universidades: { audiencia: "universidades", precioBase: 10.5 },
};

export const TARIFAS_CPM: Record<string, TarifaBase> = {
  manejo: { audiencia: "manejo", precioBase: 18 },
  bachillerato: { audiencia: "bachillerato", precioBase: 9 },
  universidades: { audiencia: "universidades", precioBase: 9 },
};

export const TARIFAS_CPC: Record<string, TarifaBase> = {
  manejo: { audiencia: "manejo", precioBase: 9 },
  bachillerato: { audiencia: "bachillerato", precioBase: 6 },
  universidades: { audiencia: "universidades", precioBase: 6 },
};

export const VOLUMENES_TIEMPO = [1, 30, 90, 180, 365];
export const VOLUMENES_CPM = [1_000, 5_000, 10_000, 50_000, 100_000];
export const VOLUMENES_CPC = [100, 500, 1_000, 5_000, 10_000];

export const DESCUENTO_TODOS_ESPACIOS = 0.25;

export const COSTO_IA_POR_USUARIO_MES_USD = 1;

export const PLAN_LABELS: Record<string, string> = {
  basico: "Básico",
  plus: "Plus",
  pro: "Pro",
};

export const PERIOD_LABELS: Record<string, string> = {
  mensual: "Mensual",
  trimestral: "Trimestral",
  anual: "Anual",
};

export const AUDIENCIA_LABELS: Record<string, string> = {
  manejo: "Examen de Manejo",
  bachillerato: "Examen de Bachillerato",
  universidades: "Admisión Universidades",
};
