# ai-footprint

<div align="center">
  <img src="/logo.png" alt="ai-footprint logo" width="200" />
  
  <p><strong>Deterministic CO2 and energy impact calculator for AI inference calls</strong></p>
  
  <p>
    <a href="https://www.npmjs.com/package/ai-footprint"><img alt="npm version" src="https://img.shields.io/npm/v/ai-footprint?color=0ea5e9&logo=npm" /></a>
    <!--<a href="https://www.npmjs.com/package/ai-footprint"><img alt="npm downloads" src="https://img.shields.io/npm/dm/ai-footprint?color=22c55e&logo=npm" /></a>-->
    <a href="https://github.com/EugenioPetulla/ai-footprint"><img alt="license" src="https://img.shields.io/npm/l/ai-footprint?color=64748b" /></a>
  </p>
</div>

---

## Why ai-footprint?

Most libraries rely on opaque vendor estimates. **ai-footprint** is intentionally **input‑driven**: you provide measurable facts (power draw, parameters, region, throughput), and it returns a deterministic estimate.

### Use Cases

- ✅ Carbon reporting and sustainability dashboards
- ✅ Comparing model configurations and batch sizes
- ✅ Batch/weekly/monthly footprint reporting
- ✅ Research or internal cost/impact analysis

---

## Features

- 📊 **Deterministic**, **input‑driven** estimation
- 🎯 Model‑type specific usage metrics (tokens, audio seconds, pixels, images)
- ⚡ Returns **kWh** and **grams of CO2**
- 🦺 TypeScript‑first API
- 🔌 Extensible categories and region grid‑intensity mapping
- ⚙️ Optional advanced inputs (measured time, PUE, power breakdown, quantization metadata)
- 📦 Batch aggregation for weekly/monthly totals
- 📉 Uncertainty ranges for min/max emissions

---

## Quick Start

```javascript
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
```

---

## Installation

```bash
npm install ai-footprint
```

---

## What You Provide

- **Hardware**: GPU power draw in watts (average during inference)
- **Model**: parameter count (e.g., 7B, 70B)
- **Region**: location or explicit grid carbon intensity (gCO2/kWh)
- **Workload metrics**: based on model type (tokens, seconds, pixels, etc.)

---

## What You Get

- **Energy (kWh)** used by the request
- **Emissions (gCO2)** for the energy used
- Detailed notes for debugging and transparency

---

## Documentation Structure

| Section | Description |
|---------|-------------|
| [Getting Started](./getting-started/) | Installation and basic usage |
| [API Reference](./api/) | All exported functions |
| [Usage Categories](./usage-categories/) | Examples by model type |
| [Input Options](./input-options/) | Detailed parameter guide |
| [Advanced](./advanced/) | Uncertainty ranges, aggregation, custom resolvers |

---

## Examples by Category

### Chat Completions
```javascript
import { estimateImpact, usage } from "ai-footprint";

const result = estimateImpact({
  gpuPowerW: 350,
  modelParamsB: 70,
  region: "eu",
  usage: usage.chat(1200, 400),
  throughput: { tokensPerSecond: 90 }
});
```

### Embeddings
```javascript
const result = estimateImpact({
  gpuPowerW: 250,
  modelParamsB: 7,
  region: "us",
  usage: usage.embeddings(1800),
  throughput: { tokensPerSecond: 300 }
});
```

### Audio Transcription
```javascript
const result = estimateImpact({
  gpuPowerW: 300,
  modelParamsB: 1.5,
  region: "uk",
  usage: usage.audioTranscription(120),
  throughput: { audioSecondsPerSecond: 0.5 }
});
```

### Image Generation
```javascript
const result = estimateImpact({
  gpuPowerW: 320,
  modelParamsB: 20,
  region: "de",
  usage: usage.imageGeneration(1024, 1024, 2),
  throughput: { pixelsPerSecond: 120000 }
});
```

---

## Core Concepts

### Calculation Formula

```
Base Power (W) = gpuPowerW + cpuPowerW + networkPowerW

Effective Power (W) = Base Power × overheadFactor × pue

Processing Time (s) = Total Work / Throughput

Energy (kWh) = (Effective Power × Time) / 3600 / 1000

CO2 (g) = Energy × gridCarbonIntensity
```

### Supported Regions

The library supports **37+ regions** including:
- Global, EU, US, UK
- 30+ European countries
- Major regions worldwide

See [Region & Grid Intensity](/input-options/region-grid) for the complete list.

---

## Data Source

The per‑country dataset is sourced from **Our World in Data**:
- Year: 2025
- Unit: gCO2/kWh
- Source: [carbon-intensity-electricity](https://ourworldindata.org/grapher/carbon-intensity-electricity)

---

## Need Help?

- 📖 Read the full [documentation](/)
- 💬 Open an issue on [GitHub](https://github.com/EugenioPetulla/ai-footprint/issues)
- 📧 Contact: [eugenio@codeat.it](mailto:eugenio@codeat.it)

---

**Released under the MIT License**  
Copyright © 2025 Eugenio Petullà
