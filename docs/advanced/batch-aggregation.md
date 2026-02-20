# Batch Aggregation

Combining multiple impact results for cumulative totals and reporting.

## Overview

Use `aggregateImpacts()` to batch multiple impact calculations into summary statistics for time periods (daily, weekly, monthly).

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

console.log("Total count: ", total.count);  // 3
console.log("Total energy: ", total.energyKwh.toFixed(4), "kWh");
console.log("Total CO2: ", total.co2Grams.toFixed(2), "g");
```

## Complete Examples

### Example 1: Daily Carbon Report

```javascript
function getDailyReport() {
  // Your application collects estimates throughout the day
  const dailyEstimates = [];
  
  // Simulate 100 requests
  for (let i = 0; i < 100; i++) {
    dailyEstimates.push(
      estimateImpact({
        gpuPowerW: 350,
        region: "eu",
        usage: usage.chat(1000 + Math.random() * 500, 200 + Math.random() * 100)
      })
    );
  }
  
  return aggregateImpacts(dailyEstimates);
}

const daily = getDailyReport();

console.log("Daily Carbon Report:");
console.log("  Requests: ", daily.count);
console.log("  Energy: ", daily.energyKwh.toFixed(2), "kWh");
console.log("  CO2: ", daily.co2Grams.toFixed(1), "g");
console.log("  Avg per request: ", (daily.co2Grams / daily.count).toFixed(2), "g");
```

### Example 2: Weekly Comparison

```javascript
function getWeekReport() {
  const weekly = [];
  
  for (let day = 0; day < 7; day++) {
    // 100 requests per day
    for (let i = 0; i < 100; i++) {
      weekly.push(
        estimateImpact({
          gpuPowerW: 350,
          region: "eu",
          usage: usage.chat(1000, 200)
        })
      );
    }
  }
  
  return aggregateImpacts(weekly);
}

const weeklyTotal = getWeekReport();

console.log("Weekly Summary:");
console.log("  Total requests: ", weeklyTotal.count);
console.log("  Total energy: ", weeklyTotal.energyKwh.toFixed(2), "kWh");
console.log("  Total CO2: ", weeklyTotal.co2Grams.toFixed(1), "g");
console.log("  Daily average CO2: ", (weeklyTotal.co2Grams / 7).toFixed(1), "g");
```

### Example 3: Regional Breakdown

```javascript
function getCategoryTotals() {
  const byRegion = {
    eu: [],
    us: [],
    other: []
  };
  
  // Process requests
  requests.forEach(req => {
    const result = estimateImpact({
      gpuPowerW: req.power,
      region: req.region,
      usage: usage.chat(req.inputTokens, req.outputTokens)
    });
    
    if (["eu", "us"].includes(req.region)) {
      byRegion[req.region].push(result);
    } else {
      byRegion.other.push(result);
    }
  });
  
  // Aggregate each region
  return {
    eu: aggregateImpacts(byRegion.eu),
    us: aggregateImpacts(byRegion.us),
    other: aggregateImpacts(byRegion.other)
  };
}

const totals = getCategoryTotals();

console.log("Regional Breakdown:");
console.log("  EU: ", totals.eu.co2Grams.toFixed(1), "g (", totals.eu.count, "requests)");
console.log("  US: ", totals.us.co2Grams.toFixed(1), "g (", totals.us.count, "requests)");
console.log("  Other: ", totals.other.co2Grams.toFixed(1), "g (", totals.other.count, "requests)");

const grandTotal = aggregateImpacts([
  ...totals.eu,
  ...totals.us,
  ...totals.other
]);
console.log("Total: ", grandTotal.co2Grams.toFixed(1), "g");
```

### Example 4: Monthly Reporting

```javascript
function getMonthlySummary() {
  const monthly = [];
  const daysInMonth = 30;
  
  for (let day = 1; day <= daysInMonth; day++) {
    // Simulate daily requests
    const dailyEstimates = Array.from({ length: 100 }, () =>
      estimateImpact({
        gpuPowerW: 350,
        region: "eu",
        usage: usage.chat(1000, 200)
      })
    );
    
    monthly.push(...dailyEstimates);
  }
  
  return aggregateImpacts(monthly);
}

const monthly = getMonthlySummary();

console.log("Monthly Usage:");
console.log("  Total requests: ", monthly.count);
console.log("  Total energy: ", monthly.energyKwh.toFixed(2), "kWh");
console.log("  Total CO2: ", monthly.co2Grams.toFixed(1), "g");
console.log("  Cost (at $0.12/kWh): $", (monthly.energyKwh * 0.12).toFixed(2));
```

---

## Use Cases

### 1. Dashboard widget

```javascript
const DailyCarbonWidget = () => {
  const [totals, setTotals] = useState({ count: 0, co2Grams: 0 });
  
  useEffect(() => {
    const estimates = loadTodayEstimates();
    const total = aggregateImpacts(estimates);
    setTotals(total);
  }, []);
  
  return (
    <div className="widget">
      <h3>Daily Carbon Footprint</h3>
      <div className="metric">
        {totals.co2Grams.toFixed(1)}g CO₂
        <span className="subtext">{totals.count} requests</span>
      </div>
    </div>
  );
};
```

### 2. Cost comparison

```javascript
function costComparison(region1, region2) {
  const r1Estimates = getEstimatesForRegion(region1);
  const r2Estimates = getEstimatesForRegion(region2);
  
  const r1Total = aggregateImpacts(r1Estimates);
  const r2Total = aggregateImpacts(r2Estimates);
  
  const energyCost1 = r1Total.energyKwh * 0.12;  // $/kWh
  const energyCost2 = r2Total.energyKwh * 0.12;
  
  const co2Cost1 = (r1Total.co2Grams / 1000) * 50;  // $/ton CO2
  const co2Cost2 = (r2Total.co2Grams / 1000) * 50;
  
  return {
    region1: {
      total: r1Total.co2Grams,
      energyCost: energyCost1,
      co2Cost: co2Cost1,
      combined: energyCost1 + co2Cost1
    },
    region2: {
      total: r2Total.co2Grams,
      energyCost: energyCost2,
      co2Cost: co2Cost2,
      combined: energyCost2 + co2Cost2
    }
  };
}
```

### 3. Trend analysis

```javascript
function analyzeTrend(weeks) {
  const weeklyTotals = weeks.map(week => {
    const estimates = week.map(req =>
      estimateImpact({
        gpuPowerW: req.power,
        region: req.region,
        usage: usage.chat(req.inputTokens, req.outputTokens)
      })
    );
    return aggregateImpacts(estimates);
  });
  
  const average = weeklyTotals.reduce((sum, t) => sum + t.co2Grams, 0) / weeks.length;
  const min = Math.min(...weeklyTotals.map(t => t.co2Grams));
  const max = Math.max(...weeklyTotals.map(t => t.co2Grams));
  
  return { average, min, max, trends: weeklyTotals };
}

const trend = analyzeTrend(weeklyData);

console.log("Average weekly CO2: ", trend.average.toFixed(1));
console.log("Min: ", trend.min.toFixed(1), " | Max: ", trend.max.toFixed(1));
```

---

## Performance

`aggregateImpacts()` is highly performant and can handle large datasets:

```javascript
// 10,000 estimates aggregated in milliseconds
const largeDataset = Array.from({ length: 10000 }, () =>
  estimateImpact({ gpuPowerW: 350, region: "eu", usage: usage.chat(1000, 200) })
);

const total = aggregateImpacts(largeDataset);
// Fast execution, no performance issues
```

---

## Best Practices

### 1. Batch by Time Period

Organize your estimates by the reporting period:

```javascript
const dailyTotals = days.map(day => {
  const dayEstimates = getEstimatesForDate(day);
  return aggregateImpacts(dayEstimates);
});
```

### 2. Combine Ranges and Aggregation

For uncertainty-aware reporting:

```javascript
function aggregateWithRanges(weekEstimates) {
  const ranges = weekEstimates.map(req =>
    estimateImpactRange(req, {
      gpuPowerW: { min: 0.85 * 350, max: 1.15 * 350 }
    })
  );
  
  return {
    base: aggregateImpacts(ranges.map(r => r.base)),
    min: aggregateImpacts(ranges.map(r => ({
      energyKwh: r.energyKwhMin,
      co2Grams: r.co2GramsMin
    }))),
    max: aggregateImpacts(ranges.map(r => ({
      energyKwh: r.energyKwhMax,
      co2Grams: r.co2GramsMax
    })))
  };
}
```

### 3. Cache Results

For dashboards, cache aggregation results:

```javascript
let cachedTotals = null;
let lastUpdate = null;

function getDailyTotals() {
  const now = Date.now();
  if (cachedTotals && (now - lastUpdate) < 60000) {  // 1 minute cache
    return cachedTotals;
  }
  
  const estimates = loadTodayEstimates();
  cachedTotals = aggregateImpacts(estimates);
  lastUpdate = now;
  
  return cachedTotals;
}
```

---

## See Also

- 📖 [estimateImpact()](/api/estimate-impact.md) - Single calculation
- 📖 [estimateImpactRange()](/api/estimate-impact-range.md) - Range calculations
- 📖 [API Reference](/api/) - Complete function documentation
