module.exports = {
  purge: ['./components/**/*.{js,ts,jsx,tsx}', './pages/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Martel', 'sans-serif'],
      serif: ['Martel', 'sans-serif'],
      mono: ['Martel', 'sans-serif'],
      display: ['Martel', 'sans-serif'],
      body: ['Martel', 'sans-serif'],
    },
    extend: {
      colors: {
        'accent-1': '#333',
      },
    },
  },
  variants: {},
  plugins: [],
}
