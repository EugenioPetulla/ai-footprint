# estimateImpactRange()

Calculates uncertainty ranges (min/max) for energy and CO2 emissions based on input ranges.

## Signature

```typescript
function estimateImpactRange(
  input: ImpactInputs,
  ranges: UncertaintyRanges
): ImpactRangeResult
```

## Description

Use `estimateImpactRange()` when you have uncertain input values (e.g., power draw varies between 300-420W). The function calculates both a base estimate and min/max ranges to show the potential variation in results.

## Basic Example

```javascript
import { estimateImpactRange, usage } from "ai-footprint";

const result = estimateImpactRange({
  gpuPowerW: 350,
  region: "eu",
  usage: usage.chat(1200, 400)
}, {
  gpuPowerW: { min: 300, max: 420 }
});

console.log(result.energyKwhMin, result.energyKwhMax);  // 0.0024 - 0.0034
console.log(result.co2GramsMin, result.co2GramsMax);    // 0.50 - 0.71
```

## Complete Example

```javascript
const result = estimateImpactRange({
  gpuPowerW: 350,
  modelParamsB: 70,
  region: "eu",
  usage: usage.chat(1200, 400),
  throughput: { tokensPerSecond: 90 }
}, {
  gpuPowerW: { min: 300, max: 420 },
  pue: { min: 1.1, max: 1.4 },
  efficiencyFactor: { min: 0.9, max: 1.2 },
  tokensPerSecond: { min: 70, max: 110 }
});

console.log("Base estimates:", result.base);
console.log("Energy range:", result.energyKwhMin, "-", result.energyKwhMax, "kWh");
console.log("CO2 range:", result.co2GramsMin, "-", result.co2GramsMax, "g");
```

## Parameters

### Base Input

| Parameter | Type | Description |
|-----------|------|-------------|
| `input` | `ImpactInputs` | Configuration with base values (not ranges) |
| `ranges` | `UncertaintyRanges` | Min/max ranges for uncertain inputs |

### Uncertainty Ranges

| Parameter | Type | Description |
|-----------|------|-------------|
| `gpuPowerW` | `NumericRange` | Power draw range in watts |
| `pue` | `NumericRange` | Power Usage Effectiveness range |
| `overheadFactor` | `NumericRange` | Overhead factor range |
| `efficiencyFactor` | `NumericRange` | Efficiency factor range |
| `tokensPerSecond` | `NumericRange` | Token processing speed range |
| `audioSecondsPerSecond` | `NumericRange` | Audio processing speed range |
| `pixelsPerSecond` | `NumericRange` | Pixel processing speed range |

### Example Range Object

```javascript
{
  gpuPowerW: { min: 300, max: 420 },
  pue: { min: 1.1, max: 1.4 },
  efficiencyFactor: { min: 0.9, max: 1.2 }
}
```

## Return Value

```typescript
interface ImpactRangeResult {
  base: ImpactResult;       // Base calculation using nominal values
  energyKwhMin: number;     // Minimum energy across all ranges
  energyKwhMax: number;     // Maximum energy across all ranges
  co2GramsMin: number;      // Minimum CO2 emissions across all ranges
  co2GramsMax: number;      // Maximum CO2 emissions across all ranges
}
```

### Example Result

```javascript
{
  base: {
    category: "chat.completions",
    energyKwh: 0.0028,
    co2Grams: 0.59,
    // ... other base fields
  },
  energyKwhMin: 0.0024,
  energyKwhMax: 0.0034,
  co2GramsMin: 0.50,
  co2GramsMax: 0.71
}
```

## Use Cases

### 1. Hardware Variability

Account for power draw variations:

```javascript
const result = estimateImpactRange({
  gpuPowerW: 350,
  region: "eu",
  usage: usage.chat(1000, 200)
}, {
  gpuPowerW: { min: 300, max: 420 }  // Real-world power variation
});
```

### 2. Data Center Efficiency

Account for PUE uncertainty:

```javascript
const result = estimateImpactRange({
  gpuPowerW: 350,
  region: "eu",
  usage: usage.chat(1000, 200)
}, {
  pue: { min: 1.1, max: 1.4 }  // Data center efficiency range
});
```

### 3. Combined Uncertainty

Multiple uncertain inputs:

```javascript
const result = estimateImpactRange({
  gpuPowerW: 350,
  region: "eu",
  usage: usage.chat(1000, 200),
  throughput: { tokensPerSecond: 100 }
}, {
  gpuPowerW: { min: 300, max: 420 },
  efficiencyFactor: { min: 0.9, max: 1.2 },
  tokensPerSecond: { min: 80, max: 120 }
});
```

### 4. Reporting with Ranges

```javascript
console.log(`Energy: ${result.energyKwhMin.toFixed(4)} - ${result.energyKwhMax.toFixed(4)} kWh`);
console.log(`CO2: ${result.co2GramsMin.toFixed(2)} - ${result.co2GramsMax.toFixed(2)} g`);
```

## Important Notes

- **Range values must be positive numbers**
- **max must be >= min**
- If an energy override is provided in the base input, ranges are ignored (returns base values only)
- The function calculates both low and high scenarios based on range values

## Calculation Method

The function:
1. Calculates base result using nominal values
2. Calculates "low" result using all min values
3. Calculates "high" result using all max values
4. Returns min/max across low/high for final ranges

## See Also

- 📖 [estimateImpact()](/api/estimate-impact.md) - Base calculation function
- 📖 [aggregateImpacts()](/api/aggregate-impacts.md) - Batch multiple results
