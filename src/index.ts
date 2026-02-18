/**
 * Deterministic CO2 and energy impact calculator for AI inference calls.
 *
 * Design goals:
 * - Minimal mode: allow coarse estimates with a few explicit inputs.
 * - Deterministic: no parsing of model names or hidden heuristics.
 * - Extensible: optional advanced inputs (telemetry, PUE, power breakdown).
 */
import gridCarbonIntensity2025 from "./data/grid-carbon-intensity.2025.json";

export type ModelCategory =
  | "chat.completions"
  | "text.completions"
  | "embeddings"
  | "audio.transcription"
  | "audio.translation"
  | "audio.speech"
  | "image.generation"
  | "ocr";

export type RegionCode =
  | "global"
  | "eu"
  | "us"
  | "uk"
  | "fr"
  | "de"
  | "it"
  | "es"
  | "nl"
  | "se"
  | "no"
  | "fi"
  | "ca"
  | "jp"
  | "sg"
  | "au"
  | "in"
  | "br"
  | "at"
  | "be"
  | "ba"
  | "bg"
  | "hr"
  | "cy"
  | "cz"
  | "dk"
  | "ee"
  | "gr"
  | "hu"
  | "ie"
  | "xk"
  | "lv"
  | "lt"
  | "lu"
  | "mt"
  | "me"
  | "mk"
  | "pl"
  | "pt"
  | "ro"
  | "rs"
  | "sk"
  | "si"
  | "ch"
  | "tr";

export type RegionInput = RegionCode | string;

export interface GridCarbonIntensityMap {
  [region: string]: number;
}

export const GRID_CARBON_INTENSITY_2025_METADATA =
  gridCarbonIntensity2025.metadata;

const BASE_GRID_CARBON_G_PER_KWH: GridCarbonIntensityMap = {
  global: 475,
  us: 400,
  ca: 130,
  jp: 470,
  sg: 470,
  au: 600,
  in: 700,
  br: 80,
};

export const DEFAULT_GRID_CARBON_G_PER_KWH: GridCarbonIntensityMap = {
  ...BASE_GRID_CARBON_G_PER_KWH,
  ...gridCarbonIntensity2025.values,
};

const REGION_ALIASES: Record<string, RegionCode> = {
  // Common aliases
  gb: "uk",
  "united kingdom": "uk",
  usa: "us",
  "us-east": "us",
  "us-west": "us",
  "us-central": "us",
  "eu-west": "eu",
  "eu-central": "eu",
  europe: "eu",
  "eu (ember)": "eu",

  // Name-based aliases from dataset
  czechia: "cz",
  switzerland: "ch",
  turkey: "tr",
  kosovo: "xk",
  "north macedonia": "mk",
  montenegro: "me",
  serbia: "rs",
  "bosnia and herzegovina": "ba",

  // EEA not in dataset: map to EU average
  is: "eu",

  // Additional countries mapped to global baseline
  cn: "global",
  kr: "global",
  mx: "global",
  za: "global",
  ae: "global",
  sa: "global",
  nz: "global",
  il: "global",
  ar: "global",
  cl: "global",
  co: "global",
  pe: "global",
  id: "global",
  th: "global",
  vn: "global",
  ph: "global",
  my: "global",
  tw: "global",
  hk: "global",
  pk: "global",
  bd: "global",
  ng: "global",
  eg: "global",
  ke: "global",
  ma: "global",
  tn: "global",
  dz: "global",
};

function normalizeRegion(region?: RegionInput): RegionCode | undefined {
  if (!region) return undefined;
  const key = region.toString().toLowerCase().trim();
  if (DEFAULT_GRID_CARBON_G_PER_KWH[key as RegionCode]) {
    return key as RegionCode;
  }
  return REGION_ALIASES[key];
}

export interface BaseImpactInputs {
  /**
   * GPU/accelerator average power draw for inference (W).
   * This should be the average during the request, not peak TDP.
   */
  gpuPowerW: number;

  /**
   * Optional power draw from CPU (W) for the request.
   * Use when you have telemetry or a known baseline.
   */
  cpuPowerW?: number;

  /**
   * Optional power draw for networking (W) for the request.
   */
  networkPowerW?: number;

  /**
   * Model parameter count in billions (optional, informational).
   * Not required for calculation, but useful metadata.
   */
  modelParamsB?: number;

  /**
   * Geographic region used to resolve grid carbon intensity if not provided explicitly.
   */
  region?: RegionInput;

  /**
   * Optional explicit grid carbon intensity (gCO2/kWh).
   * If provided, it overrides region lookup.
   */
  gridCarbonIntensityGPerKwh?: number;

  /**
   * Optional timestamp (Date or epoch ms) used by gridIntensityResolver.
   */
  timestamp?: Date | number;

  /**
   * Optional resolver hook for dynamic grid carbon intensity.
   * If provided, it overrides region lookup unless gridCarbonIntensityGPerKwh is set.
   */
  gridIntensityResolver?: (input: {
    region?: RegionInput;
    timestamp?: Date | number;
  }) => number;

  /**
   * If you already know the total processing time (seconds), you can pass it directly.
   * When provided, it overrides any time derived from usage metrics.
   */
  processingTimeSeconds?: number;
}

export interface EnergyInputs {
  /**
   * Explicit energy for the request (kWh). When provided, it overrides power/time.
   */
  energyKwh?: number;

  /**
   * Explicit energy for the request (Joules).
   * If provided, it is converted to kWh and overrides power/time.
   */
  energyJoules?: number;
}

export interface EfficiencyOptions {
  /**
   * Power Usage Effectiveness (PUE) of the data center.
   * Total power is multiplied by this value.
   */
  pue?: number;

  /**
   * System overhead multiplier (e.g., scheduler, storage, OS).
   * Total power is multiplied by this value.
   */
  overheadFactor?: number;

  /**
   * Efficiency factor for the request.
   * If provided, processing time is divided by this value.
   * Example: 1.2 means 20% faster than baseline.
   */
  efficiencyFactor?: number;

  /**
   * If the request is part of a batch, divide total energy by batch size.
   */
  batchSize?: number;

  /**
   * Precision / quantization metadata (informational).
   */
  precision?: "fp32" | "fp16" | "bf16" | "int8" | "int4" | string;
  quantization?: string;
}

export interface ChatCompletionUsage {
  category: "chat.completions";
  inputTokens: number;
  outputTokens: number;
  processingTimeSeconds?: number;
}

export interface TextCompletionUsage {
  category: "text.completions";
  inputTokens: number;
  outputTokens: number;
  processingTimeSeconds?: number;
}

export interface EmbeddingsUsage {
  category: "embeddings";
  inputTokens: number;
  processingTimeSeconds?: number;
}

export interface OcrUsage {
  category: "ocr";
  inputTokens: number;
  outputTokens: number;
  processingTimeSeconds?: number;
}

export interface AudioTranscriptionUsage {
  category: "audio.transcription";
  audioSeconds: number;
  processingTimeSeconds?: number;
}

export interface AudioTranslationUsage {
  category: "audio.translation";
  audioSeconds: number;
  processingTimeSeconds?: number;
}

export interface AudioSpeechUsage {
  category: "audio.speech";
  audioSeconds: number;
  processingTimeSeconds?: number;
}

export interface ImageGenerationUsage {
  category: "image.generation";
  width: number;
  height: number;
  images: number;
  processingTimeSeconds?: number;
}

export type Usage =
  | ChatCompletionUsage
  | TextCompletionUsage
  | EmbeddingsUsage
  | OcrUsage
  | AudioTranscriptionUsage
  | AudioTranslationUsage
  | AudioSpeechUsage
  | ImageGenerationUsage;

export interface ThroughputConfig {
  /**
   * Tokens per second used to compute time for token-based models.
   */
  tokensPerSecond?: number;

  /**
   * Audio seconds processed per second (real-time factor).
   * Example: 0.5 means 2x real-time.
   */
  audioSecondsPerSecond?: number;

  /**
   * Pixels processed per second for image generation.
   */
  pixelsPerSecond?: number;
}

export interface ImpactInputs extends BaseImpactInputs {
  usage?: Usage;
  throughput?: ThroughputConfig;
  energy?: EnergyInputs;
  efficiency?: EfficiencyOptions;
}

export interface MinimalImpactInputs {
  gpuPowerW: number;
  processingTimeSeconds: number;
  region?: RegionInput;
  gridCarbonIntensityGPerKwh?: number;
  efficiency?: EfficiencyOptions;
  energy?: EnergyInputs;
  timestamp?: Date | number;
  gridIntensityResolver?: (input: {
    region?: RegionInput;
    timestamp?: Date | number;
  }) => number;
}

export interface ImpactResult {
  category?: ModelCategory;
  energyKwh: number;
  co2Grams: number;
  gridCarbonIntensityGPerKwh: number;
  effectivePowerW: number;
  processingTimeSeconds: number;
  notes: string[];
}

export interface NumericRange {
  min: number;
  max: number;
}

export interface UncertaintyRanges {
  gpuPowerW?: NumericRange;
  pue?: NumericRange;
  overheadFactor?: NumericRange;
  efficiencyFactor?: NumericRange;
  tokensPerSecond?: NumericRange;
  audioSecondsPerSecond?: NumericRange;
  pixelsPerSecond?: NumericRange;
}

export interface ImpactRangeResult {
  base: ImpactResult;
  energyKwhMin: number;
  energyKwhMax: number;
  co2GramsMin: number;
  co2GramsMax: number;
}

export interface AggregateImpactResult {
  count: number;
  energyKwh: number;
  co2Grams: number;
}

const DEFAULT_OVERHEAD = 1.0;
const DEFAULT_PUE = 1.0;

function clamp(min: number, value: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function resolveGridIntensity(input: {
  region?: RegionInput;
  gridCarbonIntensityGPerKwh?: number;
  gridIntensityResolver?: (input: {
    region?: RegionInput;
    timestamp?: Date | number;
  }) => number;
  timestamp?: Date | number;
}): number {
  if (
    typeof input.gridCarbonIntensityGPerKwh === "number" &&
    input.gridCarbonIntensityGPerKwh > 0
  ) {
    return input.gridCarbonIntensityGPerKwh;
  }

  const normalizedRegion = normalizeRegion(input.region);

  if (input.gridIntensityResolver) {
    const resolved = input.gridIntensityResolver({
      region: normalizedRegion,
      timestamp: input.timestamp,
    });
    if (typeof resolved === "number" && resolved > 0) return resolved;
  }

  if (normalizedRegion && DEFAULT_GRID_CARBON_G_PER_KWH[normalizedRegion]) {
    return DEFAULT_GRID_CARBON_G_PER_KWH[normalizedRegion];
  }

  if (input.region) {
    console.warn(
      `Unknown region "${input.region}", falling back to global carbon intensity.`,
    );
  }

  return DEFAULT_GRID_CARBON_G_PER_KWH.global;
}

function requirePositive(name: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive number.`);
  }
}

function toKwhFromJoules(joules: number): number {
  return joules / 3_600_000;
}

function deriveProcessingTimeSeconds(
  usage: Usage,
  throughput?: ThroughputConfig,
): number {
  if (typeof usage.processingTimeSeconds === "number") {
    requirePositive("processingTimeSeconds", usage.processingTimeSeconds);
    return usage.processingTimeSeconds;
  }

  if (
    usage.category === "chat.completions" ||
    usage.category === "text.completions" ||
    usage.category === "ocr"
  ) {
    requirePositive("inputTokens", usage.inputTokens);
    requirePositive("outputTokens", usage.outputTokens);
    const tps = throughput?.tokensPerSecond;
    requirePositive("throughput.tokensPerSecond", tps ?? NaN);
    return (usage.inputTokens + usage.outputTokens) / (tps as number);
  }

  if (usage.category === "embeddings") {
    requirePositive("inputTokens", usage.inputTokens);
    const tps = throughput?.tokensPerSecond;
    requirePositive("throughput.tokensPerSecond", tps ?? NaN);
    return usage.inputTokens / (tps as number);
  }

  if (
    usage.category === "audio.transcription" ||
    usage.category === "audio.translation" ||
    usage.category === "audio.speech"
  ) {
    requirePositive("audioSeconds", usage.audioSeconds);
    const aps = throughput?.audioSecondsPerSecond;
    requirePositive("throughput.audioSecondsPerSecond", aps ?? NaN);
    return usage.audioSeconds / (aps as number);
  }

  if (usage.category === "image.generation") {
    requirePositive("width", usage.width);
    requirePositive("height", usage.height);
    requirePositive("images", usage.images);
    const pps = throughput?.pixelsPerSecond;
    requirePositive("throughput.pixelsPerSecond", pps ?? NaN);
    const totalPixels = usage.width * usage.height * usage.images;
    return totalPixels / (pps as number);
  }

  throw new Error("Unsupported usage category.");
}

function resolveEnergyKwh(energy?: EnergyInputs): number | null {
  if (energy?.energyKwh && energy.energyKwh > 0) return energy.energyKwh;
  if (energy?.energyJoules && energy.energyJoules > 0) {
    return toKwhFromJoules(energy.energyJoules);
  }
  return null;
}

function computeEffectivePowerW(input: ImpactInputs | MinimalImpactInputs): {
  effectivePowerW: number;
  notes: string[];
} {
  const notes: string[] = [];
  requirePositive("gpuPowerW", input.gpuPowerW);

  const cpuPowerW = (input as ImpactInputs).cpuPowerW ?? 0;
  const networkPowerW = (input as ImpactInputs).networkPowerW ?? 0;

  if (cpuPowerW) requirePositive("cpuPowerW", cpuPowerW);
  if (networkPowerW) requirePositive("networkPowerW", networkPowerW);

  const basePowerW = input.gpuPowerW + cpuPowerW + networkPowerW;

  const overheadFactor = clamp(
    0.1,
    (input as ImpactInputs).efficiency?.overheadFactor ?? DEFAULT_OVERHEAD,
    10,
  );
  const pue = clamp(
    1.0,
    (input as ImpactInputs).efficiency?.pue ?? DEFAULT_PUE,
    3.0,
  );

  const effectivePowerW = basePowerW * overheadFactor * pue;

  notes.push(`Base power: ${basePowerW.toFixed(2)}W`);
  notes.push(`Overhead factor: ${overheadFactor.toFixed(2)}`);
  notes.push(`PUE: ${pue.toFixed(2)}`);

  return { effectivePowerW, notes };
}

function applyEfficiencyToTime(
  processingTimeSeconds: number,
  efficiency?: EfficiencyOptions,
): number {
  if (!efficiency?.efficiencyFactor) return processingTimeSeconds;
  requirePositive("efficiency.efficiencyFactor", efficiency.efficiencyFactor);
  return processingTimeSeconds / efficiency.efficiencyFactor;
}

function applyBatchSize(
  energyKwh: number,
  efficiency?: EfficiencyOptions,
): number {
  if (!efficiency?.batchSize) return energyKwh;
  requirePositive("efficiency.batchSize", efficiency.batchSize);
  return energyKwh / efficiency.batchSize;
}

export function estimateImpact(input: ImpactInputs): ImpactResult {
  const notes: string[] = [];

  const gridIntensity = resolveGridIntensity({
    region: input.region,
    gridCarbonIntensityGPerKwh: input.gridCarbonIntensityGPerKwh,
    gridIntensityResolver: input.gridIntensityResolver,
    timestamp: input.timestamp,
  });

  const energyOverride = resolveEnergyKwh(input.energy);
  const { effectivePowerW, notes: powerNotes } = computeEffectivePowerW(input);
  notes.push(...powerNotes);

  let processingTimeSeconds = 0;
  let energyKwh = 0;

  if (energyOverride !== null) {
    energyKwh = energyOverride;
    notes.push("Energy override provided.");
    if (typeof input.processingTimeSeconds === "number") {
      processingTimeSeconds = input.processingTimeSeconds;
      requirePositive("processingTimeSeconds", processingTimeSeconds);
      notes.push("Processing time provided alongside energy.");
    } else if (input.usage?.processingTimeSeconds) {
      processingTimeSeconds = input.usage.processingTimeSeconds;
      requirePositive("processingTimeSeconds", processingTimeSeconds);
      notes.push("Processing time provided in usage alongside energy.");
    } else {
      processingTimeSeconds = 0;
      notes.push("Processing time not provided with energy.");
    }
  } else {
    if (typeof input.processingTimeSeconds === "number") {
      processingTimeSeconds = input.processingTimeSeconds;
      requirePositive("processingTimeSeconds", processingTimeSeconds);
    } else if (input.usage) {
      processingTimeSeconds = deriveProcessingTimeSeconds(
        input.usage,
        input.throughput,
      );
    } else {
      throw new Error(
        "Either processingTimeSeconds, usage, or energy must be provided.",
      );
    }

    processingTimeSeconds = applyEfficiencyToTime(
      processingTimeSeconds,
      input.efficiency,
    );

    energyKwh = (effectivePowerW * processingTimeSeconds) / 3600 / 1000;
  }

  energyKwh = applyBatchSize(energyKwh, input.efficiency);
  const co2Grams = energyKwh * gridIntensity;

  notes.push(`Grid intensity: ${gridIntensity} gCO2/kWh`);

  if (input.efficiency?.precision) {
    notes.push(`Precision: ${input.efficiency.precision}`);
  }
  if (input.efficiency?.quantization) {
    notes.push(`Quantization: ${input.efficiency.quantization}`);
  }

  return {
    category: input.usage?.category,
    energyKwh,
    co2Grams,
    gridCarbonIntensityGPerKwh: gridIntensity,
    effectivePowerW,
    processingTimeSeconds,
    notes,
  };
}

/**
 * Minimal mode helper: a lightweight entry-point for coarse estimates.
 */
export function estimateImpactMinimal(
  input: MinimalImpactInputs,
): ImpactResult {
  return estimateImpact({
    gpuPowerW: input.gpuPowerW,
    processingTimeSeconds: input.processingTimeSeconds,
    region: input.region,
    gridCarbonIntensityGPerKwh: input.gridCarbonIntensityGPerKwh,
    efficiency: input.efficiency,
    energy: input.energy,
    timestamp: input.timestamp,
    gridIntensityResolver: input.gridIntensityResolver,
  });
}

function validateRange(name: string, range?: NumericRange): void {
  if (!range) return;
  requirePositive(`${name}.min`, range.min);
  requirePositive(`${name}.max`, range.max);
  if (range.max < range.min) {
    throw new Error(`${name}.max must be >= ${name}.min.`);
  }
}

function pickRangeValue(
  value: number | undefined,
  range: NumericRange | undefined,
  pick: "min" | "max",
): number | undefined {
  if (!range) return value;
  return pick === "min" ? range.min : range.max;
}

function buildInputWithRanges(
  input: ImpactInputs,
  ranges: UncertaintyRanges,
  pick: "min" | "max",
): ImpactInputs {
  const needsThroughput =
    ranges.tokensPerSecond ||
    ranges.audioSecondsPerSecond ||
    ranges.pixelsPerSecond;
  const needsEfficiency =
    ranges.pue || ranges.overheadFactor || ranges.efficiencyFactor;

  const throughput = input.throughput || (needsThroughput ? {} : undefined);
  const efficiency = input.efficiency || (needsEfficiency ? {} : undefined);

  return {
    ...input,
    gpuPowerW: pickRangeValue(
      input.gpuPowerW,
      ranges.gpuPowerW,
      pick,
    ) as number,
    throughput: throughput
      ? {
          ...throughput,
          tokensPerSecond: pickRangeValue(
            throughput.tokensPerSecond,
            ranges.tokensPerSecond,
            pick,
          ),
          audioSecondsPerSecond: pickRangeValue(
            throughput.audioSecondsPerSecond,
            ranges.audioSecondsPerSecond,
            pick,
          ),
          pixelsPerSecond: pickRangeValue(
            throughput.pixelsPerSecond,
            ranges.pixelsPerSecond,
            pick,
          ),
        }
      : undefined,
    efficiency: efficiency
      ? {
          ...efficiency,
          pue: pickRangeValue(efficiency.pue, ranges.pue, pick),
          overheadFactor: pickRangeValue(
            efficiency.overheadFactor,
            ranges.overheadFactor,
            pick,
          ),
          efficiencyFactor: pickRangeValue(
            efficiency.efficiencyFactor,
            ranges.efficiencyFactor,
            pick,
          ),
        }
      : undefined,
  };
}

export function aggregateImpacts(
  results: ImpactResult[],
): AggregateImpactResult {
  return results.reduce(
    (acc, result) => ({
      count: acc.count + 1,
      energyKwh: acc.energyKwh + result.energyKwh,
      co2Grams: acc.co2Grams + result.co2Grams,
    }),
    { count: 0, energyKwh: 0, co2Grams: 0 },
  );
}

export function estimateImpactRange(
  input: ImpactInputs,
  ranges: UncertaintyRanges,
): ImpactRangeResult {
  validateRange("gpuPowerW", ranges.gpuPowerW);
  validateRange("pue", ranges.pue);
  validateRange("overheadFactor", ranges.overheadFactor);
  validateRange("efficiencyFactor", ranges.efficiencyFactor);
  validateRange("tokensPerSecond", ranges.tokensPerSecond);
  validateRange("audioSecondsPerSecond", ranges.audioSecondsPerSecond);
  validateRange("pixelsPerSecond", ranges.pixelsPerSecond);

  const base = estimateImpact(input);

  const hasEnergyOverride =
    !!input.energy?.energyKwh || !!input.energy?.energyJoules;

  if (hasEnergyOverride) {
    return {
      base,
      energyKwhMin: base.energyKwh,
      energyKwhMax: base.energyKwh,
      co2GramsMin: base.co2Grams,
      co2GramsMax: base.co2Grams,
    };
  }

  const lowInput = buildInputWithRanges(input, ranges, "min");
  const highInput = buildInputWithRanges(input, ranges, "max");

  const low = estimateImpact(lowInput);
  const high = estimateImpact(highInput);

  return {
    base,
    energyKwhMin: Math.min(low.energyKwh, high.energyKwh),
    energyKwhMax: Math.max(low.energyKwh, high.energyKwh),
    co2GramsMin: Math.min(low.co2Grams, high.co2Grams),
    co2GramsMax: Math.max(low.co2Grams, high.co2Grams),
  };
}

/**
 * Convenience helpers for building usage objects with strict types.
 */
export const usage = {
  chat(inputTokens: number, outputTokens: number): ChatCompletionUsage {
    return { category: "chat.completions", inputTokens, outputTokens };
  },
  text(inputTokens: number, outputTokens: number): TextCompletionUsage {
    return { category: "text.completions", inputTokens, outputTokens };
  },
  embeddings(inputTokens: number): EmbeddingsUsage {
    return { category: "embeddings", inputTokens };
  },
  ocr(inputTokens: number, outputTokens: number): OcrUsage {
    return { category: "ocr", inputTokens, outputTokens };
  },
  audioTranscription(audioSeconds: number): AudioTranscriptionUsage {
    return { category: "audio.transcription", audioSeconds };
  },
  audioTranslation(audioSeconds: number): AudioTranslationUsage {
    return { category: "audio.translation", audioSeconds };
  },
  audioSpeech(audioSeconds: number): AudioSpeechUsage {
    return { category: "audio.speech", audioSeconds };
  },
  imageGeneration(
    width: number,
    height: number,
    images = 1,
  ): ImageGenerationUsage {
    return { category: "image.generation", width, height, images };
  },
};

export type { ImpactInputs as EstimateImpactInputs };
