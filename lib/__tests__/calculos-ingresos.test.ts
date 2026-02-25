import { describe, it, expect } from "vitest";
import {
  calcularIngresoPorTier,
  calcularIngresoMensualNormalizado,
  calcularComisiones,
  calcularIVA,
  calcularISRPorTramos,
  calcularISR,
  calcularDividendos,
  calcularCostoIA,
  calcularTotalGastosOperativos,
} from "../calculos-ingresos";
import { DEFAULT_TRAMOS_ISR } from "../constants";

describe("calcularIngresoPorTier", () => {
  it("multiplies users by CRC price and converts to USD", () => {
    const result = calcularIngresoPorTier(100, 2_500, 485);
    expect(result.crc).toBeCloseTo(250_000);
    expect(result.usd).toBeCloseTo(250_000 / 485);
  });

  it("returns zero for zero users", () => {
    const result = calcularIngresoPorTier(0, 7_000, 485);
    expect(result.usd).toBe(0);
    expect(result.crc).toBe(0);
  });
});

describe("calcularIngresoMensualNormalizado", () => {
  it("normalizes quarterly to monthly (÷3)", () => {
    const tiers = [
      { plan: "basico" as const, period: "trimestral" as const, moduleCount: 1 as const, priceCRC: 6_000, usuarios: 10 },
    ];
    const result = calcularIngresoMensualNormalizado(tiers, 485);
    expect(result.crc).toBeCloseTo(20_000);
    expect(result.usd).toBeCloseTo(20_000 / 485);
  });

  it("normalizes annual to monthly (÷12)", () => {
    const tiers = [
      { plan: "pro" as const, period: "anual" as const, moduleCount: 1 as const, priceCRC: 50_400, usuarios: 5 },
    ];
    const result = calcularIngresoMensualNormalizado(tiers, 485);
    expect(result.crc).toBeCloseTo(21_000);
    expect(result.usd).toBeCloseTo(21_000 / 485);
  });

  it("sums across multiple tiers", () => {
    const tiers = [
      { plan: "basico" as const, period: "mensual" as const, moduleCount: 1 as const, priceCRC: 2_500, usuarios: 100 },
      { plan: "plus" as const, period: "mensual" as const, moduleCount: 2 as const, priceCRC: 7_200, usuarios: 50 },
    ];
    const result = calcularIngresoMensualNormalizado(tiers, 485);
    expect(result.crc).toBeCloseTo(610_000);
    expect(result.usd).toBeCloseTo(610_000 / 485);
  });
});

describe("calcularComisiones", () => {
  it("calculates weighted commissions based on distribution", () => {
    const distribucion = [
      { nombre: "Apps", porcentaje: 1, comisionPlataforma: 0.15 },
    ];
    const result = calcularComisiones(1_000_000, distribucion);
    expect(result).toBeCloseTo(150_000);
  });

  it("handles mixed distribution", () => {
    const distribucion = [
      { nombre: "Apps", porcentaje: 0.7, comisionPlataforma: 0.15 },
      { nombre: "SaaS", porcentaje: 0.3, comisionPlataforma: 0.035 },
    ];
    const result = calcularComisiones(1_000_000, distribucion);
    expect(result).toBeCloseTo(115_500);
  });
});

describe("calcularIVA", () => {
  it("calculates IVA collected minus credit", () => {
    const result = calcularIVA(1_000_000, 0.13, 0.13, 61_000);
    expect(result.ivaCobrado).toBeCloseTo(130_000);
    expect(result.ivaCredito).toBeCloseTo(7_930);
    expect(result.ivaNeto).toBeCloseTo(122_070);
  });
});

describe("calcularISRPorTramos", () => {
  it("applies progressive tax brackets", () => {
    const isr = calcularISRPorTramos(10_000_000, DEFAULT_TRAMOS_ISR);
    expect(isr).toBeCloseTo(779_800);
  });
});

describe("calcularISR", () => {
  it("uses flat rate when gross income exceeds threshold", () => {
    const isr = calcularISR(50_000_000, 120_000_000, DEFAULT_TRAMOS_ISR, 112_170_000, 0.3);
    expect(isr).toBeCloseTo(15_000_000);
  });

  it("uses brackets when gross income is below threshold", () => {
    const isr = calcularISR(10_000_000, 50_000_000, DEFAULT_TRAMOS_ISR, 112_170_000, 0.3);
    expect(isr).toBeCloseTo(779_800);
  });
});

describe("calcularDividendos", () => {
  it("splits net income among partners after dividend tax", () => {
    const result = calcularDividendos(10_000_000, 0.15, 4);
    expect(result.impuesto).toBeCloseTo(1_500_000);
    expect(result.totalDividendos).toBeCloseTo(8_500_000);
    expect(result.porSocio).toBeCloseTo(2_125_000);
  });
});

describe("calcularCostoIA", () => {
  it("multiplies Pro users by cost per user in CRC", () => {
    const result = calcularCostoIA(100, 0.36, 485);
    expect(result.usd).toBeCloseTo(36);
    expect(result.crc).toBeCloseTo(36 * 485);
  });
});

describe("calcularTotalGastosOperativos", () => {
  it("sums all gastos", () => {
    const gastos = [
      { concepto: "A", montoMensualCRC: 10_000, detalle: "" },
      { concepto: "B", montoMensualCRC: 20_000, detalle: "" },
    ];
    expect(calcularTotalGastosOperativos(gastos)).toBe(30_000);
  });
});
