# Custom Grid Resolvers

Advanced patterns for custom grid carbon intensity resolution.

## Overview

The `gridIntensityResolver` function gives you complete control over how grid carbon intensity is determined, enabling custom logic, integrations, and advanced patterns.

## Resolver Signature

```typescript
(input: {
  region?: RegionInput;
  timestamp?: Date | number;
}) => number;
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `region` | `RegionInput` | The region being queried (could be undefined) |
| `timestamp` | `Date \| number` | The timestamp for the request (optional) |

### Return Value

| Type | Description |
|------|-------------|
| `number` | Grid carbon intensity in gCO2/kWh |

---

## Custom Resolver Examples

### 1. Hourly Grid Intensity Pattern

```typescript
function hourlyPatternResolver({ region, timestamp }) {
  const baseIntensity = getBaseIntensity(region);
  const hour = new Date(timestamp).getHours();
  
  // Define hourly pattern for your region
  const patterns = {
    peak: baseIntensity * 1.3,   // 08:00-20:00
    offpeak: baseIntensity * 0.7  // 20:00-08:00
  };
  
  return (hour >= 8 && hour <= 20) ? patterns.peak : patterns.offpeak;
}

// Use in calculation
const result = estimateImpact({
  gpuPowerW: 350,
  region: "us",
  timestamp: Date.now(),
  gridIntensityResolver: hourlyPatternResolver,
  usage: usage.chat(1000, 200)
});
```

### 2. Renewable Integration

```typescript
function renewableResolver({ region }) {
  const baseIntensity = getBaseIntensity(region);
  
  // Your data center has 70% renewable energy
  const renewableShare = 0.7;
  const gridShare = 1 - renewableShare;
  
  // Renewable has ~0 gCO2/kWh (solar/wind/hydro)
  // Grid has base intensity
  return baseIntensity * gridShare;
}

const result = estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  gridIntensityResolver: renewableResolver,
  usage: usage.chat(1000, 200)
});
```

### 3. Historical Database Lookup

```typescript
async function databaseResolver({ region, timestamp }) {
  const date = new Date(timestamp);
  const query = `
    SELECT intensity FROM grid_history 
    WHERE region = ? 
    AND date_trunc('hour', timestamp) = ?
  `;
  
  const result = await db.query(query, [
    region,
    date.toISOString().split(':')[0] + ':00:00Z'
  ]);
  
  return result[0]?.intensity || getBaseIntensity(region);
}

const historical = await estimateImpact({
  gpuPowerW: 350,
  region: "de",
  timestamp: new Date("2024-06-15T14:00:00Z"),
  gridIntensityResolver: databaseResolver,
  usage: usage.chat(1000, 200)
});
```

### 4. API Integration with Fallback

```typescript
async function apiResolver({ region, timestamp }) {
  try {
    const response = await fetch(
      `https://api.example.com/intensity/${region}?timestamp=${timestamp}`,
      { headers: { "X-API-Key": process.env.API_KEY } }
    );
    const data = await response.json();
    
    return data.intensity;  // Validate this value
  } catch (error) {
    console.warn("API error, using regional average");
    return getBaseIntensity(region);
  }
}

const result = estimateImpact({
  gpuPowerW: 350,
  region: "us",
  timestamp: Date.now(),
  gridIntensityResolver: apiResolver,
  usage: usage.chat(1000, 200)
});
```

### 5. Real-Time Grid Data

```typescript
const intensityCache = new Map();

async function liveResolver({ region, timestamp }) {
  const cacheKey = `${region}-${Math.floor(timestamp / 300000)}`;  // 5min buckets
  
  if (intensityCache.has(cacheKey)) {
    return intensityCache.get(cacheKey);
  }
  
  const response = await fetch(
    "https://api.electricitymap.org/v3/carbon-intensity/latest?zone=" + region,
    { headers: { "X-Auth-Token": process.env.ELECTRICITYMAP_TOKEN } }
  );
  const data = await response.json();
  
  const intensity = data.intensity;
  intensityCache.set(cacheKey, intensity);
  
  return intensity;
}

const result = estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  timestamp: Date.now(),
  gridIntensityResolver: liveResolver,
  usage: usage.chat(1000, 200)
});
```

---

## Advanced Patterns

### Pattern 1: Hybrid Resolution

```typescript
function hybridResolver({ region, timestamp }) {
  // Priority 1: Live data (if available)
  const liveIntensity = fetchLiveIntensity(region, timestamp);
  if (liveIntensity > 0) return liveIntensity;
  
  // Priority 2: Predicted pattern
  const predicted = predictIntensity(region, timestamp);
  if (predicted > 0) return predicted;
  
  // Priority 3: Historical average
  return getHistoricalAverage(region);
}
```

### Pattern 2: Region Overrides

```typescript
function customResolver({ region, timestamp }) {
  // Special handling for specific regions
  if (region === "is") {
    return 0;  // Iceland is 100% renewable
  }
  
  return getBaseIntensity(region);
}
```

### Pattern 3: Time-Weighted Averages

```typescript
function timeWeightedResolver({ region, timestamp }) {
  // Get intensity for several hours around the timestamp
  const hours = [-1, 0, 1].map(offset => {
    const time = new Date(timestamp).setHours(
      new Date(timestamp).getHours() + offset
    );
    return getHourlyIntensity(region, time);
  });
  
  // Return average
  return hours.reduce((sum, val) => sum + val, 0) / hours.length;
}
```

---

## Integration Examples

### Integration 1: Carbon Interface API

```typescript
async function carbonInterfaceResolver({ region, timestamp }) {
  const month = new Date(timestamp).getMonth() + 1;
  const year = new Date(timestamp).getFullYear();
  
  const response = await fetch(
    `https://api.carboninterface.com/v1/estimations?region=${region}&month=${month}&year=${year}`,
    { headers: { "Authorization": `Bearer ${process.env.CARBON_INTERFACE_KEY}` } }
  );
  
  const data = await response.json();
  
  // Use the most recent value
  return data.data[0]?.intensity;
}
```

### Integration 2: GridCarbon API

```typescript
async function gridCarbonResolver({ region, timestamp }) {
  const response = await fetch(
    "https://api.gridcarbon.io/v1/region/" + region,
    { headers: { "API-Key": process.env.GRIDCARBON_KEY } }
  );
  
  const data = await response.json();
  
  return data.currentIntensity;
}
```

### Integration 3: Custom Database

```typescript
// Setup your database connection
const db = new Database("intensity.db");

// Create resolver
function dbResolver({ region, timestamp }) {
  return new Promise((resolve) => {
    const date = new Date(timestamp);
    
    db.get(
      "SELECT intensity FROM grid_data WHERE region = ? AND strftime('%Y-%m-%d', datetime) = ?",
      [region, date.toISOString().split('T')[0]],
      (err, row) => {
        if (err || !row) {
          resolve(getBaseIntensity(region));
        } else {
          resolve(row.intensity);
        }
      }
    );
  });
}
```

---

## Best Practices

### 1. Always Validate

```typescript
function safeResolver({ region, timestamp }) {
  const intensity = fetchLiveIntensity(region, timestamp);
  
  // Validate the result
  if (!Number.isFinite(intensity) || intensity <= 0) {
    console.warn("Invalid intensity:", intensity);
    return getBaseIntensity(region);
  }
  
  return intensity;
}
```

### 2. Implement Caching

```typescript
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;  // 5 minutes

function cachedResolver({ region, timestamp }) {
  const now = Date.now();
  
  // Check cache
  if (cache.has(region)) {
    const { value, time } = cache.get(region);
    if (now - time < CACHE_DURATION) {
      return value;
    }
  }
  
  // Fetch fresh value
  const value = fetchLiveIntensity(region, timestamp);
  cache.set(region, { value, time: now });
  
  return value;
}
```

### 3. Handle Timezones

```typescript
function timezoneAwareResolver({ region, timestamp }) {
  const date = new Date(timestamp);
  
  // Convert to region's local time
  const regionTime = date.toLocaleString("en-US", {
    timeZone: getRegionTimeZone(region)
  });
  
  const hour = new Date(regionTime).getHours();
  
  return getHourlyIntensity(region, hour);
}
```

### 4. Rate Limiting

```typescript
let lastRequest = 0;
const RATE_LIMIT = 1000;  // 1 request per second

async function throttledResolver({ region, timestamp }) {
  const now = Date.now();
  
  if (now - lastRequest < RATE_LIMIT) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT));
  }
  
  lastRequest = Date.now();
  return await fetchLiveIntensity(region, timestamp);
}
```

---

## Testing Resolvers

### Unit Test

```typescript
describe("hourlyGridResolver", () => {
  it("returns higher intensity during peak hours", () => {
    const peakHour = 12;  // 12:00 PM
    const result = hourlyGridResolver({
      region: "us",
      timestamp: new Date(2024, 0, 1, peakHour)
    });
    
    expect(result).toBeGreaterThan(getBaseIntensity("us"));
  });
  
  it("returns lower intensity during off-peak hours", () => {
    const offPeakHour = 2;  // 2:00 AM
    const result = hourlyGridResolver({
      region: "us",
      timestamp: new Date(2024, 0, 1, offPeakHour)
    });
    
    expect(result).toBeLessThan(getBaseIntensity("us"));
  });
});
```

### Integration Test

```typescript
test("resolver works with estimateImpact", async () => {
  const result = await estimateImpact({
    gpuPowerW: 350,
    region: "eu",
    timestamp: Date.now(),
    gridIntensityResolver: liveResolver,
    usage: usage.chat(1000, 200)
  });
  
  expect(result.gridCarbonIntensityGPerKwh).toBeGreaterThan(0);
  expect(result.co2Grams).toBeGreaterThan(0);
});
```

---

## See Also

- 📖 [Dynamic Grid Intensity](/advanced/dynamic-grid-intensity.md) - Overview
- 📖 [estimateImpact()](/api/estimate-impact.md) - Function with resolver
- 📖 [Input Options](/input-options/) - All parameters
