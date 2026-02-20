# Documentation

This is the source for the ai-footprint documentation site, built with VitePress.

## Structure

```
docs/
├── index.md                          # Landing page (modified from repository README)
├── getting-started/                  # Installation and beginner guides
│   ├── index.md
│   ├── installation.md
│   └── basic-usage.md
├── api/                              # API reference (manual + examples)
│   ├── index.md
│   ├── estimate-impact.md
│   ├── estimate-impact-minimal.md
│   ├── estimate-impact-range.md
│   ├── aggregate-impacts.md
│   └── usage-helpers.md
├── usage-categories/                 # Category-specific examples
│   ├── index.md
│   ├── chat-completions.md
│   ├── embeddings.md
│   ├── audio-transcription.md
│   └── image-generation.md
├── input-options/                    # Detailed parameter documentation
│   ├── index.md
│   ├── region-grid.md
│   ├── throughput-config.md
│   └── efficiency-options.md
├── advanced/                         # Advanced features
│   ├── index.md
│   ├── uncertainty-ranges.md
│   ├── batch-aggregation.md
│   ├── dynamic-grid-intensity.md
│   └── custom-grid-resolvers.md
└── .vitepress/                       # VitePress configuration
    ├── config.ts
    └── theme/
        ├── custom.css
        └── index.ts
```

## Development

### Start dev server

```bash
npm run docs:dev
```

The documentation will be available at `http://localhost:5173`

### Build for production

```bash
npm run docs:build
```

### Preview production build

```bash
npm run docs:preview
```

## Deployment

The documentation is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

### Manual deployment

```bash
npm run docs:deploy
```

This builds the site and deploys it to the `gh-pages` branch.

## Customization

### Theme

The theme is dark with ai-footprint branding colors (cyan `#0ea5e9`). Custom styles are in `docs/.vitepress/theme/custom.css`.

### Navigation

Edit `docs/.vitepress/config.ts` to modify navigation and sidebar.

### Content

All documentation is written in Markdown in the `docs/` directory.

## License

MIT - See LICENSE file in the repository root.
