# aggregateImpacts()

Batches multiple impact results for cumulative totals over time periods.

## Signature

```typescript
function aggregateImpacts(results: ImpactResult[]): AggregateImpactResult
```

## Description

Use `aggregateImpacts()` to combine multiple individual impact calculations into a single summary. This is useful for:

- Daily/weekly/monthly carbon reporting
- Total energy usage across all requests
- Co2 tracking over time periods

## Basic Example

```javascript
import { estimateImpact, usage, aggregateImpacts } from "ai-footprint";

const dailyRequests = [
  estimateImpact({
    gpuPowerW: 350,
    region: "eu",
    usage: usage.chat(1000, 200)
  }),
  estimateImpact({
    gpuPowerW: 250,
    region: "us",
    usage: usage.embeddings(500)
  }),
  estimateImpact({
    gpuPowerW: 320,
    region: "de",
    usage: usage.chat(800, 150)
  })
];

const total = aggregateImpacts(dailyRequests);

console.log(total.count);       // 3
console.log(total.energyKwh);   // 0.0084 kWh
console.log(total.co2Grams);    // 1.77 g
```

## Complete Example with Time Period

```javascript
import { estimateImpact, usage, aggregateImpacts } from "ai-footprint";

function getWeeklyStats() {
  const weeklyRequests = [];
  
  // Process 100 requests per day for 7 days
  for (let day = 0; day < 7; day++) {
    for (let i = 0; i < 100; i++) {
      weeklyRequests.push(
        estimateImpact({
          gpuPowerW: 350,
          region: "eu",
          usage: usage.chat(1000 + Math.random() * 500, 200 + Math.random() * 100)
        })
      );
    }
  }
  
  return aggregateImpacts(weeklyRequests);
}

const weekly = getWeeklyStats();

console.log(`Weekly requests: ${weekly.count}`);
console.log(`Weekly energy: ${weekly.energyKwh.toFixed(2)} kWh`);
console.log(`Weekly CO2: ${weekly.co2Grams.toFixed(1)} g`);
console.log(`Daily average: ${(weekly.co2Grams / 7).toFixed(1)} g`);
```

## Example: Region Comparison

```javascript
const euImpacts = [];
const usImpacts = [];

// Process same workload in different regions
for (let i = 0; i < 50; i++) {
  euImpacts.push(
    estimateImpact({
      gpuPowerW: 350,
      region: "eu",
      usage: usage.chat(1000, 200)
    })
  );
  
  usImpacts.push(
    estimateImpact({
      gpuPowerW: 350,
      region: "us",
      usage: usage.chat(1000, 200)
    })
  );
}

const euTotal = aggregateImpacts(euImpacts);
const usTotal = aggregateImpacts(usImpacts);

console.log(`EU total: ${euTotal.co2Grams} g CO2`);
console.log(`US total: ${usTotal.co2Grams} g CO2`);
console.log(`Saving: ${usTotal.co2Grams - euTotal.co2Grams} g CO2`);
```

## Example: Category Breakdown

```javascript
const byCategory = {
  chat: [],
  embeddings: [],
  audio: [],
  images: []
};

// Categorize requests
byCategory.chat.push(
  estimateImpact({ gpuPowerW: 350, region: "eu", usage: usage.chat(1000, 200) })
);
byCategory.embeddings.push(
  estimateImpact({ gpuPowerW: 250, region: "eu", usage: usage.embeddings(500) })
);
byCategory.audio.push(
  estimateImpact({ gpuPowerW: 300, region: "eu", usage: usage.audioTranscription(60) })
);

// Aggregate each category
Object.entries(byCategory).forEach(([category, impacts]) => {
  const total = aggregateImpacts(impacts);
  console.log(`${category}: ${total.co2Grams} g CO2`);
});
```

## Return Value

```typescript
interface AggregateImpactResult {
  count: number;      // Number of impact results aggregated
  energyKwh: number;  // Total energy in kWh
  co2Grams: number;   // Total CO2 emissions in grams
}
```

## Use Cases

### 1. Daily Carbon Report

```javascript
function getDailyReport() {
  // Your application logic collects estimates throughout the day
  const dailyEstimates = collectDailyEstimates();
  return aggregateImpacts(dailyEstimates);
}

const report = getDailyReport();
console.log(`Today's carbon footprint: ${report.co2Grams} g CO2`);
```

### 2. Monthly Dashboard

```javascript
const monthlyData = [];
// ... collect data throughout the month ...

const monthlyTotal = aggregateImpacts(monthlyData);
console.log(`Monthly energy: ${monthlyTotal.energyKwh.toFixed(2)} kWh`);
console.log(`Monthly CO2: ${monthlyTotal.co2Grams.toFixed(1)} g`);
```

### 3. Cost Projection

```javascript
const daily = aggregateImpacts(getDailyEstimates());

// Assuming $0.12 per kWh and $0.05 per kg CO2
const energyCost = daily.energyKwh * 0.12;
const co2Cost = (daily.co2Grams / 1000) * 0.05;

console.log(`Daily cost breakdown:`);
console.log(`Energy: $${energyCost.toFixed(2)}`);
console.log(`Carbon: $${co2Cost.toFixed(2)}`);
console.log(`Total: $${(energyCost + co2Cost).toFixed(2)}`);
```

## Performance

The function uses a simple reduction algorithm and is highly performant even with large arrays:

```javascript
// Can handle 10,000+ results efficiently
const largeSet = Array.from({ length: 10000 }, () => 
  estimateImpact({ gpuPowerW: 350, region: "eu", usage: usage.chat(1000, 200) })
);

const total = aggregateImpacts(largeSet);
// Fast execution, no performance issues
```

## See Also

- 📖 [estimateImpact()](/api/estimate-impact.md) - Individual calculation
- 📖 [estimateImpactRange()](/api/estimate-impact-range.md) - Range calculations
