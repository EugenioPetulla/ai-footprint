# usage Helpers

Convenience functions for creating usage objects with strict TypeScript types.

## Functions

All usage functions return properly typed usage objects for their respective model categories.

### chat()

Creates usage object for chat completions (e.g., GPT-3.5, GPT-4, Claude).

```typescript
function chat(inputTokens: number, outputTokens: number): ChatCompletionUsage
```

**Parameters:**
- `inputTokens`: Number of input tokens
- `outputTokens`: Number of output tokens

**Example:**
```javascript
const usageObject = usage.chat(1200, 400);
// Returns: { category: "chat.completions", inputTokens: 1200, outputTokens: 400 }
```

---

### text()

Creates usage object for text completions.

```typescript
function text(inputTokens: number, outputTokens: number): TextCompletionUsage
```

**Parameters:**
- `inputTokens`: Number of input tokens
- `outputTokens`: Number of output tokens

**Example:**
```javascript
const usageObject = usage.text(800, 150);
```

---

### embeddings()

Creates usage object for embeddings (text vector representations).

```typescript
function embeddings(inputTokens: number): EmbeddingsUsage
```

**Parameters:**
- `inputTokens`: Number of input tokens

**Example:**
```javascript
const usageObject = usage.embeddings(500);
```

---

### ocr()

Creates usage object for OCR (optical character recognition).

```typescript
function ocr(inputTokens: number, outputTokens: number): OcrUsage
```

**Parameters:**
- `inputTokens`: Number of input tokens
- `outputTokens`: Number of output tokens

**Example:**
```javascript
const usageObject = usage.ocr(2000, 300);
```

---

### audioTranscription()

Creates usage object for audio transcription (speech-to-text).

```typescript
function audioTranscription(audioSeconds: number): AudioTranscriptionUsage
```

**Parameters:**
- `audioSeconds`: Duration of audio in seconds

**Example:**
```javascript
const usageObject = usage.audioTranscription(120);
// For a 2-minute audio file
```

---

### audioTranslation()

Creates usage object for audio translation.

```typescript
function audioTranslation(audioSeconds: number): AudioTranslationUsage
```

**Parameters:**
- `audioSeconds`: Duration of audio in seconds

**Example:**
```javascript
const usageObject = usage.audioTranslation(180);
// For a 3-minute audio file
```

---

### audioSpeech()

Creates usage object for audio speech generation (text-to-speech).

```typescript
function audioSpeech(audioSeconds: number): AudioSpeechUsage
```

**Parameters:**
- `audioSeconds`: Duration of audio to generate in seconds

**Example:**
```javascript
const usageObject = usage.audioSpeech(60);
// For a 1-minute speech output
```

---

### imageGeneration()

Creates usage object for image generation (e.g., DALL·E, Stable Diffusion).

```typescript
function imageGeneration(width: number, height: number, images?: number): ImageGenerationUsage
```

**Parameters:**
- `width`: Image width in pixels
- `height`: Image height in pixels
- `images`: Number of images (default: 1)

**Example:**
```javascript
// Single 1024x1024 image
const usageObject = usage.imageGeneration(1024, 1024);

// Multiple images
const usageObject = usage.imageGeneration(512, 512, 4);
```

---

## Complete Usage Examples

### Chat Completions

```javascript
import { estimateImpact, usage } from "ai-footprint";

const result = estimateImpact({
  gpuPowerW: 350,
  region: "eu",
  usage: usage.chat(1500, 300),
  throughput: { tokensPerSecond: 100 }
});
```

### Embeddings with Batch

```javascript
const embeddingsUsed = usage.embeddings(500);

const result = estimateImpact({
  gpuPowerW: 250,
  region: "us",
  usage: embeddingsUsed,
  throughput: { tokensPerSecond: 300 }
});
```

### Audio Processing

```javascript
const transcription = usage.audioTranscription(120); // 2 minutes

const result = estimateImpact({
  gpuPowerW: 300,
  region: "uk",
  usage: transcription,
  throughput: { audioSecondsPerSecond: 0.5 } // 2x real-time
});
```

### Image Generation

```javascript
const generation = usage.imageGeneration(1024, 1024, 4);

const result = estimateImpact({
  gpuPowerW: 320,
  region: "de",
  usage: generation,
  throughput: { pixelsPerSecond: 100000 }
});
```

---

## Return Types

Each usage function returns a specific type:

```typescript
interface ChatCompletionUsage {
  category: "chat.completions";
  inputTokens: number;
  outputTokens: number;
  processingTimeSeconds?: number;
}

interface EmbeddingsUsage {
  category: "embeddings";
  inputTokens: number;
  processingTimeSeconds?: number;
}

interface AudioTranscriptionUsage {
  category: "audio.transcription";
  audioSeconds: number;
  processingTimeSeconds?: number;
}

interface ImageGenerationUsage {
  category: "image.generation";
  width: number;
  height: number;
  images: number;
  processingTimeSeconds?: number;
}
```

---

## See Also

- 📖 [estimateImpact()](/api/estimate-impact.md) - Main calculation function
- 📖 [Throughput Configuration](/input-options/throughput-config) - Learn about performance metrics
