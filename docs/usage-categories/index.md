# Usage Categories

Detailed examples for each supported model category.

## Supported Categories

| Category | Input Type | Throughput | Example Models |
|----------|------------|------------|----------------|
| `chat.completions` | tokens | tokensPerSecond | GPT-4, Claude, Llama 3 |
| `text.completions` | tokens | tokensPerSecond | GPT-3.5, Falcon |
| `embeddings` | tokens | tokensPerSecond | Sentence-BERT, OpenAI Embeddings |
| `ocr` | tokens | tokensPerSecond | Tesseract, GPT-4V |
| `audio.transcription` | seconds | audioSecondsPerSecond | Whisper, Whisper Large |
| `audio.translation` | seconds | audioSecondsPerSecond | Whisper, Multilingual models |
| `audio.speech` | seconds | audioSecondsPerSecond | TTS models, ElevenLabs |
| `image.generation` | pixels | pixelsPerSecond | DALL·E, Stable Diffusion |

---

## Chat Completions

Calculates impact for chat-based AI models (input + output tokens).

### Example

```javascript
import { estimateImpact, usage } from "ai-footprint";

const result = estimateImpact({
  gpuPowerW: 350,
  modelParamsB: 70,
  region: "eu",
  usage: usage.chat(1200, 400),
  throughput: { tokensPerSecond: 90 }
});

console.log(result.co2Grams);  // ~0.59 g
```

### Parameters

- **inputTokens**: Number of input tokens
- **outputTokens**: Number of output tokens
- **throughput.tokensPerSecond**: Tokens generated per second

---

## Embeddings

Calculates impact for embedding models (text-to-vector representations).

### Example

```javascript
const result = estimateImpact({
  gpuPowerW: 250,
  modelParamsB: 7,
  region: "us",
  usage: usage.embeddings(1800),
  throughput: { tokensPerSecond: 300 }
});
```

### Notes

- Only requires input tokens (embeddings don't generate output)
- Often run in batches for efficiency

---

## Audio Transcription

Calculates impact for speech-to-text models.

### Example

```javascript
const result = estimateImpact({
  gpuPowerW: 300,
  modelParamsB: 1.5,
  region: "uk",
  usage: usage.audioTranscription(120),
  throughput: { audioSecondsPerSecond: 0.5 }
});

// 120 seconds of audio processed at 0.5x real-time (2x slower)
```

### Parameters

- **audioSeconds**: Duration of audio in seconds
- **throughput.audioSecondsPerSecond**: Real-time factor (1.0 = real-time)

---

## Audio Translation

Calculates impact for audio translation models.

### Example

```javascript
const result = estimateImpact({
  gpuPowerW: 300,
  region: "fr",
  usage: usage.audioTranslation(180),
  throughput: { audioSecondsPerSecond: 0.4 }
});
```

---

## Audio Speech

Calculates impact for text-to-speech models.

### Example

```javascript
const result = estimateImpact({
  gpuPowerW: 280,
  region: "ca",
  usage: usage.audioSpeech(60),
  throughput: { audioSecondsPerSecond: 0.8 }
});

// 60 seconds of speech generated at 0.8x real-time
```

---

## Image Generation

Calculates impact for image generation models.

### Example

```javascript
const result = estimateImpact({
  gpuPowerW: 320,
  modelParamsB: 20,
  region: "de",
  usage: usage.imageGeneration(1024, 1024, 2),
  throughput: { pixelsPerSecond: 120000 }
});

// Two 1024x1024 images generated
```

### Parameters

- **width**: Image width in pixels
- **height**: Image height in pixels
- **images**: Number of images to generate (default: 1)
- **throughput.pixelsPerSecond**: Pixel generation rate

### Total Pixels Formula

```
Total Pixels = width × height × images
```

---

## OCR (Optical Character Recognition)

Calculates impact for OCR models that convert images to text.

### Example

```javascript
const result = estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  usage: usage.ocr(2000, 300),
  throughput: { tokensPerSecond: 150 }
});
```

---

## Complete Comparison Example

```javascript
import { estimateImpact, usage, aggregateImpacts } from "ai-footprint";

const requestTypes = [
  estimateImpact({
    gpuPowerW: 350,
    region: "eu",
    usage: usage.chat(1000, 200),
    throughput: { tokensPerSecond: 100 }
  }),
  estimateImpact({
    gpuPowerW: 250,
    region: "eu",
    usage: usage.embeddings(500),
    throughput: { tokensPerSecond: 300 }
  }),
  estimateImpact({
    gpuPowerW: 300,
    region: "eu",
    usage: usage.audioTranscription(60),
    throughput: { audioSecondsPerSecond: 0.5 }
  }),
  estimateImpact({
    gpuPowerW: 320,
    region: "eu",
    usage: usage.imageGeneration(512, 512, 1),
    throughput: { pixelsPerSecond: 50000 }
  })
];

const total = aggregateImpacts(requestTypes);

console.log("Total Impact:");
console.log(`  Requests: ${total.count}`);
console.log(`  Energy: ${total.energyKwh.toFixed(4)} kWh`);
console.log(`  CO2: ${total.co2Grams.toFixed(2)} g`);
```

---

## See Also

- 📖 [API Reference](/api/) - Complete function documentation
- ⚙️ [Throughput Configuration](/input-options/throughput-config) - Performance metrics details
