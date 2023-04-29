/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#010409',
        nav: '#161B22',
        aside: '#0D1117',
        links: '#2f81f7',
        secondary: '#21262D',
        'secondary-border': '#363B42',
        'secondary-text': '#7D8590'
      }
    }
  },
  plugins: []
}
