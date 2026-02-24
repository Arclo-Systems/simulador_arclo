import { describe, it, expect } from "vitest";
import {
  calcularPrecioTiempo,
  calcularPrecioCPM,
  calcularPrecioCPC,
  calcularTarifa,
} from "../calculos-tarifas";

describe("calcularPrecioTiempo", () => {
  it("calculates price for 30 days with discount", () => {
    expect(calcularPrecioTiempo(13.5, 30, 0.25)).toBeCloseTo(303.75);
  });

  it("calculates price without discount", () => {
    expect(calcularPrecioTiempo(13.5, 30, 0)).toBeCloseTo(405);
  });
});

describe("calcularPrecioCPM", () => {
  it("calculates price for 5000 impressions with discount", () => {
    expect(calcularPrecioCPM(18, 5000, 0.25)).toBeCloseTo(67.5);
  });
});

describe("calcularPrecioCPC", () => {
  it("calculates price for 500 clicks with discount", () => {
    expect(calcularPrecioCPC(9, 500, 0.25)).toBeCloseTo(3375);
  });
});

describe("calcularTarifa", () => {
  it("delegates to correct function based on plan type", () => {
    const result = calcularTarifa("manejo", "tiempo", 30, true, 485);
    expect(result.precioTotalUSD).toBeCloseTo(303.75);
    expect(result.precioTotalCRC).toBeCloseTo(303.75 * 485);
    expect(result.descuentoAplicado).toBe(0.25);
    expect(result.tarifaBasePorUnidad).toBe(13.5);
  });

  it("applies no discount when todosLosEspacios is false", () => {
    const result = calcularTarifa("manejo", "tiempo", 30, false, 485);
    expect(result.precioTotalUSD).toBeCloseTo(405);
    expect(result.descuentoAplicado).toBe(0);
  });
});
