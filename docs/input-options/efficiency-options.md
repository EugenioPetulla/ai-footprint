# Efficiency Options

Advanced parameters for fine-tuning energy calculations.

## Overview

Efficiency options allow you to account for system-level factors that affect power consumption and processing time.

## Parameters

### pue (Power Usage Effectiveness)

**Type**: `number`  
**Range**: 1.0 - 3.0  
**Default**: 1.0

Data center efficiency factor that accounts for overhead (cooling, lighting, etc.).

```javascript
const result = estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  efficiency: { pue: 1.15 },
  usage: usage.chat(1000, 200)
});

// Effective power: 350W × 1.15 = 402.5W
```

### overheadFactor

**Type**: `number`  
**Range**: 0.1 - 10  
**Default**: 1.0

System overhead multiplier for scheduler, storage, OS, etc.

```javascript
const result = estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  efficiency: { overheadFactor: 1.05 },
  usage: usage.chat(1000, 200)
});

// Effective power: 350W × 1.05 = 367.5W
```

### efficiencyFactor

**Type**: `number`  
**Range**: > 0  
**Default**: 1.0

Efficiency improvement factor. Greater than 1 means faster processing.

```javascript
const result = estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  efficiency: { efficiencyFactor: 1.2 },  // 20% faster
  usage: usage.chat(1000, 200)
});

// Effective time: time / 1.2
```

### batchSize

**Type**: `number`  
**Range**: >= 1  
**Default**: 1

Divides total energy by batch size. Useful for batch inference.

```javascript
const result = estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  efficiency: { batchSize: 16 },
  usage: usage.chat(1000, 200)
});

// Energy is divided by 16
```

### precision

**Type**: `string` (optional, informational)

Precision/quantization metadata.

**Values**: `"fp32" | "fp16" | "bf16" | "int8" | "int4"`

```javascript
const result = estimateImpact({
  gpuPowerW: 220,
  region: "eu",
  efficiency: { precision: "fp16" },
  usage: usage.chat(1000, 200)
});
```

### quantization

**Type**: `string` (optional, informational)

Quantization method.

```javascript
const result = estimateImpact({
  gpuPowerW: 220,
  region: "eu",
  efficiency: { 
    precision: "fp16",
    quantization: "int8"
  },
  usage: usage.chat(1000, 200)
});
```

## Efficiency Options Object

```typescript
interface EfficiencyOptions {
  pue?: number;
  overheadFactor?: number;
  efficiencyFactor?: number;
  batchSize?: number;
  precision?: string;
  quantization?: string;
}
```

## Complete Example

```javascript
const result = estimateImpact({
  // Hardware
  gpuPowerW: 350,
  cpuPowerW: 50,
  
  // Region
  region: "eu",
  
  // Workload
  usage: usage.chat(1500, 300),
  throughput: { tokensPerSecond: 100 },
  
  // Efficiency
  efficiency: {
    pue: 1.15,                    // Data center efficiency
    overheadFactor: 1.05,         // System overhead
    efficiencyFactor: 1.1,        // 10% faster than baseline
    batchSize: 8,                 // Process 8 in parallel
    precision: "fp16",            // Mixed precision
    quantization: "int8"          // Weight quantization
  }
});

console.log("Effective power:", result.effectivePowerW, "W");
console.log("Processing time:", result.processingTimeSeconds, "s");
console.log("Energy:", result.energyKwh, "kWh");
console.log("CO2:", result.co2Grams, "g");
```

## Effect on Calculation

```
Base Power (W) = gpuPowerW + cpuPowerW + networkPowerW

Effective Power (W) = Base Power × overheadFactor × pue

Processing Time (s) = Work / Throughput
  - If efficiencyFactor: Time = Time / efficiencyFactor

Energy (kWh) = (Effective Power × Time) / 3600 / 1000
  - If batchSize: Energy = Energy / batchSize

CO2 (g) = Energy × gridCarbonIntensity
```

## Best Practices

### 1. Use PUE for Data Center Estimates

For accurate data center energy use, include PUE:

```javascript
estimateImpact({
  gpuPowerW: 350,
  efficiency: { pue: 1.2 },  // Typical for modern DC
  usage: usage.chat(1000, 200)
});
```

### 2. Batch Size for Batch Inference

When processing multiple requests simultaneously:

```javascript
estimateImpact({
  gpuPowerW: 350,
  efficiency: { batchSize: 32 },
  usage: usage.embeddings(500)
});
```

### 3. Precision for Quantized Models

Account for quantization efficiency:

```javascript
estimateImpact({
  gpuPowerW: 220,  // Lower power for quantized models
  efficiency: { 
    precision: "int8",
    efficiencyFactor: 1.3  // Faster with quantization
  },
  usage: usage.chat(1000, 200)
});
```

### 4. Combined Efficiency

Multiple efficiency factors together:

```javascript
estimateImpact({
  gpuPowerW: 350,
  efficiency: {
    pue: 1.15,
    overheadFactor: 1.05,
    efficiencyFactor: 1.2,
    batchSize: 8
  },
  usage: usage.chat(1000, 200)
});
```

---

## See Also

- 📖 [estimateImpact()](/api/estimate-impact.md) - Main function
- 📖 [Input Options](/input-options/) - All parameters
