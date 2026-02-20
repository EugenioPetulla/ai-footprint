# estimateImpact()

The main function that calculates energy and CO2 emissions for AI inference requests.

## Signature

```typescript
function estimateImpact(input: ImpactInputs): ImpactResult
```

## Description

`estimateImpact()` is the primary function in ai-footprint. It takes a configuration object with your hardware specifications, region, workload metrics, and optional efficiency factors, then returns detailed energy and emissions calculations.

## Basic Example

```javascript
import { estimateImpact, usage } from "ai-footprint";

const result = estimateImpact({
  gpuPowerW: 350,
  modelParamsB: 70,
  region: "eu",
  usage: usage.chat(1200, 400),
  throughput: { tokensPerSecond: 90 }
});

console.log("Energy:", result.energyKwh, "kWh");
console.log("CO2:", result.co2Grams, "g");
```

## Complete Example with All Options

```javascript
const result = estimateImpact({
  // Hardware specifications
  gpuPowerW: 350,
  cpuPowerW: 50,
  networkPowerW: 20,
  modelParamsB: 70,
  
  // Region
  region: "eu",
  
  // Grid intensity (alternative to region)
  gridCarbonIntensityGPerKwh: 210,
  
  // Workload
  usage: usage.chat(1500, 300),
  throughput: { tokensPerSecond: 100 },
  
  // Efficiency
  efficiency: {
    pue: 1.15,
    overheadFactor: 1.05,
    efficiencyFactor: 1.1,
    batchSize: 4,
    precision: "fp16",
    quantization: "int8"
  },
  
  // Time override (optional)
  processingTimeSeconds: 2.5
});

console.log(result.energyKwh);        // 0.0042 kWh
console.log(result.co2Grams);         // 0.88 g
console.log(result.effectivePowerW);  // 476.15 W
console.log(result.processingTimeSeconds); // 2.27 s
```

## Parameters

### Required

| Parameter | Type | Description |
|-----------|------|-------------|
| `gpuPowerW` | `number` | GPU/accelerator average power draw during inference (watts). This should be the **average** during the request, not peak TDP. |

### Optional Inputs

#### Hardware & Model

| Parameter | Type | Description |
|-----------|------|-------------|
| `cpuPowerW` | `number` | Optional CPU power draw (watts) |
| `networkPowerW` | `number` | Optional networking power (watts) |
| `modelParamsB` | `number` | Model parameter count in billions (informational) |

#### Region & Carbon Intensity

| Parameter | Type | Description |
|-----------|------|-------------|
| `region` | `RegionInput` | Geographic region (e.g., "eu", "us", "fr"). See [Region Guide](/input-options/region-grid) for complete list |
| `gridCarbonIntensityGPerKwh` | `number` | Explicit grid carbon intensity (gCO2/kWh). Overrides region lookup |
| `timestamp` | `Date \| number` | Optional timestamp for dynamic grid intensity resolution |
| `gridIntensityResolver` | `function` | Custom resolver hook for dynamic grid carbon intensity |

#### Workload & Throughput

| Parameter | Type | Description |
|-----------|------|-------------|
| `usage` | `Usage` | Workload metrics object (chat, embeddings, audio, etc.) |
| `throughput` | `ThroughputConfig` | Performance metrics for automatic time derivation |

#### Time Override

| Parameter | Type | Description |
|-----------|------|-------------|
| `processingTimeSeconds` | `number` | Known processing time in seconds. Overrides time derived from usage |

#### Energy Override

| Parameter | Type | Description |
|-----------|------|-------------|
| `energy.energyKwh` | `number` | Explicit energy (kWh). Overrides power/time calculation |
| `energy.energyJoules` | `number` | Explicit energy (joules). Converted to kWh and overrides power/time |

#### Efficiency Options

| Parameter | Type | Description |
|-----------|------|-------------|
| `efficiency.pue` | `number` | Power Usage Effectiveness (default: 1.0, range: 1.0-3.0) |
| `efficiency.overheadFactor` | `number` | System overhead multiplier (default: 1.0, range: 0.1-10) |
| `efficiency.efficiencyFactor` | `number` | Efficiency factor (time ÷ this value). Example: 1.2 = 20% faster |
| `efficiency.batchSize` | `number` | If batched, divides total energy by this value |
| `efficiency.precision` | `string` | Precision metadata (fp32, fp16, bf16, int8, int4) |
| `efficiency.quantization` | `string` | Quantization metadata |

## Return Value

Returns an `ImpactResult` object:

```typescript
interface ImpactResult {
  category?: ModelCategory;        // Usage category
  energyKwh: number;               // Total energy in kWh
  co2Grams: number;                // Total CO2 emissions in grams
  gridCarbonIntensityGPerKwh: number; // Grid intensity used
  effectivePowerW: number;         // Power including overhead/PUE
  processingTimeSeconds: number;   // Actual processing time used
  notes: string[];                 // Calculation notes for debugging
}
```

### Example Result

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

## Notes Array

The `notes` array contains calculation details for transparency and debugging:

- Base power calculation (GPU + CPU + network)
- Overhead factor applied
- PUE (Power Usage Effectiveness) applied
- Grid carbon intensity used
- Precision/quantization metadata (if provided)

## Calculation Formula

```
Base Power (W) = gpuPowerW + cpuPowerW + networkPowerW

Effective Power (W) = Base Power × overheadFactor × pue

Processing Time (s) = 
  - If processingTimeSeconds provided: use it
  - If usage provided: calculate from usage + throughput
  - Token models: (inputTokens + outputTokens) / tokensPerSecond
  - Audio models: audioSeconds / audioSecondsPerSecond
  - Image models: (width × height × images) / pixelsPerSecond

Effective Time (s) = Processing Time / efficiencyFactor

Energy (kWh) = (Effective Power × Effective Time) / 3600 / 1000

If batch processing: Energy = Energy / batchSize

CO2 (g) = Energy × gridCarbonIntensityGPerKwh
```

## Error Handling

The function throws errors for invalid inputs:

```javascript
try {
  estimateImpact({
    gpuPowerW: -100,  // Invalid: must be positive
    region: "unknown" // Fallback to global with warning
  });
} catch (error) {
  console.error(error.message);
}
```

## See Also

- 📖 [estimateImpactMinimal()](/api/estimate-impact-minimal.md) - Simplified entry point
- 📖 [estimateImpactRange()](/api/estimate-impact-range.md) - Uncertainty ranges
- ⚙️ [Input Options](/input-options/) - Complete parameter guide
- 📊 [Usage Categories](/usage-categories/) - Examples by model type
