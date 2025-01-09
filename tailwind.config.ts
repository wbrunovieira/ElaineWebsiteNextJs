import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F5EDE1', // Bege suave como cor base
        foreground: '#2B2D42', // Cinza escuro para textos
        primary: '#E63946', // Vermelho rubi
        secondary: '#F4A261', // Laranja pastel
        accent: '#06D6A0', // Verde água
        muted: '#8D99AE', // Cinza azulado
        border: '#E0E0E0', // Cinza claro para bordas
        card: '#FFFFFF', // Branco puro para cartões
        input: '#FFFFFF', // Branco puro para inputs
        destructive: '#D90429', // Vermelho intenso para alertas
      },
      aspectRatio: {
        '16/9': '16 / 9',
        '4/3': '4 / 3',
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        lato: ['Lato', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/aspect-ratio'),
  ],
} satisfies Config;
