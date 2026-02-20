# Installation

ai-footprint is available on npm and works in both ESM and CJS projects.

## npm

```bash
npm install ai-footprint
```

## yarn

```bash
yarn add ai-footprint
```

## pnpm

```bash
pnpm add ai-footprint
```

---

## Requirements

- Node.js 18+ (for ESM support)
- TypeScript 5+ (recommended for type checking)

---

## Browser Support

ai-footprint is a pure calculation library with no browser-specific dependencies. It works in:
- Node.js applications
- Browser applications (via bundlers like Vite, Webpack, etc.)
- Edge functions (Cloudflare Workers, Vercel Edge, etc.)

---

## Importing

### ESM (Modern JavaScript/TypeScript)

```javascript
import { estimateImpact, usage } from "ai-footprint";
```

### CJS (CommonJS/Node.js)

```javascript
const { estimateImpact, usage } = require("ai-footprint");
```

### CDN (UMD - for direct browser usage)

```html
<script src="https://unpkg.com/ai-footprint/dist/index.global.js"></script>
<script>
  const { estimateImpact, usage } = window.aiFootprint;
</script>
```

---

## TypeScript Support

ai-footprint is written in TypeScript and includes full type definitions:

```typescript
import type { ImpactResult } from "ai-footprint";

const result: ImpactResult = estimateImpact({
  gpuPowerW: 350,
  modelParamsB: 70,
  region: "eu",
  usage: usage.chat(1200, 400)
});
```

---

## Verifying Installation

Create a test file `test.js`:

```javascript
import { estimateImpact, usage } from "ai-footprint";

const result = estimateImpact({
  gpuPowerW: 350,
  modelParamsB: 70,
  region: "eu",
  usage: usage.chat(1200, 400),
  throughput: { tokensPerSecond: 90 }
});

console.log("Energy:", result.energyKwh, "kWh");
console.log("CO2:", result.co2Grams, "g");
```

Run it:

```bash
node test.js
```

Expected output:
```
Energy: 0.0028 kWh
CO2: 0.59 g
```

---

## Next Steps

- 🚀 Read the [Quick Start](/getting-started/) guide
- 📖 Explore the [API Reference](/api/)
- 💡 Check out [Usage Examples](/usage-categories/)
