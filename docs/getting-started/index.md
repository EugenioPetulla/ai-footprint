# Getting Started

Welcome to ai-footprint! This guide will help you get up and running quickly.

## Installation

```bash
npm install ai-footprint
```

## Basic Usage

### Minimal Example

```javascript
import { estimateImpact, usage } from "ai-footprint";

const result = estimateImpact({
  gpuPowerW: 350,
  modelParamsB: 70,
  region: "eu",
  usage: usage.chat(1200, 400),
  throughput: { tokensPerSecond: 90 }
});

console.log(result.energyKwh);   // 0.0028 kWh
console.log(result.co2Grams);    // 0.59 gCO2
```

### What You Get

The `estimateImpact()` function returns an object with:

```javascript
{
  category: "chat.completions",
  energyKwh: 0.0028,
  co2Grams: 0.59,
  gridCarbonIntensityGPerKwh: 210,
  effectivePowerW: 350,
  processingTimeSeconds: 18.89,
  notes: [
    "Base power: 350.00W",
    "Overhead factor: 1.00",
    "PUE: 1.00",
    "Grid intensity: 210 gCO2/kWh"
  ]
}
```

---

## Supported Model Categories

ai-footprint supports 8 different AI model types:

| Category | Usage Metric | Throughput Type |
|----------|--------------|-----------------|
| `chat.completions` | input/output tokens | tokensPerSecond |
| `text.completions` | input/output tokens | tokensPerSecond |
| `embeddings` | input tokens | tokensPerSecond |
| `ocr` | input/output tokens | tokensPerSecond |
| `audio.transcription` | audio seconds | audioSecondsPerSecond |
| `audio.translation` | audio seconds | audioSecondsPerSecond |
| `audio.speech` | audio seconds | audioSecondsPerSecond |
| `image.generation` | pixels + images | pixelsPerSecond |

---

## Common Use Cases

### 1. Sustainability Dashboard

Track CO2 emissions across all your AI requests:

```javascript
import { estimateImpact, usage, aggregateImpacts } from "ai-footprint";

const dailyRequests = [
  estimateImpact({ gpuPowerW: 350, region: "eu", usage: usage.chat(1000, 200) }),
  estimateImpact({ gpuPowerW: 250, region: "us", usage: usage.embeddings(500) }),
  // ... more requests
];

const total = aggregateImpacts(dailyRequests);
console.log(`Daily CO2: ${total.co2Grams}g`);
```

### 2. Model Comparison

Compare different model configurations:

```javascript
const smallModel = estimateImpact({
  gpuPowerW: 150,
  modelParamsB: 7,
  region: "eu",
  usage: usage.chat(1000, 200)
});

const largeModel = estimateImpact({
  gpuPowerW: 400,
  modelParamsB: 70,
  region: "eu",
  usage: usage.chat(1000, 200)
});

console.log(`Small model: ${smallModel.co2Grams}g CO2`);
console.log(`Large model: ${largeModel.co2Grams}g CO2`);
console.log(`Savings: ${largeModel.co2Grams - smallModel.co2Grams}g CO2`);
```

### 3. Regional Impact Analysis

Compare emissions across different regions:

```javascript
const eu = estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  usage: usage.chat(1000, 200)
});

const us = estimateImpact({
  gpuPowerW: 350,
  region: "us",
  usage: usage.chat(1000, 200)
});

console.log(`EU grid: ${eu.co2Grams}g CO2/kWh`);
console.log(`US grid: ${us.co2Grams}g CO2/kWh`);
```

---

## Next Steps

- 📖 Learn about all [API functions](/api/)
- 📊 See examples for each [usage category](/usage-categories/)
- ⚙️ Understand all [input options](/input-options/)
- 🚀 Explore [advanced features](/advanced/)

---

## Need More Help?

- Check the [FAQ](#) (coming soon)
- Open an issue on [GitHub](https://github.com/EugenioPetulla/ai-footprint/issues)
- Join the discussion on [GitHub Discussions](https://github.com/EugenioPetulla/ai-footprint/discussions)
