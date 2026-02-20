# Basic Usage

This guide covers the fundamental ways to use ai-footprint.

## Main Function: estimateImpact()

The core function that calculates energy and CO2 emissions.

### Basic Syntax

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

### Required Input

- **`gpuPowerW`**: GPU power draw in watts (required)

### Optional Inputs

- **`modelParamsB`**: Model parameter count (informational)
- **`region`**: Geographic region for carbon intensity
- **`usage`**: Workload metrics (chat, embeddings, etc.)
- **`throughput`**: Performance metrics for time estimation

---

## Working with Results

The function returns an `ImpactResult` object:

```javascript
const result = estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  usage: usage.chat(1200, 400)
});

// Access calculated values
console.log(result.energyKwh);           // 0.0028
console.log(result.co2Grams);            // 0.59
console.log(result.effectivePowerW);     // 350
console.log(result.processingTimeSeconds); // 18.89

// Debug information
result.notes.forEach(note => console.log(note));
```

### Result Properties

| Property | Type | Description |
|----------|------|-------------|
| `category` | string | Usage category (optional) |
| `energyKwh` | number | Total energy in kilowatt-hours |
| `co2Grams` | number | Total CO2 emissions in grams |
| `gridCarbonIntensityGPerKwh` | number | Grid intensity used (gCO2/kWh) |
| `effectivePowerW` | number | Power including overhead/PUE |
| `processingTimeSeconds` | number | Time used for calculation |
| `notes` | string[] | Calculation notes for debugging |

---

## Using Helper Functions

### Chat Completions

```javascript
const result = estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  usage: usage.chat(1200, 400),
  throughput: { tokensPerSecond: 90 }
});
```

### Embeddings

```javascript
const result = estimateImpact({
  gpuPowerW: 250,
  region: "us",
  usage: usage.embeddings(1800),
  throughput: { tokensPerSecond: 300 }
});
```

### Audio Transcription

```javascript
const result = estimateImpact({
  gpuPowerW: 300,
  region: "uk",
  usage: usage.audioTranscription(120),
  throughput: { audioSecondsPerSecond: 0.5 }
});
```

### Image Generation

```javascript
const result = estimateImpact({
  gpuPowerW: 320,
  region: "de",
  usage: usage.imageGeneration(1024, 1024, 2),
  throughput: { pixelsPerSecond: 120000 }
});
```

---

## Overriding Time Calculation

If you know the actual processing time, pass it directly:

```javascript
const result = estimateImpact({
  gpuPowerW: 350,
  region: "us",
  processingTimeSeconds: 1.84,
  usage: usage.chat(1200, 400)
});
```

This overrides any time derived from usage + throughput.

---

## Custom Grid Intensity

For dynamic or precise values, override the region-based intensity:

```javascript
const result = estimateImpact({
  gpuPowerW: 350,
  gridCarbonIntensityGPerKwh: 210, // Explicit value
  usage: usage.chat(1200, 400)
});
```

---

## Minimal Mode

For coarse estimates when you only know power and time:

```javascript
import { estimateImpactMinimal } from "ai-footprint";

const result = estimateImpactMinimal({
  gpuPowerW: 350,
  processingTimeSeconds: 2.5,
  region: "eu"
});
```

---

## Complete Example

Here's a realistic example with multiple features:

```javascript
import { estimateImpact, usage } from "ai-footprint";

const result = estimateImpact({
  // Hardware
  gpuPowerW: 350,
  cpuPowerW: 50,
  modelParamsB: 70,
  
  // Region
  region: "eu",
  
  // Workload
  usage: usage.chat(1500, 300),
  throughput: { tokensPerSecond: 100 },
  
  // Efficiency
  efficiency: {
    pue: 1.15,
    efficiencyFactor: 1.1,
    precision: "fp16",
    quantization: "int8"
  }
});

console.log("Energy used:", result.energyKwh, "kWh");
console.log("CO2 emissions:", result.co2Grams, "g");
console.log("Effective power:", result.effectivePowerW, "W");
console.log("Processing time:", result.processingTimeSeconds, "s");

// Debug
result.notes.forEach(note => console.log(note));
```

---

## Next Steps

- 📚 Learn about all [API functions](/api/)
- 📊 See more [usage examples](/usage-categories/)
- ⚙️ Understand [input options](/input-options/)
- 🚀 Explore [advanced features](/advanced/)
