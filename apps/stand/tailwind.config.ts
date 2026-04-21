import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0A0A0F',
          elev: '#11111A',
          'elev-2': '#16161F',
          soft: '#1C1C26',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          strong: 'rgba(255,255,255,0.16)',
        },
        primary: {
          DEFAULT: '#7C5CFF',
          soft: 'rgba(124,92,255,0.12)',
        },
        accent: {
          DEFAULT: '#00E5B8',
          soft: 'rgba(0,229,184,0.12)',
        },
        warn: '#FFB547',
        danger: '#FF5470',
        fg: {
          DEFAULT: '#F0F0F5',
          muted: '#9A9AA8',
          dim: '#5A5A68',
        },
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        serif: ['Instrument Serif', 'serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '24px',
      },
    },
  },
  plugins: [],
}

export default config
