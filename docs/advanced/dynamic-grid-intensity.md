# Dynamic Grid Intensity

Fetching and using real-time or time-based carbon intensity data.

## Overview

The `gridIntensityResolver` option allows you to provide dynamic grid carbon intensity values based on timestamp and region, enabling more accurate and time-sensitive Carbon reporting.

## Why Use Dynamic Grid Intensity?

### Static vs Dynamic

**Static (Region-based)**:
- Uses average for the region
- Simple but less accurate
- Good for estimates

**Dynamic (Time-based)**:
- Real-time or historical values
- More accurate reporting
- Enables time-of-day optimization

### Use Cases

- Hourly carbon intensity reporting
- Predictive scheduling (run tasks during low-intensity hours)
- Historical analysis with actual grid data
- Data centers with renewable contracts

---

## Basic Usage

### Example: Using a Resolver

```javascript
import { estimateImpact, usage } from "ai-footprint";

const result = estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  timestamp: new Date(),
  gridIntensityResolver: ({ region, timestamp }) => {
    return fetchGridIntensity(region, timestamp);
  },
  usage: usage.chat(1000, 200)
});

console.log("Actual grid intensity: ", result.gridCarbonIntensityGPerKwh);
```

### Resolver Signature

```typescript
gridIntensityResolver: (input: {
  region?: RegionInput;
  timestamp?: Date | number;
}) => number;
```

---

## Complete Examples

### Example 1: Simple Hourly Resolver

```javascript
function hourlyGridResolver({ region, timestamp }) {
  const baseIntensity = getBaseIntensity(region);
  const hour = new Date(timestamp).getHour();
  
  // Peak hours (8-20) have 30% higher intensity
  if (hour >= 8 && hour <= 20) {
    return baseIntensity * 1.3;
  }
  
  // Off-peak hours (20-8) have 30% lower intensity
  return baseIntensity * 0.7;
}

const result = estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  timestamp: Date.now(),
  gridIntensityResolver: hourlyGridResolver,
  usage: usage.chat(1000, 200)
});
```

### Example 2: API Integration

```javascript
async function fetchGridIntensity(region, timestamp) {
  const response = await fetch(
    `https://api.carbon-intensity.gov.uk/regional/intensity/${timestamp}`
  );
  const data = await response.json();
  
  return data.data[0].intensity;  // gCO2/kWh
}

const result = await estimateImpact({
  gpuPowerW: 350,
  region: "uk",
  timestamp: Date.now(),
  gridIntensityResolver: async ({ region, timestamp }) => {
    return await fetchGridIntensity(region, timestamp);
  },
  usage: usage.chat(1000, 200)
});
```

### Example 3: Historical Data

```javascript
function historicalResolver({ region, timestamp }) {
  // Your database or API for historical grid data
  return db.query(
    "SELECT intensity FROM grid_intensity WHERE region = ? AND timestamp = ?",
    [region, timestamp]
  );
}

const historicalEstimate = estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  timestamp: new Date("2024-01-01T12:00:00"),
  gridIntensityResolver: historicalResolver,
  usage: usage.chat(1000, 200)
});
```

### Example 4: Data Center Specific

```javascript
function dataCenterResolver({ region }) {
  // Your data center has a mix of grid and renewables
  const baseIntensity = getBaseIntensity(region);
  const renewablePenetration = 0.65;  // 65% renewable
  
  // Adjust intensity based on renewable mix
  return baseIntensity * (1 - renewablePenetration);
}

const result = estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  gridIntensityResolver: dataCenterResolver,
  usage: usage.chat(1000, 200)
});
```

---

## Advanced Patterns

### Pattern 1: Fallback to Region

```javascript
function smartResolver({ region, timestamp }) {
  // Try to fetch live data
  const liveIntensity = fetchLiveIntensity(region, timestamp);
  
  if (liveIntensity) {
    return liveIntensity;
  }
  
  // Fall back to region average
  return getBaseIntensity(region);
}
```

### Pattern 2: Caching Resolver

```javascript
const intensityCache = new Map();

function cachedResolver({ region, timestamp }) {
  const key = `${region}-${timestamp}`;
  
  if (intensityCache.has(key)) {
    return intensityCache.get(key);
  }
  
  const intensity = fetchLiveIntensity(region, timestamp);
  intensityCache.set(key, intensity);
  
  return intensity;
}
```

### Pattern 3: Prediction-Based

```javascript
function predictableResolver({ region, timestamp }) {
  const hour = new Date(timestamp).getHours();
  
  // Use historical patterns for prediction
  const historicalAvg = getHourlyAverage(region, hour);
  const trend = getRecentTrend(region);
  
  return historicalAvg * (1 + trend);
}
```

---

## Use Cases

### Use Case 1: Carbon-Aware Scheduling

```javascript
function findBestTimeToRun(region, workload) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const predictions = hours.map(hour => {
    const timestamp = new Date();
    timestamp.setHours(hour);
    
    const intensity = hourlyGridResolver({ region, timestamp });
    const result = estimateImpact({
      gpuPowerW: 350,
      region,
      gridCarbonIntensityGPerKwh: intensity,
      usage: usage.chat(workload.input, workload.output)
    });
    
    return { hour, co2: result.co2Grams };
  });
  
  return predictions.sort((a, b) => a.co2 - b.co2)[0];
}

const bestTime = findBestTimeToRun("eu", { input: 1000, output: 200 });
console.log("Best hour: ", bestTime.hour, " (", bestTime.co2, "g CO2)");
```

### Use Case 2: Time-Weighted Reporting

```javascript
function calculateTimeWeightedIntensity(estimates) {
  const totalEnergy = estimates.reduce((sum, e) => sum + e.energyKwh, 0);
  
  return estimates.reduce((sum, e) => {
    return sum + (e.gridCarbonIntensityGPerKwh * e.energyKwh);
  }, 0) / totalEnergy;
}

const estimates = [
  estimateImpact({ 
    gpuPowerW: 350, 
    region: "eu", 
    timestamp: 1000000000,
    gridIntensityResolver: hourlyResolver,
    usage: usage.chat(1000, 200)
  }),
  estimateImpact({ 
    gpuPowerW: 350, 
    region: "eu", 
    timestamp: 2000000000,
    gridIntensityResolver: hourlyResolver,
    usage: usage.chat(1000, 200)
  }),
  // ... more estimates
];

const weightedIntensity = calculateTimeWeightedIntensity(estimates);
console.log("Time-weighted intensity: ", weightedIntensity, "gCO2/kWh");
```

### Use Case 3: Live Dashboard

```javascript
function createLiveDashboard(region) {
  setInterval(async () => {
    const result = await estimateImpact({
      gpuPowerW: 350,
      region,
      timestamp: Date.now(),
      gridIntensityResolver: async ({ region, timestamp }) => {
        return await fetchLiveIntensity(region, timestamp);
      },
      usage: usage.chat(1000, 200)
    });
    
    updateDashboard({
      intensity: result.gridCarbonIntensityGPerKwh,
      co2: result.co2Grams,
      timestamp: new Date()
    });
  }, 60000);  // Update every minute
}
```

---

## Integration Examples

### Integration 1: UK Carbon Intensity API

```javascript
async function ukResolver({ region, timestamp }) {
  const response = await fetch(
    "https://api.carbon-intensity.gov.uk/regional/intensity/latest"
  );
  const data = await response.json();
  
  // Find your region in the response
  const ukRegion = data.data.find(r => r.regionid === region.toUpperCase());
  return ukRegion?.intensity ?? getBaseIntensity("uk");
}

const result = estimateImpact({
  gpuPowerW: 350,
  region: "uk",
  gridIntensityResolver: ukResolver,
  usage: usage.chat(1000, 200)
});
```

### Integration 2: Electricity Maps API

```javascript
const API_URL = "https://api.electricitymap.org/v3/carbon-intensity/history";

async function euResolver({ region, timestamp }) {
  const response = await fetch(
    `${API_URL}?zone=${region}&lastDays=1`,
    { headers: { "X-Auth-Token": process.env.ELECTRICITYMAP_TOKEN } }
  );
  const data = await response.json();
  
  // Get the most recent value
  return data.history[0]?.intensity ?? getBaseIntensity(region);
}

const result = estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  gridIntensityResolver: euResolver,
  usage: usage.chat(1000, 200)
});
```

---

## Best Practices

### 1. Cache resolver results

Avoid API rate limits with caching:

```javascript
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;  // 5 minutes

function cachedResolver({ region, timestamp }) {
  const key = `${region}-${Math.floor(timestamp / CACHE_TTL)}`;
  
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const intensity = fetchLiveIntensity(region, timestamp);
  cache.set(key, intensity);
  
  return intensity;
}
```

### 2. Handle errors gracefully

```javascript
async function safeResolver({ region, timestamp }) {
  try {
    return await fetchLiveIntensity(region, timestamp);
  } catch (error) {
    console.warn("Error fetching intensity, using fallback");
    return getBaseIntensity(region);
  }
}
```

### 3. Validate return values

```javascript
function validatedResolver({ region, timestamp }) {
  const intensity = fetchLiveIntensity(region, timestamp);
  
  if (intensity <= 0) {
    console.warn("Invalid intensity value, using fallback");
    return getBaseIntensity(region);
  }
  
  return intensity;
}
```

---

## See Also

- 📖 [estimateImpact()](/api/estimate-impact.md) - Main function
- 📖 [Input Options](/input-options/) - All parameters
- 📖 [Region & Grid Intensity](/input-options/region-grid) - Base intensity values
