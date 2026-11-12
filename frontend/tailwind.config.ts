import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  "extend": {
    "colors": {
      "secondary": "#9aecff",
      "primary": "#cdffde",
      "background": "#101418",
      "tertiary-container": "#ffce95",
      "primary-fixed": "#50ffaf",
      "on-primary-container": "#006b43",
      "inverse-surface": "#e0e3e8",
      "secondary-container": "#00d7f4",
      "surface-dim": "#101418",
      "tertiary-fixed": "#ffddb8",
      "surface-variant": "#31353a",
      "on-surface": "#e0e3e8",
      "outline-variant": "#3b4a40",
      "surface-tint": "#00e293",
      "error-container": "#93000a",
      "on-secondary": "#00363f",
      "surface-container-lowest": "#0b0f13",
      "on-secondary-fixed-variant": "#004e5a",
      "secondary-fixed-dim": "#0ad9f8",
      "on-primary-fixed": "#002111",
      "error": "#ffb4ab",
      "primary-fixed-dim": "#00e293",
      "on-tertiary-fixed-variant": "#653e00",
      "surface-container-low": "#181c20",
      "surface": "#101418",
      "tertiary-fixed-dim": "#ffb95f",
      "inverse-on-surface": "#2d3135",
      "surface-container-high": "#262a2f",
      "surface-bright": "#363a3e",
      "on-background": "#e0e3e8",
      "outline": "#849588",
      "on-tertiary-container": "#835200",
      "tertiary": "#fff1e4",
      "on-error": "#690005",
      "on-primary": "#003921",
      "on-tertiary-fixed": "#2a1700",
      "on-surface-variant": "#b9cbbd",
      "on-secondary-fixed": "#001f25",
      "inverse-primary": "#006c44",
      "primary-container": "#00f5a0",
      "secondary-fixed": "#a5eeff",
      "surface-container": "#1c2024",
      "surface-container-highest": "#31353a",
      "on-error-container": "#ffdad6",
      "on-tertiary": "#472a00",
      "on-secondary-container": "#005966",
      "on-primary-fixed-variant": "#005232"
    },
    "borderRadius": {
      "DEFAULT": "0.125rem",
      "lg": "0.25rem",
      "xl": "0.5rem",
      "full": "0.75rem"
    },
    "spacing": {
      "margin": "1rem",
      "margin-desktop": "2.5rem",
      "space-xs": "0.25rem",
      "space-lg": "1.5rem",
      "gutter": "1.25rem",
      "space-sm": "0.5rem",
      "margin-tablet": "1.5rem",
      "gutter-desktop": "1.5rem",
      "space-xl": "2.5rem",
      "space-md": "0.875rem"
    },
    "fontFamily": {
      "body-lg": [
        "Geist"
      ],
      "headline-md": [
        "Geist"
      ],
      "code-block": [
        "JetBrains Mono"
      ],
      "label-mono-sm": [
        "JetBrains Mono"
      ],
      "headline-lg-mobile": [
        "Geist"
      ],
      "display-hero": [
        "Geist"
      ],
      "body-md": [
        "Geist"
      ],
      "headline-lg": [
        "Geist"
      ],
      "body-sm": [
        "Geist"
      ],
      "display-hero-mobile": [
        "Geist"
      ],
      "code-inline": [
        "JetBrains Mono"
      ],
      "headline-sm": [
        "Geist"
      ],
      "label-ui": [
        "Geist"
      ]
    },
    "fontSize": {
      "body-lg": [
        "1.0625rem",
        {
          "lineHeight": "1.75rem",
          "letterSpacing": "-0.005em",
          "fontWeight": "400"
        }
      ],
      "headline-md": [
        "1.5rem",
        {
          "lineHeight": "2rem",
          "letterSpacing": "-0.015em",
          "fontWeight": "500"
        }
      ],
      "code-block": [
        "0.8125rem",
        {
          "lineHeight": "1.45rem",
          "letterSpacing": "0em",
          "fontWeight": "400"
        }
      ],
      "label-mono-sm": [
        "0.6875rem",
        {
          "lineHeight": "1rem",
          "letterSpacing": "0.04em",
          "fontWeight": "500"
        }
      ],
      "headline-lg-mobile": [
        "1.75rem",
        {
          "lineHeight": "2.25rem",
          "letterSpacing": "-0.02em",
          "fontWeight": "600"
        }
      ],
      "display-hero": [
        "4rem",
        {
          "lineHeight": "4.5rem",
          "letterSpacing": "-0.035em",
          "fontWeight": "600"
        }
      ],
      "body-md": [
        "0.9375rem",
        {
          "lineHeight": "1.5rem",
          "letterSpacing": "0em",
          "fontWeight": "400"
        }
      ],
      "headline-lg": [
        "2.25rem",
        {
          "lineHeight": "2.75rem",
          "letterSpacing": "-0.025em",
          "fontWeight": "600"
        }
      ],
      "body-sm": [
        "0.8125rem",
        {
          "lineHeight": "1.25rem",
          "letterSpacing": "0.005em",
          "fontWeight": "400"
        }
      ],
      "display-hero-mobile": [
        "2.5rem",
        {
          "lineHeight": "3rem",
          "letterSpacing": "-0.025em",
          "fontWeight": "600"
        }
      ],
      "code-inline": [
        "0.875rem",
        {
          "lineHeight": "1.375rem",
          "letterSpacing": "-0.01em",
          "fontWeight": "400"
        }
      ],
      "headline-sm": [
        "1.125rem",
        {
          "lineHeight": "1.625rem",
          "letterSpacing": "-0.01em",
          "fontWeight": "500"
        }
      ],
      "label-ui": [
        "0.8125rem",
        {
          "lineHeight": "1.125rem",
          "letterSpacing": "0em",
          "fontWeight": "500"
        }
      ]
    }
  }
}
};

export default config;
