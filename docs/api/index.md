# API Reference

This section documents all exported functions and types from ai-footprint.

## Main Functions

### estimateImpact()

Calculates the energy and CO2 emissions for an AI inference request.

```typescript
function estimateImpact(input: ImpactInputs): ImpactResult
```

**Parameters:**
- `input`: `ImpactInputs` - Complete configuration object

**Returns:**
- `ImpactResult` - Calculation results with energy, CO2, and metadata

**Example:**
```javascript
import { estimateImpact, usage } from "ai-footprint";

const result = estimateImpact({
  gpuPowerW: 350,
  modelParamsB: 70,
  region: "eu",
  usage: usage.chat(1200, 400),
  throughput: { tokensPerSecond: 90 }
});
```

---

### estimateImpactMinimal()

Lightweight entry point for coarse estimates when you only know power and time.

```typescript
function estimateImpactMinimal(input: MinimalImpactInputs): ImpactResult
```

**Parameters:**
- `input`: `MinimalImpactInputs` - Simplified configuration

**Returns:**
- `ImpactResult` - Calculation results

**Example:**
```javascript
import { estimateImpactMinimal } from "ai-footprint";

const result = estimateImpactMinimal({
  gpuPowerW: 350,
  processingTimeSeconds: 2.5,
  region: "eu"
});
```

---

### estimateImpactRange()

Calculates uncertainy ranges (min/max) for energy and CO2 emissions.

```typescript
function estimateImpactRange(
  input: ImpactInputs,
  ranges: UncertaintyRanges
): ImpactRangeResult
```

**Parameters:**
- `input`: `ImpactInputs` - Base configuration
- `ranges`: `UncertaintyRanges` - Min/max ranges for uncertain inputs

**Returns:**
- `ImpactRangeResult` - Base result plus min/max values

**Example:**
```javascript
const result = estimateImpactRange({
  gpuPowerW: 350,
  region: "eu",
  usage: usage.chat(1200, 400)
}, {
  gpuPowerW: { min: 300, max: 420 },
  pue: { min: 1.1, max: 1.4 }
});

console.log(result.energyKwhMin, result.energyKwhMax);
console.log(result.co2GramsMin, result.co2GramsMax);
```

---

### aggregateImpacts()

Batches multiple impact results for cumulative totals.

```typescript
function aggregateImpacts(results: ImpactResult[]): AggregateImpactResult
```

**Parameters:**
- `results`: `ImpactResult[]` - Array of calculation results

**Returns:**
- `AggregateImpactResult` - Total count, energy, and CO2

**Example:**
```javascript
const results = [
  estimateImpact({ gpuPowerW: 350, region: "eu", usage: usage.chat(1000, 200) }),
  estimateImpact({ gpuPowerW: 250, region: "us", usage: usage.embeddings(500) })
];

const total = aggregateImpacts(results);
console.log(total.count, total.energyKwh, total.co2Grams);
```

---

## Usage Helpers

Convenience functions for creating usage objects.

### chat()

```typescript
function chat(inputTokens: number, outputTokens: number): ChatCompletionUsage
```

Creates usage object for chat completions.

### text()

```typescript
function text(inputTokens: number, outputTokens: number): TextCompletionUsage
```

Creates usage object for text completions.

### embeddings()

```typescript
function embeddings(inputTokens: number): EmbeddingsUsage
```

Creates usage object for embeddings.

### ocr()

```typescript
function ocr(inputTokens: number, outputTokens: number): OcrUsage
```

Creates usage object for OCR.

### audioTranscription()

```typescript
function audioTranscription(audioSeconds: number): AudioTranscriptionUsage
```

Creates usage object for audio transcription.

### audioTranslation()

```typescript
function audioTranslation(audioSeconds: number): AudioTranslationUsage
```

Creates usage object for audio translation.

### audioSpeech()

```typescript
function audioSpeech(audioSeconds: number): AudioSpeechUsage
```

Creates usage object for audio speech generation.

### imageGeneration()

```typescript
function imageGeneration(width: number, height: number, images?: number): ImageGenerationUsage
```

Creates usage object for image generation.

---

## Type Definitions

All types are available from the `ai-footprint` package.

### ModelCategory

```typescript
type ModelCategory = 
  | "chat.completions"
  | "text.completions"
  | "embeddings"
  | "ocr"
  | "audio.transcription"
  | "audio.translation"
  | "audio.speech"
  | "image.generation"
```

### RegionCode

Supports 37+ region codes including countries and major areas.

### ImpactInputs

Complete input configuration object with all available options.

### ImpactResult

Output object containing calculation results.

---

## Default Exports

### DEFAULT_GRID_CARBON_G_PER_KWH

Map of all supported regions with their carbon intensities.

### GRID_CARBON_INTENSITY_2025_METADATA

Metadata about the carbon intensity dataset:
- `year`: 2025
- `unit`: "gCO2/kWh"
- `source`: "Our World in Data"
- `sourceUrl`: URL to data source

---

## Complete Type List

| Type | Description |
|------|-------------|
| `ModelCategory` | Supported AI model categories |
| `RegionCode` | 37+ supported region codes |
| `RegionInput` | Region input (string or code) |
| `GridCarbonIntensityMap` | Region to intensity mapping |
| `BaseImpactInputs` | Required and basic optional inputs |
| `EnergyInputs` | Energy override parameters |
| `EfficiencyOptions` | Efficiency and overhead options |
| `ThroughputConfig` | Performance metrics |
| `ImpactInputs` | Complete input configuration |
| `MinimalImpactInputs` | Simplified input configuration |
| `ImpactResult` | Calculation results |
| `NumericRange` | Min/max range definition |
| `UncertaintyRanges` | Uncertainty input ranges |
| `ImpactRangeResult` | Range calculation results |
| `AggregateImpactResult` | Batch aggregated results |
| `Usage` | Union of all usage types |

---

## See Also

- 📖 [Usage Categories](/usage-categories/) - Examples by model type
- ⚙️ [Input Options](/input-options/) - Detailed parameter guide
- 🚀 [Advanced Features](/advanced/) - Uncertainty ranges, aggregation
