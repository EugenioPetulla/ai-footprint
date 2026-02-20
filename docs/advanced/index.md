# Advanced Features

Advanced capabilities and customization options.

## Uncertainty Ranges

Handle variable inputs with min/max ranges.

### Overview

Use `estimateImpactRange()` when you have uncertain input values and want to understand the potential variation in results.

### Example

```javascript
import { estimateImpactRange, usage } from "ai-footprint";

const result = estimateImpactRange({
  gpuPowerW: 350,  // Nominal value
  region: "eu",
  usage: usage.chat(1200, 400)
}, {
  gpuPowerW: { min: 300, max: 420 },  // Actual power could vary
  pue: { min: 1.1, max: 1.4 }          // Data center efficiency
});

console.log("Base estimate:", result.base.energyKwh);
console.log("Range:", result.energyKwhMin, "-", result.energyKwhMax);
```

### Available Ranges

| Parameter | Type | Description |
|-----------|------|-------------|
| `gpuPowerW` | `NumericRange` | Power draw range (watts) |
| `pue` | `NumericRange` | Power Usage Effectiveness |
| `overheadFactor` | `NumericRange` | System overhead |
| `efficiencyFactor` | `NumericRange` | Efficiency factor |
| `tokensPerSecond` | `NumericRange` | Token processing speed |
| `audioSecondsPerSecond` | `NumericRange` | Audio processing speed |
| `pixelsPerSecond` | `NumericRange` | Pixel processing speed |

### Complete Example

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

console.log("Energy: ", result.energyKwhMin.toFixed(4), "-", result.energyKwhMax.toFixed(4), "kWh");
console.log("CO2: ", result.co2GramsMin.toFixed(2), "-", result.co2GramsMax.toFixed(2), "g");
```

---

## Batch Aggregation

Combine multiple impact results for cumulative totals.

### Overview

Use `aggregateImpacts()` to batch results for reports over time periods (daily, weekly, monthly).

### Example

```javascript
import { estimateImpact, usage, aggregateImpacts } from "ai-footprint";

const dailyRequests = [
  estimateImpact({ gpuPowerW: 350, region: "eu", usage: usage.chat(1000, 200) }),
  estimateImpact({ gpuPowerW: 250, region: "us", usage: usage.embeddings(500) }),
  // ... more requests
];

const total = aggregateImpacts(dailyRequests);

console.log("Total requests: ", total.count);
console.log("Total energy: ", total.energyKwh.toFixed(4), "kWh");
console.log("Total CO2: ", total.co2Grams.toFixed(2), "g");
```

### Use Cases

#### Daily Report

```javascript
function getDailyReport() {
  const estimates = collectAllEstimates();
  return aggregateImpacts(estimates);
}
```

#### Regional Comparison

```javascript
const euEstimates = getRegionEstimates("eu");
const usEstimates = getRegionEstimates("us");

const euTotal = aggregateImpacts(euEstimates);
const usTotal = aggregateImpacts(usEstimates);

console.log("EU total: ", euTotal.co2Grams, "g");
console.log("US total: ", usTotal.co2Grams, "g");
```

---

## Dynamic Grid Intensity

Fetch real-time or time-based carbon intensity data.

### Overview

Use `gridIntensityResolver` to provide dynamic values based on timestamp and region.

### Example

```javascript
import { estimateImpact, usage } from "ai-footprint";

const result = estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  timestamp: new Date(),
  gridIntensityResolver: ({ region, timestamp }) => {
    // Your custom logic to fetch grid intensity
    return fetchGridIntensityFromAPI(region, timestamp);
  },
  usage: usage.chat(1000, 200)
});
```

### Integration Example

```javascript
async function getLiveCarbonIntensity(region, timestamp) {
  const response = await fetch(`https://api.example.com/carbon-intensity/${region}?timestamp=${timestamp}`);
  const data = await response.json();
  return data.intensity; // gCO2/kWh
}

const result = await estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  timestamp: Date.now(),
  gridIntensityResolver: getLiveCarbonIntensity,
  usage: usage.chat(1000, 200)
});

console.log("Current grid intensity: ", result.gridCarbonIntensityGPerKwh);
```

---

## Custom Grid Resolvers

Create your own grid intensity lookup logic.

### Overview

Implement custom resolution logic for specific requirements.

### Examples

#### Hourly Grid Intensity

```javascript
function hourlyResolver({ region, timestamp }) {
  const hour = new Date(timestamp).getHours();
  const baseIntensity = getBaseIntensity(region);
  
  // Higher intensity during peak hours (8-20)
  if (hour >= 8 && hour <= 20) {
    return baseIntensity * 1.3;  // 30% higher
  }
  return baseIntensity * 0.7;  // 30% lower
}
```

#### Data Center Specific

```javascript
function dataCenterResolver({ region }) {
  // Your data center has renewable energy contracts
  const renewablePenetration = 0.8;  // 80% renewable
  
  const baseIntensity = getBaseIntensity(region);
  return baseIntensity * (1 - renewablePenetration);
}
```

#### Historical Data

```javascript
function historicalResolver({ region, timestamp }) {
  // Fetch historical intensity for this timestamp
  return fetchHistoricalIntensity(region, timestamp);
}
```

---

## Best Practices

### 1. Use Ranges for Realistic Estimates

Always account for power draw variations in real-world scenarios.

```javascript
estimateImpactRange(input, {
  gpuPowerW: { min: 0.85 * nominal, max: 1.2 * nominal },
  pue: { min: 1.1, max: 1.4 }
});
```

### 2. Dynamic Resolvers for Accurate Reporting

Use live grid intensity for precise carbon reporting.

```javascript
estimateImpact({
  gpuPowerW: 350,
  timestamp: requestTimestamp,
  gridIntensityResolver: getLiveIntensity,
  usage: usage.chat(1000, 200)
});
```

### 3. Batch Aggregation for Dashboards

Aggregate results for efficient dashboard updates.

```javascript
const weekly = aggregateImpacts(
  getWeekEstimates().flat()
);

updateDashboard({
  count: weekly.count,
  energy: weekly.energyKwh,
  co2: weekly.co2Grams
});
```

---

## See Also

- 📖 [estimateImpactRange()](/api/estimate-impact-range.md) - Range calculation
- 📖 [aggregateImpacts()](/api/aggregate-impacts.md) - Batch aggregation
- 📖 [Input Options](/input-options/) - All parameters
