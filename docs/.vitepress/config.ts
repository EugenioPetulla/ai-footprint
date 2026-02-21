import DefaultTheme from "vitepress/theme";

/** @type {import('vitepress').UserConfig} */
export default {
  base: "/ai-footprint/",
  title: "ai-footprint",
  description:
    "Deterministic CO2 and energy impact calculator for AI inference calls",

  lang: "en-US",
  lastUpdated: true,

  themeConfig: {
    logo: "/logo.png",

    nav: [
      { text: "Home", link: "/" },
      { text: "Getting Started", link: "/getting-started/" },
      { text: "API Reference", link: "/api/" },
      { text: "Usage Categories", link: "/usage-categories/" },
      { text: "Input Options", link: "/input-options/" },
      { text: "Advanced", link: "/advanced/" },
    ],

    sidebar: {
      "/": [
        {
          text: "Getting Started",
          collapsed: false,
          items: [
            { text: "Introduction", link: "/getting-started/" },
            { text: "Installation", link: "/getting-started/installation.md" },
            { text: "Basic Usage", link: "/getting-started/basic-usage.md" },
          ],
        },
        {
          text: "API Reference",
          collapsed: false,
          items: [
            { text: "Overview", link: "/api/" },
            { text: "estimateImpact", link: "/api/estimate-impact.md" },
            {
              text: "estimateImpactMinimal",
              link: "/api/estimate-impact-minimal.md",
            },
            {
              text: "estimateImpactRange",
              link: "/api/estimate-impact-range.md",
            },
            { text: "aggregateImpacts", link: "/api/aggregate-impacts.md" },
            { text: "usage Helpers", link: "/api/usage-helpers.md" },
          ],
        },
        {
          text: "Usage Categories",
          collapsed: false,
          items: [
            { text: "Overview", link: "/usage-categories/" },
            {
              text: "Chat Completions",
              link: "/usage-categories/chat-completions.md",
            },
            {
              text: "Text Completions",
              link: "/usage-categories/text-completions.md",
            },
            { text: "Embeddings", link: "/usage-categories/embeddings.md" },
            { text: "OCR", link: "/usage-categories/ocr.md" },
            {
              text: "Audio Transcription",
              link: "/usage-categories/audio-transcription.md",
            },
            {
              text: "Audio Translation",
              link: "/usage-categories/audio-translation.md",
            },
            { text: "Audio Speech", link: "/usage-categories/audio-speech.md" },
            {
              text: "Image Generation",
              link: "/usage-categories/image-generation.md",
            },
          ],
        },
        {
          text: "Input Options",
          collapsed: false,
          items: [
            { text: "Overview", link: "/input-options/" },
            {
              text: "Region & Grid Intensity",
              link: "/input-options/region-grid.md",
            },
            {
              text: "Throughput Configuration",
              link: "/input-options/throughput-config.md",
            },
            {
              text: "Efficiency Options",
              link: "/input-options/efficiency-options.md",
            },
            {
              text: "Energy Override",
              link: "/input-options/energy-override.md",
            },
          ],
        },
        {
          text: "Advanced Features",
          collapsed: false,
          items: [
            { text: "Overview", link: "/advanced/" },
            {
              text: "Uncertainty Ranges",
              link: "/advanced/uncertainty-ranges.md",
            },
            {
              text: "Batch Aggregation",
              link: "/advanced/batch-aggregation.md",
            },
            {
              text: "Dynamic Grid Intensity",
              link: "/advanced/dynamic-grid-intensity.md",
            },
            {
              text: "Custom Grid Resolvers",
              link: "/advanced/custom-grid-resolvers.md",
            },
          ],
        },
      ],
    },

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/EugenioPetulla/ai-footprint",
      },
    ],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2026 Eugenio Petullà",
    },

    editLink: {
      pattern:
        "https://github.com/EugenioPetulla/ai-footprint/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },

    docFooter: {
      prev: "Prev",
      next: "Next",
    },

    outline: {
      label: "On this page",
      level: [2, 3],
    },
  },

  head: [
    ["link", { rel: "icon", type: "image/png", href: "/logo.png" }],
    ["meta", { name: "theme-color", content: "#0ea5e9" }],
    [
      "meta",
      {
        name: "og:title",
        content: "ai-footprint - CO2 & Energy Impact Calculator",
      },
    ],
    [
      "meta",
      {
        name: "og:description",
        content:
          "Deterministic CO2 and energy impact calculator for AI inference calls",
      },
    ],
    [
      "meta",
      {
        name: "og:image",
        content:
          "https://opengraph.githubusercontent.com/EugenioPetulla/ai-footprint",
      },
    ],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
  ],
};
