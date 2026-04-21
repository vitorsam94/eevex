import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    '../../apps/*/src/**/*.{ts,tsx}',
    '../../apps/*/app/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ─── Eevex Design System ───────────────────────
        bg: {
          DEFAULT: '#0A0A0F',
          elev: '#11111A',
          'elev-2': '#16161F',
          soft: '#1C1C26',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.07)',
          strong: 'rgba(255,255,255,0.12)',
        },
        fg: {
          DEFAULT: '#F0F0F5',
          muted: '#9A9AA8',
          dim: '#5A5A68',
        },
        primary: {
          DEFAULT: '#7C5CFF',
          soft: 'rgba(124,92,255,0.12)',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#00E5B8',
          foreground: '#0A0A0F',
        },
        warn: {
          DEFAULT: '#FFB547',
          foreground: '#0A0A0F',
        },
        danger: {
          DEFAULT: '#FF5470',
          foreground: '#FFFFFF',
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
        '2xl': '32px',
      },
      spacing: {
        unit: '8px',
      },
      boxShadow: {
        ticket: '0 24px 60px -20px rgba(124,92,255,0.3), 0 0 0 1px rgba(255,255,255,0.04)',
        card: '0 4px 24px -8px rgba(0,0,0,0.4)',
        glow: '0 0 40px rgba(124,92,255,0.2)',
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)',
        'gradient-primary': 'linear-gradient(135deg, #7C5CFF 0%, #00E5B8 100%)',
        'gradient-event': 'linear-gradient(160deg, rgba(124,92,255,0.4), rgba(0,229,184,0.2))',
      },
      backgroundSize: {
        grid: '24px 24px',
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
