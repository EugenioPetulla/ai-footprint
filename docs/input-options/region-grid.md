# Region & Grid Intensity

Complete guide to supported regions and carbon intensity values.

## Overview

The library uses geographic regions to determine the grid carbon intensity (gCO2/kWh). This reflects the average emissions from electricity generation in each region.

## Supported Regions

### Base Regions (37 total)

The library supports 37 regions with 2025 data from Our World in Data:

#### Global
- `global` - Global average (475 gCO2/kWh)

#### Americas
- `us` - United States (400 gCO2/kWh)
- `ca` - Canada (130 gCO2/kWh)

#### Asia
- `jp` - Japan (470 gCO2/kWh)
- `sg` - Singapore (470 gCO2/kWh)
- `in` - India (700 gCO2/kWh)

#### Oceania
- `au` - Australia (600 gCO2/kWh)

#### South America
- `br` - Brazil (80 gCO2/kWh)

#### Europe (28 countries)
- `eu` - European Union (210 gCO2/kWh)
- `at` - Austria (114 gCO2/kWh)
- `be` - Belgium (150 gCO2/kWh)
- `ba` - Bosnia and Herzegovina (612 gCO2/kWh)
- `bg` - Bulgaria (275 gCO2/kWh)
- `hr` - Croatia (160 gCO2/kWh)
- `cy` - Cyprus (488 gCO2/kWh)
- `cz` - Czechia (401 gCO2/kWh)
- `dk` - Denmark (114 gCO2/kWh)
- `ee` - Estonia (319 gCO2/kWh)
- `fi` - Finland (57 gCO2/kWh)
- `fr` - France (42 gCO2/kWh)
- `de` - Germany (332 gCO2/kWh)
- `gr` - Greece (316 gCO2/kWh)
- `hu` - Hungary (162 gCO2/kWh)
- `ie` - Ireland (256 gCO2/kWh)
- `xk` - Kosovo (947 gCO2/kWh)
- `lv` - Latvia (139 gCO2/kWh)
- `lt` - Lithuania (140 gCO2/kWh)
- `lu` - Luxembourg (124 gCO2/kWh)
- `mt` - Malta (472 gCO2/kWh)
- `me` - Montenegro (265 gCO2/kWh)
- `mk` - North Macedonia (531 gCO2/kWh)
- `nl` - Netherlands (253 gCO2/kWh)
- `no` - Norway (29 gCO2/kWh)
- `pl` - Poland (592 gCO2/kWh)
- `pt` - Portugal (128 gCO2/kWh)
- `ro` - Romania (251 gCO2/kWh)
- `rs` - Serbia (696 gCO2/kWh)
- `sk` - Slovakia (95 gCO2/kWh)
- `si` - Slovenia (183 gCO2/kWh)
- `es` - Spain (153 gCO2/kWh)
- `se` - Sweden (35 gCO2/kWh)
- `ch` - Switzerland (33 gCO2/kWh)
- `tr` - Turkey (475 gCO2/kWh)
- `uk` - United Kingdom (217 gCO2/kWh)

## Common Aliases

The library automatically normalizes these common aliases:

### United Kingdom
- `gb`
- `united kingdom`

### United States
- `usa`
- `us-east`
- `us-west`
- `us-central`

### European Union
- `eu-west`
- `eu-central`
- `europe`
- `eu (ember)`

### Country Names
- `czechia` → `cz`
- `switzerland` → `ch`
- `turkey` → `tr`
- `kosovo` → `xk`
- `north macedonia` → `mk`
- `montenegro` → `me`
- `serbia` → `rs`
- `bosnia and herzegovina` → `ba`

## Region Resolution

### Priority Order

1. **Explicit `gridCarbonIntensityGPerKwh`** - Overrides everything
2. **`gridIntensityResolver`** - Custom resolver function
3. **Normalized region** - From region or alias
4. **Global fallback** - 475 gCO2/kWh with console warning

### Example: Unknown Region

```javascript
const result = estimateImpact({
  gpuPowerW: 350,
  region: "unknown-country"
  // Console warning: "Unknown region 'unknown-country', falling back to global carbon intensity."
  // Uses: global (475 gCO2/kWh)
});
```

## Custom Grid Intensity

### Explicit Value

Override region lookup with your own value:

```javascript
const result = estimateImpact({
  gpuPowerW: 350,
  gridCarbonIntensityGPerKwh: 210,  // Your custom value
  usage: usage.chat(1000, 200)
});
```

### Dynamic Resolver

Use a custom function for dynamic values:

```javascript
const result = estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  gridIntensityResolver: ({ region, timestamp }) => {
    // Example: Fetch from live API
    return fetchGridIntensity(region, timestamp);
  },
  usage: usage.chat(1000, 200)
});
```

## Carbon Intensity Data

### Source

- **Provider**: Our World in Data
- **Dataset**: [Carbon Intensity Electricity](https://ourworldindata.org/grapher/carbon-intensity-electricity)
- **Year**: 2025
- **Unit**: gCO2/kWh

### Metadata

```typescript
{
  year: 2025,
  unit: "gCO2/kWh",
  source: "Our World in Data",
  sourceUrl: "https://ourworldindata.org/grapher/carbon-intensity-electricity"
}
```

### Exported Constant

```javascript
import { GRID_CARBON_INTENSITY_2025_METADATA, DEFAULT_GRID_CARBON_G_PER_KWH } from "ai-footprint";

console.log(GRID_CARBON_INTENSITY_2025_METADATA);
// { year: 2025, unit: "gCO2/kWh", ... }

console.log(DEFAULT_GRID_CARBON_G_PER_KWH["eu"]);
// 210.21
```

## regional Comparison Examples

### High vs Low Carbon Regions

```javascript
const poland = estimateImpact({
  gpuPowerW: 350,
  region: "pl",  // 592 gCO2/kWh (high)
  usage: usage.chat(1000, 200)
});

const norway = estimateImpact({
  gpuPowerW: 350,
  region: "no",  // 29 gCO2/kWh (low)
  usage: usage.chat(1000, 200)
});

console.log(`Poland: ${poland.co2Grams} g CO2`);
console.log(`Norway: ${norway.co2Grams} g CO2`);
console.log(`Saving: ${poland.co2Grams - norway.co2Grams} g CO2`);
```

### Global vs Regional

```javascript
const global = estimateImpact({
  gpuPowerW: 350,
  region: "global",
  usage: usage.chat(1000, 200)
});

const eu = estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  usage: usage.chat(1000, 200)
});

console.log(`Global average: ${global.gridCarbonIntensityGPerKwh} gCO2/kWh`);
console.log(`EU average: ${eu.gridCarbonIntensityGPerKwh} gCO2/kWh`);
```

## Best Practices

### 1. Use Specific Regions

Instead of `global`, use specific countries/regions for accurate estimates.

### 2. Update Data Annually

The library uses 2025 data. Consider updating annually as new data becomes available.

### 3. Consider Time-of-Day

Carbon intensity varies throughout the day. For precise estimates, use dynamic resolvers.

### 4. Data Centers

Data centers may have renewable energy contracts. Consider custom grid intensity for accuracy.

## See Also

- 📖 [estimateImpact()](/api/estimate-impact.md) - Function with region parameter
- 📖 [Dynamic Grid Intensity](/advanced/dynamic-grid-intensity.md) - Real-time data
