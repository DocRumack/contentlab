/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Container-specific colors from testconstructor001
        'problem-solver-bg': 'transparent',
        'lesson-desc-bg': '#d8d8d8',
        'preview-box-bg': '#5a6268',
        'review-box-bg': '#f8f8f8'
      },
      height: {
        'container': 'calc(100vh - 3rem)', // Full height minus header
        'preview': 'calc(50% - 1.5rem)',   // Half height minus header
        'tools': '50%'                      // Half height
      }
    },
  },
  plugins: [],
}
