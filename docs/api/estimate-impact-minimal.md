# estimateImpactMinimal()

A lightweight entry point for coarse estimates when you only know power and time.

## Signature

```typescript
function estimateImpactMinimal(input: MinimalImpactInputs): ImpactResult
```

## Description

Use `estimateImpactMinimal()` when you want a simple calculation with minimal inputs. It's ideal for quick estimates or when you don't have detailed workload information.

## Basic Example

```javascript
import { estimateImpactMinimal } from "ai-footprint";

const result = estimateImpactMinimal({
  gpuPowerW: 350,
  processingTimeSeconds: 2.5,
  region: "eu"
});

console.log(result.energyKwh);  // 0.00024 kWh
console.log(result.co2Grams);   // 0.05 g
```

## Example with Efficiency

```javascript
const result = estimateImpactMinimal({
  gpuPowerW: 350,
  processingTimeSeconds: 2.0,
  region: "eu",
  efficiency: {
    pue: 1.15,
    efficiencyFactor: 1.1,
    batchSize: 8
  }
});
```

## Example with Custom Grid Intensity

```javascript
const result = estimateImpactMinimal({
  gpuPowerW: 350,
  processingTimeSeconds: 2.5,
  gridCarbonIntensityGPerKwh: 150  // Custom value
});
```

## Parameters

### Required

| Parameter | Type | Description |
|-----------|------|-------------|
| `gpuPowerW` | `number` | GPU/accelerator power draw (watts) |
| `processingTimeSeconds` | `number` | Known processing time in seconds |

### Optional

| Parameter | Type | Description |
|-----------|------|-------------|
| `region` | `RegionInput` | Geographic region for carbon intensity |
| `gridCarbonIntensityGPerKwh` | `number` | Explicit grid intensity (gCO2/kWh) |
| `efficiency` | `EfficiencyOptions` | Efficiency options (PUE, efficiency factor, batch size) |
| `energy` | `EnergyInputs` | Energy override (kWh or joules) |
| `timestamp` | `Date \| number` | Timestamp for dynamic grid intensity |
| `gridIntensityResolver` | `function` | Custom grid intensity resolver |

## When to Use

### Use `estimateImpactMinimal()` when:
- You only know power and processing time
- You need a quick estimate
- Working with measured telemetry data
- Simple calculations without workload details

### Use `estimateImpact()` when:
- You have full workload information
- You want automatic time calculation from usage
- You need model-specific metrics
- Comprehensive calculation with all options

## Comparison

### Minimal (simpler)
```javascript
estimateImpactMinimal({
  gpuPowerW: 350,
  processingTimeSeconds: 2.5
});
```

### Full (more control)
```javascript
estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  usage: usage.chat(1000, 200),
  throughput: { tokensPerSecond: 100 }
});
```

## See Also

- 📖 [estimateImpact()](/api/estimate-impact.md) - Full-featured function
- ⚙️ [Input Options](/input-options/) - All available parameters
