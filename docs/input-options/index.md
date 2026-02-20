# Input Options

Complete reference for all input parameters and options.

## Overview

ai-footprint accepts a flexible configuration object with required and optional parameters. This document details all available options.

## Required Input

### gpuPowerW

**Type**: `number` (required)

GPU/accelerator average power draw during inference in watts.

**Important**: Use the **average** power during the request, not peak TDP.

```javascript
const result = estimateImpact({
  gpuPowerW: 350,  // NVIDIA A100 average during inference
  region: "eu",
  usage: usage.chat(1000, 200)
});
```

---

## Hardware & Model Inputs

### cpuPowerW

**Type**: `number` (optional)

CPU power draw in watts for the request.

Use when you have telemetry or a known baseline for CPU usage.

```javascript
estimateImpact({
  gpuPowerW: 350,
  cpuPowerW: 50,  // CPU overhead
  region: "eu",
  usage: usage.chat(1000, 200)
});
```

### networkPowerW

**Type**: `number` (optional)

Networking power in watts for the request.

Use for accurate power breakdown when network activity is significant.

```javascript
estimateImpact({
  gpuPowerW: 350,
  cpuPowerW: 50,
  networkPowerW: 20,  // Network interface power
  region: "eu",
  usage: usage.chat(1000, 200)
});
```

### modelParamsB

**Type**: `number` (optional, informational)

Model parameter count in billions.

Useful metadata for documentation and reporting, but **not used in calculations**.

```javascript
estimateImpact({
  gpuPowerW: 350,
  modelParamsB: 70,  // Llama 3 70B
  region: "eu",
  usage: usage.chat(1000, 200)
});
```

---

## Region & Carbon Intensity

### region

**Type**: `RegionInput` (string | `RegionCode`, optional)

Geographic region for carbon intensity lookup.

```javascript
estimateImpact({
  gpuPowerW: 350,
  region: "eu",  // Supports 37+ regions
  usage: usage.chat(1000, 200)
});
```

**Supported regions**: See [Region & Grid Intensity](/input-options/region-grid) for complete list.

**Unknown regions**: Falls back to `global` with console warning.

### gridCarbonIntensityGPerKwh

**Type**: `number` (optional)

Explicit grid carbon intensity in gCO2/kWh.

Overrides region lookup for precise or custom values.

```javascript
estimateImpact({
  gpuPowerW: 350,
  gridCarbonIntensityGPerKwh: 210,  // Your specific value
  usage: usage.chat(1000, 200)
});
```

Use when you have:
- Live grid intensity data
- Custom data center values
- Hourly/dynamic carbon intensity

### timestamp

**Type**: `Date | number` (optional)

Timestamp for dynamic grid intensity resolution.

Used with `gridIntensityResolver` for time-based values.

```javascript
estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  timestamp: new Date(),
  usage: usage.chat(1000, 200)
});
```

### gridIntensityResolver

**Type**: `function` (optional)

Custom resolver hook for dynamic grid carbon intensity.

```javascript
const result = estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  gridIntensityResolver: ({ region, timestamp }) => {
    // Fetch from API or custom logic
    return fetchGridIntensity(region, timestamp);
  },
  usage: usage.chat(1000, 200)
});
```

---

## Workload & Throughput

### usage

**Type**: `Usage` (optional)

Workload metrics object. Required when not using explicit energy or processing time.

**Required when**: No `energy` override and no `processingTimeSeconds`.

```javascript
// Required for automatic time calculation
estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  usage: usage.chat(1000, 200)  // Create with usage.*() helpers
});
```

**Available usage helpers**:
- `usage.chat(inputTokens, outputTokens)`
- `usage.embeddings(inputTokens)`
- `usage.audioTranscription(audioSeconds)`
- `usage.imageGeneration(width, height, images)`

### throughput

**Type**: `ThroughputConfig` (optional)

Performance metrics for automatic time derivation.

**Only needed when using `usage` without `processingTimeSeconds`**.

#### tokensPerSecond

```javascript
estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  usage: usage.chat(1000, 200),
  throughput: { tokensPerSecond: 100 }
});
```

#### audioSecondsPerSecond

```javascript
estimateImpact({
  gpuPowerW: 300,
  region: "uk",
  usage: usage.audioTranscription(120),
  throughput: { audioSecondsPerSecond: 0.5 }  // 2x real-time
});
```

#### pixelsPerSecond

```javascript
estimateImpact({
  gpuPowerW: 320,
  region: "de",
  usage: usage.imageGeneration(1024, 1024, 1),
  throughput: { pixelsPerSecond: 100000 }
});
```

---

## Time Override

### processingTimeSeconds

**Type**: `number` (optional)

Known processing time in seconds.

**Overrides**: Any time derived from `usage` + `throughput`.

```javascript
// Use measured time instead of calculated time
estimateImpact({
  gpuPowerW: 350,
  region: "us",
  processingTimeSeconds: 1.84,  // Your measured value
  usage: usage.chat(1000, 200)  // Still provides category info
});
```

---

## Energy Override

### energy.energyKwh

**Type**: `number` (optional)

Explicit energy in kilowatt-hours.

**Overrides**: All power/time calculations.

```javascript
estimateImpact({
  gpuPowerW: 350,  // Still used for metadata
  region: "eu",
  energy: { energyKwh: 0.0025 }  // Exact energy value
});
```

### energy.energyJoules

**Type**: `number` (optional)

Explicit energy in joules.

**Converted to kWh**: Joules ÷ 3,600,000.

```javascript
estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  energy: { energyJoules: 9000 }  // 0.0025 kWh
});
```

**Note**: When using energy override, time is optional.

---

## Efficiency Options

### efficiency.pue

**Type**: `number` (optional)

Power Usage Effectiveness of the data center.

**Range**: 1.0 - 3.0 (default: 1.0)

```javascript
estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  efficiency: { pue: 1.15 },
  usage: usage.chat(1000, 200)
});
```

**Effect**: `Effective Power = Base Power × pue`

### efficiency.overheadFactor

**Type**: `number` (optional)

System overhead multiplier (scheduler, storage, OS).

**Range**: 0.1 - 10 (default: 1.0)

```javascript
estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  efficiency: { overheadFactor: 1.05 },
  usage: usage.chat(1000, 200)
});
```

**Effect**: `Effective Power = Base Power × overheadFactor × pue`

### efficiency.efficiencyFactor

**Type**: `number` (optional)

Efficiency factor for the request.

**Effect**: `Effective Time = Processing Time / efficiencyFactor`

```javascript
estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  efficiency: { efficiencyFactor: 1.2 },  // 20% faster than baseline
  usage: usage.chat(1000, 200)
});
```

### efficiency.batchSize

**Type**: `number` (optional)

If the request is part of a batch, divide total energy by batch size.

```javascript
estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  efficiency: { batchSize: 16 },  // Batch of 16 requests
  usage: usage.chat(1000, 200)
});
```

### efficiency.precision

**Type**: `string` (optional, informational)

Precision/quantization metadata.

**Values**: `"fp32" | "fp16" | "bf16" | "int8" | "int4" | string`

```javascript
estimateImpact({
  gpuPowerW: 220,
  region: "eu",
  efficiency: { precision: "fp16" },
  usage: usage.chat(1000, 200)
});
```

### efficiency.quantization

**Type**: `string` (optional, informational)

Quantization method metadata.

```javascript
estimateImpact({
  gpuPowerW: 220,
  region: "eu",
  efficiency: { 
    precision: "fp16",
    quantization: "int8" 
  },
  usage: usage.chat(1000, 200)
});
```

---

## Complete Input Example

```javascript
const result = estimateImpact({
  // Hardware
  gpuPowerW: 350,
  cpuPowerW: 50,
  networkPowerW: 20,
  modelParamsB: 70,
  
  // Region & Grid
  region: "eu",
  gridCarbonIntensityGPerKwh: 210,  // Override
  
  // Workload
  usage: usage.chat(1500, 300),
  throughput: { tokensPerSecond: 100 },
  
  // Time override
  processingTimeSeconds: 2.0,
  
  // Energy override (alternative)
  // energy: { energyKwh: 0.002 },
  
  // Efficiency
  efficiency: {
    pue: 1.15,
    overheadFactor: 1.05,
    efficiencyFactor: 1.1,
    batchSize: 4,
    precision: "fp16",
    quantization: "int8"
  },
  
  // Time for dynamic resolver
  timestamp: new Date(),
  
  // Custom resolver (alternative to gridCarbonIntensityGPerKwh)
  // gridIntensityResolver: ({ region, timestamp }) => fetch(...)
});
```

---

## See Also

- 📖 [estimateImpact()](/api/estimate-impact.md) - Function documentation
- 📊 [Usage Categories](/usage-categories/) - Usage helper examples
- 🔧 [Uncertainty Ranges](/advanced/uncertainty-ranges.md) - Range inputs
