# Throughput Configuration

Performance metrics for automatic time calculation.

## Overview

Throughput configuration is used to automatically derive processing time from workload metrics. It's optional but recommended for accurate time estimation.

## Usage

### Token Throughput

For token-based models (chat, embeddings, etc.):

```javascript
const result = estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  usage: usage.chat(1000, 200),
  throughput: { tokensPerSecond: 100 }  // ~100 tokens/sec generated
});
```

### Audio Throughput

For audio models:

```javascript
const result = estimateImpact({
  gpuPowerW: 300,
  region: "uk",
  usage: usage.audioTranscription(120),
  throughput: { audioSecondsPerSecond: 0.5 }  // 2x real-time (0.5 = 1/2)
});
```

### Image Throughput

For image generation:

```javascript
const result = estimateImpact({
  gpuPowerW: 320,
  region: "de",
  usage: usage.imageGeneration(1024, 1024, 1),
  throughput: { pixelsPerSecond: 100000 }
});
```

## Throughput Values

### Typical Token Throughput

| Model | Tokens/Second | Notes |
|-------|---------------|-------|
| Small models (< 7B) | 100-300 | Fast generation |
| Medium models (7-70B) | 50-150 | Balanced |
| Large models (> 70B) | 20-80 | Slower generation |
| Quantized models | 2x baseline | INT8/INT4 faster |

### Typical Audio Throughput

| Model | Real-Time Factor | Notes |
|-------|------------------|-------|
| Whisper Base | 2-5x | Fast transcription |
| Whisper Large | 1-3x | Slower but accurate |
| Custom models | Varies | Check benchmarks |

### Typical Image Throughput

| Model | Pixels/Second | Notes |
|-------|---------------|-------|
| Stable Diffusion | 50k-200k | Varies by version |
| DALL·E | Varies | API-dependent |

## Time Calculation

Processing time is calculated as:

```
For token models:
  time = (inputTokens + outputTokens) / tokensPerSecond

For audio models:
  time = audioSeconds / audioSecondsPerSecond

For image models:
  time = (width × height × images) / pixelsPerSecond
```

## Examples

### Example 1: Optimistic vs Pessimistic

```javascript
// Optimistic (fast throughput)
const optimistic = estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  usage: usage.chat(1000, 200),
  throughput: { tokensPerSecond: 200 }
});

// Pessimistic (slow throughput)
const pessimistic = estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  usage: usage.chat(1000, 200),
  throughput: { tokensPerSecond: 50 }
});

console.log("Optimistic: ", optimistic.co2Grams, "g");
console.log("Pessimistic: ", pessimistic.co2Grams, "g");
```

### Example 2: Realistic Range

```javascript
// For a realistic estimate, use throughput range with estimateImpactRange
const result = estimateImpactRange({
  gpuPowerW: 350,
  region: "eu",
  usage: usage.chat(1000, 200)
}, {
  tokensPerSecond: { min: 80, max: 120 }
});
```

---

## See Also

- 📖 [estimateImpact()](/api/estimate-impact.md) - Main function
- 📖 [Input Options](/input-options/) - All parameters
