# Uncertainty Ranges

Understanding and using uncertainty ranges for more realistic estimates.

## Overview

Real-world inputs often have uncertainty. The `estimateImpactRange()` function helps you understand how input variations affect your energy and CO2 estimates.

## Why Use Ranges?

### Real-World Variability

| Input | Typical Range | Why it Varies |
|-------|---------------|---------------|
| GPU Power | ±20% | Workload, temperature, aging |
| PUE | 1.1 - 1.4 | Data center efficiency |
| Efficiency Factor | 0.9 - 1.2 | Model optimization, cache hits |
| Throughput | ±30% | Hardware load, network |

### Example: Why Ranges Matter

```javascript
// Single value estimate
const single = estimateImpact({
  gpuPowerW: 350,  // Exact value
  region: "eu",
  usage: usage.chat(1000, 200)
});
console.log("Estimate: ", single.co2Grams, "g CO2");

// Range estimate
const range = estimateImpactRange({
  gpuPowerW: 350,  // Nominal value
  region: "eu",
  usage: usage.chat(1000, 200)
}, {
  gpuPowerW: { min: 300, max: 420 }  // Actual could be 300-420
});

console.log("Range: ", range.co2GramsMin, " - ", range.co2GramsMax, "g CO2");
```

---

## Available Ranges

### Hardware Inputs

#### gpuPowerW

GPU power draw variation due to workload, temperature, or measurement uncertainty.

```javascript
{
  gpuPowerW: { min: 300, max: 420 }  // 350 ± 20%
}
```

### Data Center Efficiency

#### pue

Power Usage Effectiveness varies by data center design and operational efficiency.

```javascript
{
  pue: { min: 1.1, max: 1.4 }  // Typical range for modern facilities
}
```

### System Overhead

#### overheadFactor

System overhead varies based on background processes, storage I/O, and network.

```javascript
{
  overheadFactor: { min: 1.0, max: 1.2 }
}
```

### Efficiency Factor

#### efficiencyFactor

Efficiency variations due to model optimization, caching, or batch size effects.

```javascript
{
  efficiencyFactor: { min: 0.9, max: 1.2 }  // 10% slower to 20% faster
}
```

### Throughput

#### tokensPerSecond

Token generation speed varies based on hardware load and optimization.

```javascript
{
  tokensPerSecond: { min: 70, max: 110 }  // 30% variation
}
```

#### audioSecondsPerSecond

Audio processing real-time factor varies by hardware and model.

```javascript
{
  audioSecondsPerSecond: { min: 0.4, max: 0.8 }  // 2x to 4x real-time
}
```

#### pixelsPerSecond

Image generation speed varies based on complexity and hardware.

```javascript
{
  pixelsPerSecond: { min: 50000, max: 150000 }
}
```

---

## Complete Examples

### Example 1: GPU Power Uncertainty

```javascript
const result = estimateImpactRange({
  gpuPowerW: 350,
  region: "eu",
  usage: usage.chat(1000, 200)
}, {
  gpuPowerW: { min: 300, max: 420 }
});

console.log("Estimate: ", result.base.co2Grams, "g CO2");
console.log("Range: ", result.co2GramsMin, " - ", result.co2GramsMax, "g CO2");
console.log("Uncertainty: ", ((result.co2GramsMax - result.co2GramsMin) / result.base.co2Grams * 100).toFixed(1), "%");
```

### Example 2: Multiple Uncertainties

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

console.log("Energy range: ", result.energyKwhMin.toFixed(5), " - ", result.energyKwhMax.toFixed(5), "kWh");
console.log("CO2 range: ", result.co2GramsMin.toFixed(2), " - ", result.co2GramsMax.toFixed(2), "g");
```

### Example 3: Reporting with Ranges

```javascript
const report = (requests, ranges) => {
  const rangesResults = requests.map(req => 
    estimateImpactRange(req, ranges)
  );
  
  const totals = aggregateImpacts(rangesResults.map(r => r.base));
  const min = aggregateImpacts(rangesResults.map(r => ({
    energyKwh: r.energyKwhMin,
    co2Grams: r.co2GramsMin
  })));
  const max = aggregateImpacts(rangesResults.map(r => ({
    energyKwh: r.energyKwhMax,
    co2Grams: r.co2GramsMax
  })));
  
  return {
    count: totals.count,
    energy: {
      base: totals.energyKwh,
      min: min.energyKwh,
      max: max.energyKwh
    },
    co2: {
      base: totals.co2Grams,
      min: min.co2Grams,
      max: max.co2Grams
    }
  };
};

const result = report(dailyRequests, {
  gpuPowerW: { min: 0.85 * 350, max: 1.15 * 350 },
  pue: { min: 1.1, max: 1.3 }
});

console.log(`Daily CO2: ${result.co2.base.toFixed(1)}g (${result.co2.min.toFixed(1)} - ${result.co2.max.toFixed(1)}g)`);
```

---

## Use Cases

### 1. Sustainability Dashboard

Show range to users for transparency:

```javascript
<div className="carbon-report">
  <h3>Daily Emissions</h3>
  <div className="value">{total.co2Grams.toFixed(1)} g CO2</div>
  <div className="range">
    {total.co2GramsMin.toFixed(1)} - {total.co2GramsMax.toFixed(1)} g (range)
  </div>
</div>
```

### 2. Model Selection

Compare models with uncertainty ranges:

```javascript
const smallModel = estimateImpactRange({
  gpuPowerW: 150,
  region: "eu",
  usage: usage.chat(1000, 200)
}, {
  gpuPowerW: { min: 130, max: 180 }
});

const largeModel = estimateImpactRange({
  gpuPowerW: 350,
  region: "eu",
  usage: usage.chat(1000, 200)
}, {
  gpuPowerW: { min: 300, max: 420 }
});

console.log("Small: ", smallModel.co2GramsMin, " - ", smallModel.co2GramsMax, "g");
console.log("Large: ", largeModel.co2GramsMin, " - ", largeModel.co2GramsMax, "g");
```

### 3. Optimization Impact

Measure efficiency improvement:

```javascript
const before = estimateImpactRange({
  gpuPowerW: 350,
  region: "eu",
  efficiency: { efficiencyFactor: 1.0 },
  usage: usage.chat(1000, 200)
}, {
  gpuPowerW: { min: 300, max: 420 },
  efficiencyFactor: { min: 0.9, max: 1.2 }
});

const after = estimateImpactRange({
  gpuPowerW: 350,
  region: "eu",
  efficiency: { efficiencyFactor: 1.2 },
  usage: usage.chat(1000, 200)
}, {
  gpuPowerW: { min: 300, max: 420 },
  efficiencyFactor: { min: 1.1, max: 1.3 }
});

console.log("Improvement: ", (before.co2GramsMax - after.co2GramsMin).toFixed(2), "g CO2");
```

---

## Best Practices

### 1. Always Use Ranges for Reporting

For accurate carbon accounting, show min/max ranges:

```javascript
// Good
co2: "0.59 g (0.50 - 0.71 g)"

// Bad ( misleading)
co2: "0.59 g"
```

### 2. Focus on Dominant Uncertainties

Identify which inputs cause the most variation:

```javascript
// Compare individual vs combined
const gpuOnly = estimateImpactRange(input, { gpuPowerW: range });
const all = estimateImpactRange(input, allRanges);

console.log("GPU contribution: ", (gpuOnly.co2GramsMax - gpuOnly.co2GramsMin));
console.log("Total uncertainty: ", (all.co2GramsMax - all.co2GramsMin));
```

### 3. Document Your Ranges

Clearly communicate your assumptions:

```javascript
const ranges = {
  // GPU power: based on manufacturer specs with 15% variation
  gpuPowerW: { min: 0.85 * 350, max: 1.15 * 350 },
  // PUE: typical for modern facilities
  pue: { min: 1.1, max: 1.3 },
  // Throughput: based on load testing
  tokensPerSecond: { min: 80, max: 120 }
};
```

---

## See Also

- 📖 [estimateImpactRange()](/api/estimate-impact-range.md) - Function documentation
- 📖 [estimateImpact()](/api/estimate-impact.md) - Single value calculation
- 📖 [Input Options](/input-options/) - All parameters
