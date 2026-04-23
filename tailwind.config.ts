import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme inspired by OpenSearch
        'bg-base': '#070b14',
        'bg-panel': '#0d1420',
        'bg-card': '#111927',
        'bg-hover': '#162030',
        'border': '#1e2d42',
        'border-bright': '#2a3f5c',
        'accent': '#00d4ff',
        'accent-dim': 'rgba(0,212,255,0.12)',
        'accent2': '#7c3aed',
        'accent3': '#10b981',
        'accent4': '#f59e0b',
        'danger': '#ef4444',
        'warning': '#f59e0b',
        'success': '#10b981',
        'text-primary': '#e2eaf5',
        'text-secondary': '#7a9bbf',
        'text-dim': '#3d5470',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Syne', 'sans-serif'],
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

export default config
