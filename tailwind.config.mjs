/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554'
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712'
        }
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#374151',
            hr: {
              borderColor: '#e5e7eb',
              marginTop: '2rem',
              marginBottom: '2rem'
            },
            'h1, h2, h3, h4': {
              color: '#111827'
            },
            'code::before': {
              content: '""'
            },
            'code::after': {
              content: '""'
            },
            code: {
              backgroundColor: '#f3f4f6',
              borderRadius: '0.375rem',
              paddingLeft: '0.375rem',
              paddingRight: '0.375rem',
              paddingTop: '0.125rem',
              paddingBottom: '0.125rem',
              fontSize: '0.875em',
              fontWeight: '400'
            },
            pre: {
              backgroundColor: '#1f2937',
              borderRadius: '0.5rem'
            }
          }
        },
        invert: {
          css: {
            color: '#d1d5db',
            'h1, h2, h3, h4': {
              color: '#f9fafb'
            },
            code: {
              backgroundColor: '#374151',
              color: '#e5e7eb'
            }
          }
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography')
  ]
};