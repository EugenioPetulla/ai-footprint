<div align="center">
  <img src="ai-footprint.png" alt="ai-footprint logo" width="180" />
  <h1>ai-footprint.js</h1>
  <p>Estimates for <strong>energy usage (kWh)</strong> and <strong>CO2 emissions (gCO2)</strong> of AI inference calls.</p>
  
  <p><a href="https://eugenioPetulla.github.io/ai-footprint">📖 Documentation</a> | <a href="https://www.npmjs.com/package/ai-footprint">📦 npm</a></p>

  <p>
    <a href="https://www.npmjs.com/package/ai-footprint"><img alt="npm version" src="https://img.shields.io/npm/v/ai-footprint?color=0ea5e9&logo=npm" /></a>
    <a href="https://www.npmjs.com/package/ai-footprint"><img alt="npm downloads" src="https://img.shields.io/npm/dm/ai-footprint?color=22c55e&logo=npm" /></a>
    <a href="https://github.com/EugenioPetulla/ai-footprint"><img alt="license" src="https://img.shields.io/npm/l/ai-footprint?color=64748b" /></a>
    <a href="https://eugenioPetulla.github.io/ai-footprint"><img alt="documentation" src="https://img.shields.io/badge/Documentation-Online-0ea5e9" /></a>
    <a href="https://www.typescriptlang.org/"><img alt="typescript" src="https://img.shields.io/badge/TypeScript-Ready-3178c6?logo=typescript&logoColor=white" /></a>
  </p>
</div>

---

## Why ai-footprint?

Most libraries rely on opaque vendor estimates. **ai-footprint** is intentionally **input‑driven**: you provide measurable facts (power draw, parameters, region, throughput), and it returns a deterministic estimate.

**Use cases**
- Carbon reporting and sustainability dashboards
- Comparing model configurations and batch sizes
- Batch/weekly/monthly footprint reporting
- Research or internal cost/impact analysis

---

## Documentation

For comprehensive documentation, including API reference, usage examples, and input parameter guides, visit our [full documentation site](https://eugenioPetulla.github.io/ai-footprint).

---

## Table of Contents

- [Features](#features)
- [Install](#install)
- [Quickstart](#quickstart)
- [Core Concepts](#core-concepts)
- [Model Categories](#model-categories)
- [Regions, Aliases, and Fallbacks](#regions-aliases-and-fallbacks)
- [Examples](#examples)
- [Batch Aggregation](#batch-aggregation)
- [Uncertainty Ranges](#uncertainty-ranges)
- [Notes and Best Practices](#notes-and-best-practices)
- [Data Source](#data-source)
- [License](#license)

---

## Features

- Deterministic, **input‑driven** estimation
- Model‑type specific usage metrics (tokens, audio seconds, pixels, images)
- Returns **kWh** and **grams of CO2**
- TypeScript‑first API
- Extensible categories and region grid‑intensity mapping
- Optional advanced inputs (measured time, PUE, power breakdown, quantization metadata)
- Batch aggregation for weekly/monthly totals
- Uncertainty ranges for min/max emissions

---

## Install

~~~bash
npm install ai-footprint
~~~

---

## Quickstart

~~~javascript
import { estimateImpact, usage } from "ai-footprint";

const result = estimateImpact({
  gpuPowerW: 350,
  modelParamsB: 70,
  region: "eu",
  usage: usage.chat(1200, 400),
  throughput: {
    tokensPerSecond: 90
  }
});

console.log(result.energyKwh, result.co2Grams);
~~~

---

## Core Concepts

### What you provide
- **Hardware**: GPU power draw in watts (average during inference)
- **Model**: parameter count (e.g., 7B, 70B)
- **Region**: location or explicit grid carbon intensity (gCO2/kWh)
- **Workload metrics**: based on model type (tokens, seconds, pixels, etc.)

### What you get
- **Energy (kWh)** used by the request
- **Emissions (gCO2)** for the energy used

---

## Model Categories

The library uses categories aligned with common API types:

- `chat.completions` — input + output tokens  
- `text.completions` — input + output tokens  
- `embeddings` — input tokens only  
- `ocr` — input + output tokens  
- `audio.transcription` — seconds of audio processed  
- `audio.translation` — seconds of audio processed  
- `audio.speech` — seconds of audio generated  
- `image.generation` — pixels + number of images  

---

## Regions, Aliases, and Fallbacks

The library accepts a `region` string and normalizes it. If a region is not recognized, it falls back to the **global** average and prints a warning in the console.

### Supported base regions with per‑country values

- `global`, `eu`, `us`, `uk`
- `fr`, `de`, `it`, `es`, `nl`, `se`, `no`, `fi`, `ca`, `jp`, `sg`, `au`, `in`, `br`
- `at`, `be`, `ba`, `bg`, `hr`, `cy`, `cz`, `dk`, `ee`, `gr`, `hu`, `ie`, `xk`, `lv`, `lt`, `lu`, `mt`, `me`, `mk`, `pl`, `pt`, `ro`, `rs`, `sk`, `si`, `ch`, `tr`

### Common aliases (normalized)

- `gb`, `united kingdom` → `uk`
- `usa`, `us-east`, `us-west`, `us-central` → `us`
- `eu-west`, `eu-central`, `europe`, `eu (ember)` → `eu`

### Name‑based aliases from the dataset

- `czechia` → `cz`
- `switzerland` → `ch`
- `turkey` → `tr`
- `kosovo` → `xk`
- `north macedonia` → `mk`
- `montenegro` → `me`
- `serbia` → `rs`
- `bosnia and herzegovina` → `ba`

### Additional country codes (mapped to `global`)

- `ae`, `ar`, `bd`, `cl`, `cn`, `co`, `dz`, `eg`, `hk`, `id`, `il`, `ke`, `kr`, `ma`, `mx`, `my`, `ng`, `nz`, `pe`, `ph`, `pk`, `sa`, `th`, `tw`, `vn`, `za`

If you want exact local values, pass `gridCarbonIntensityGPerKwh` directly.

---

## Examples

### Minimal: embeddings

~~~javascript
import { estimateImpact, usage } from "ai-footprint";

const result = estimateImpact({
  gpuPowerW: 250,
  modelParamsB: 7,
  region: "us",
  usage: usage.embeddings(1800),
  throughput: { tokensPerSecond: 300 }
});
~~~

### Minimal: audio transcription

~~~javascript
import { estimateImpact, usage } from "ai-footprint";

const result = estimateImpact({
  gpuPowerW: 300,
  modelParamsB: 1.5,
  region: "uk",
  usage: usage.audioTranscription(120),
  throughput: { audioSecondsPerSecond: 0.5 }
});
~~~

### Minimal: image generation

~~~javascript
import { estimateImpact, usage } from "ai-footprint";

const result = estimateImpact({
  gpuPowerW: 320,
  modelParamsB: 20,
  region: "de",
  usage: usage.imageGeneration(1024, 1024, 2),
  throughput: { pixelsPerSecond: 120000 }
});
~~~

### Measured latency (processing time overrides derived time)

~~~javascript
import { estimateImpact, usage } from "ai-footprint";

const result = estimateImpact({
  gpuPowerW: 400,
  modelParamsB: 70,
  region: "us",
  processingTimeSeconds: 1.84,
  usage: usage.chat(1200, 400)
});
~~~

### PUE (data center overhead)

~~~javascript
import { estimateImpact, usage } from "ai-footprint";

const result = estimateImpact({
  gpuPowerW: 350,
  modelParamsB: 70,
  region: "eu",
  overheadFactor: 1.2, // use this as PUE if preferred
  usage: usage.chat(1200, 400),
  throughput: { tokensPerSecond: 90 }
});
~~~

### Power breakdown (GPU + CPU + network)

~~~javascript
import { estimateImpact, usage } from "ai-footprint";

const gpuPowerW = 300;
const cpuPowerW = 60;
const networkPowerW = 15;

const result = estimateImpact({
  gpuPowerW: gpuPowerW + cpuPowerW + networkPowerW,
  modelParamsB: 13,
  region: "fr",
  usage: usage.chat(800, 200),
  throughput: { tokensPerSecond: 120 }
});
~~~

### Dynamic grid intensity

~~~javascript
import { estimateImpact, usage } from "ai-footprint";

const result = estimateImpact({
  gpuPowerW: 350,
  modelParamsB: 70,
  gridCarbonIntensityGPerKwh: 210,
  usage: usage.chat(1200, 400),
  throughput: { tokensPerSecond: 90 }
});
~~~

### Quantization, batch size, and efficiency factors

~~~javascript
import { estimateImpact, usage } from "ai-footprint";

const result = estimateImpact({
  gpuPowerW: 220,
  modelParamsB: 70,
  region: "eu",
  usage: usage.chat(2000, 400),
  throughput: { tokensPerSecond: 240 }
});
~~~

---

## Batch Aggregation

~~~javascript
import { aggregateImpacts, estimateImpact, usage } from "ai-footprint";

const impacts = [
  estimateImpact({
    gpuPowerW: 350,
    modelParamsB: 70,
    region: "eu",
    usage: usage.chat(1200, 400),
    throughput: { tokensPerSecond: 90 }
  }),
  estimateImpact({
    gpuPowerW: 250,
    modelParamsB: 7,
    region: "us",
    usage: usage.embeddings(1800),
    throughput: { tokensPerSecond: 300 }
  })
];

const total = aggregateImpacts(impacts);
console.log(total.count, total.energyKwh, total.co2Grams);
~~~

---

## Uncertainty Ranges

~~~javascript
import { estimateImpactRange, usage } from "ai-footprint";

const result = estimateImpactRange(
  {
    gpuPowerW: 350,
    modelParamsB: 70,
    region: "eu",
    usage: usage.chat(1200, 400),
    throughput: { tokensPerSecond: 90 }
  },
  {
    gpuPowerW: { min: 300, max: 420 },
    pue: { min: 1.1, max: 1.4 },
    tokensPerSecond: { min: 70, max: 110 }
  }
);

console.log(result.energyKwhMin, result.energyKwhMax);
console.log(result.co2GramsMin, result.co2GramsMax);
~~~

---

## Notes and Best Practices

- Use **measured `processingTimeSeconds`** when available.
- Prefer **explicit `gridCarbonIntensityGPerKwh`** if you can fetch it from a live data source.
- If you don’t know throughput, you can still get a minimal estimate by assuming a conservative value.
- If you pass an unknown `region`, the library will **warn in console** and fall back to `global`.

---

## Data Source

The per‑country dataset is decoupled in `src/data/grid-carbon-intensity.2025.json` (year 2025).  
Source: Our World in Data — https://ourworldindata.org/grapher/carbon-intensity-electricity

---

## License

MIT
