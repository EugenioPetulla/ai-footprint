import { describe, expect, it } from "vitest";
import {
  estimateImpact,
  estimateImpactMinimal,
  usage,
} from "./index";

const baseInputs = {
  gpuPowerW: 400,
  region: "eu",
  usage: usage.chat(1000, 200),
  throughput: { tokensPerSecond: 100 },
} as const;

describe("estimateImpact gpuCount", () => {
  it("defaults to a single GPU", () => {
    const result = estimateImpact({ ...baseInputs });
    expect(result.effectivePowerW).toBe(400);
    expect(result.processingTimeSeconds).toBe(12);
    expect(result.energyKwh).toBeCloseTo((400 * 12) / 3_600_000, 12);
  });

  it("scales GPU power linearly with gpuCount", () => {
    const result = estimateImpact({ ...baseInputs, gpuCount: 8 });
    expect(result.effectivePowerW).toBe(3200);
    expect(result.energyKwh).toBeCloseTo((3200 * 12) / 3_600_000, 12);
    expect(result.co2Grams).toBeCloseTo(
      ((3200 * 12) / 3_600_000) * result.gridCarbonIntensityGPerKwh,
      12,
    );
  });

  it("does not multiply CPU and network power by gpuCount", () => {
    const result = estimateImpact({
      ...baseInputs,
      gpuCount: 4,
      cpuPowerW: 50,
      networkPowerW: 10,
    });
    expect(result.effectivePowerW).toBe(400 * 4 + 50 + 10);
  });

  it("applies PUE and overhead after GPU scaling", () => {
    const result = estimateImpact({
      ...baseInputs,
      gpuCount: 2,
      efficiency: { pue: 1.2, overheadFactor: 1.1 },
    });
    expect(result.effectivePowerW).toBeCloseTo(800 * 1.1 * 1.2, 10);
  });

  it("rejects invalid gpuCount values", () => {
    expect(() => estimateImpact({ ...baseInputs, gpuCount: 0 })).toThrow(
      "gpuCount must be a positive integer.",
    );
    expect(() => estimateImpact({ ...baseInputs, gpuCount: -1 })).toThrow(
      "gpuCount must be a positive integer.",
    );
    expect(() => estimateImpact({ ...baseInputs, gpuCount: 2.5 })).toThrow(
      "gpuCount must be a positive integer.",
    );
  });

  it("does not affect explicit energy overrides", () => {
    const result = estimateImpact({
      ...baseInputs,
      gpuCount: 8,
      energy: { energyKwh: 0.001 },
    });
    expect(result.energyKwh).toBe(0.001);
  });

  it("includes gpuCount in notes", () => {
    const result = estimateImpact({ ...baseInputs, gpuCount: 4 });
    expect(result.notes).toContain("GPU count: 4");
  });
});

describe("estimateImpactMinimal gpuCount", () => {
  it("supports gpuCount", () => {
    const result = estimateImpactMinimal({
      gpuPowerW: 700,
      gpuCount: 4,
      processingTimeSeconds: 10,
      gridCarbonIntensityGPerKwh: 100,
    });
    expect(result.effectivePowerW).toBe(2800);
    expect(result.energyKwh).toBeCloseTo((2800 * 10) / 3_600_000, 12);
    expect(result.co2Grams).toBeCloseTo(
      ((2800 * 10) / 3_600_000) * 100,
      12,
    );
  });
});
